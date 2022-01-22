/**
 * winston-azure-table-storage
 * Copyright(c) 2017 Ramji Piramanayagam
 * Apache 2.0 Licensed
 */

import Transport from 'winston-transport';
import { TableClient, TableTransaction } from '@azure/data-tables';
import { padValue } from './utils';
import { inspect } from 'util';

// tslint:disable-next-line: no-console
const logerr = console.error.bind(console);

const DATE_MAX = new Date(3000, 1).getTime();

/**
 * Custom transport
 */
class WinstonAzureTable extends Transport {
  private name: string;
  private tableName: string;
  private metaAsColumns: boolean;
  private partition: string;
  private trans: TableTransaction;
  private transCheckId: NodeJS.Timeout | undefined;
  private ROW_KEY_INDEX: number;
  private rowKeyBuilder: () => string;
  private tableClient: TableClient;


  /**
   * @param {*} options
   */
  constructor(options: any) {
    super(options);
    options = options || {};

    this.name = 'azure';
    this.tableName = options.tableName || 'log';
    this.level = options.level || 'info';
    this.silent = options.silent || false;
    this.metaAsColumns = options.metaAsColumns || false;
    this.partition = options.partition || 'log';

    this.trans = new TableTransaction();

    this.ROW_KEY_INDEX = 0;
    const rowKeyBuilder = () => {
      this.ROW_KEY_INDEX++;
      return (DATE_MAX - new Date().getTime()) + padValue(this.ROW_KEY_INDEX, 10);
    };
    this.rowKeyBuilder = options.rowKeyBuilder || rowKeyBuilder;

    this.tableClient = TableClient.fromConnectionString(options.connectionString, this.tableName);
    this.tableClient
      .createTable()
      .then(() => {
        if (options.callback) {
          options.callback();
        }
      })
      .catch((err) => {
        if (err) {
          logerr(err);
          this.emit('error', err);
        }

        if (options.callback) {
          options.callback();
        }
      });
  }

  /**
   * @param {*} meta
   * @param {*} callback
   * @return {void}
   */
  public log(meta: any, callback: any) {
    if (this.silent) {
      return callback ? callback() : 0;
    }

    let msg = meta.message;
    if (meta.message && typeof meta.message === 'object') {
      msg = inspect(meta.message, { depth: 5 });
    }

    const entity: any = {
      PartitionKey: this.partition,
      RowKey: this.rowKeyBuilder(),
      hostname: require('os').hostname(),
      pid: process.pid,
      createdDateTime: { type: 'DateTime', value: new Date().toISOString() },
      session: meta.sessionId || '',
      req: meta.reqId || '',
      level: meta.level || '',
      msg
    };

    if (meta) {
      if (this.metaAsColumns) {
        for (const prop in meta) {
          if (typeof meta[prop] === 'object') {
            if (meta[prop] && meta[prop].toJSON) {
              entity[prop] = meta[prop].toJSON();
            } else {
              entity[prop] = JSON.stringify(meta[prop]);
            }
          } else {
            entity[prop] = meta[prop];
          }
        }
      } else {
        entity.meta = JSON.stringify(meta);
      }
    }

    if (this.transCheckId) {
      clearTimeout(this.transCheckId);
    }

    this.trans.createEntity(entity);
    if (this.trans.actions.length === 100) {
      const trans = this.trans;
      this.trans = new TableTransaction();
      this.tableClient.submitTransaction(trans.actions);
    }

    this.transCheckId = setTimeout(() => {
      this.checkTransStatus();
    }, 3000);

    if (callback) {
      callback(null, entity.RowKey);
    }
  }

  /**
   * Checks transaction status
   */
  public async checkTransStatus() {
    if (this.trans.actions.length > 0) {
      try {
        await this.tableClient.submitTransaction(this.trans.actions);
        this.trans = new TableTransaction();
        this.emit('logged');
      } catch (ex) {
        return logerr(new Date().toISOString(), ex);
      }
    }
  }
}

export default WinstonAzureTable;
