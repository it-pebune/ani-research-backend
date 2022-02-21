/**
 * Setup the winston logger.
 *
 * Documentation: https://github.com/winstonjs/winston
 */

import { inspect } from 'util';
import httpContext from 'express-http-context';
import { createLogger, format, transports } from 'winston';
import AzureTableTransport from './winston-azuretable';
import { appConfig, getHttpCtxUser, getHttpCtxReqId, hasKey } from '~shared';
const { printf } = format;

const appCfg = appConfig();

const azureFormat = format((info) => {
  const reqId = getHttpCtxReqId(httpContext);
  const user = getHttpCtxUser(httpContext);

  if (reqId) {
    info.reqId = reqId;
  }
  if (user) {
    info.sessionId = user.sessionId;
  }

  return info;
});

// Import Functions
const { Console } = transports;

// Init Logger
const winstonLogger = createLogger({
  level: 'debug'
});

const winstonUiLogger = createLogger({
  level: 'debug'
});

/**
 * For production write to all logs with level `info` and below
 * to `combined.log. Write all logs error (and below) to `error.log`.
 * For development, print to the console.
 */
if (appCfg.nodeEnv === 'production' || appCfg.nodeEnv === 'staging') {
  const azureTransport = new AzureTableTransport({
    connectionString: appCfg.storageGenCnnString,
    tableName: appCfg.logTableName || (`rpbresearch${appCfg.nodeEnv}`),
    partition: 'research',
    level: (appCfg.nodeEnv === 'staging' ? 'debug' : 'debug'),
    format: azureFormat()
  });
  winstonLogger.add(azureTransport);

  const azureTransportUI = new AzureTableTransport({
    connectionString: appCfg.storageGenCnnString,
    tableName: appCfg.logUITableName || (`rpbresearch${appCfg.nodeEnv}ui`),
    partition: 'research',
    level: (appCfg.nodeEnv === 'staging' ? 'debug' : 'debug'),
    format: azureFormat()
  });
  winstonUiLogger.add(azureTransportUI);
} else {
  const consoleFormat = printf((info) => {
    const opts = {
      depth: 5,
      colors: true
    };
    const stripped = Object.getOwnPropertyNames(info)
      .reduce((all: any, valKey: string) => {
        return {
          ...all,
          [valKey]: hasKey(info, valKey) ? info[valKey] : null
        };
      }, {});
    delete stripped.level;
    delete stripped.timestamp;
    const shouldInspect = true;

    return `${info.timestamp} ${info.level}: ${shouldInspect ? inspect(stripped, opts) : info.message}`;
  });

  const consoleTransport = new Console({
    format: format.combine(
      format.timestamp(),
      format.json(),
      format.colorize(),
      format.simple(),
      consoleFormat
    )
  });
  winstonLogger.add(consoleTransport);

  const consoleFormatUI = printf((info) => {
    const opts = {
      depth: 5,
      colors: true
    };
    const stripped = Object.getOwnPropertyNames(info)
      .reduce((all: any, valKey: string) => {
        return {
          ...all,
          [valKey]: hasKey(info, valKey) ? info[valKey] : null
        };
      }, {});
    delete stripped.level;
    delete stripped.timestamp;
    const shouldInspect = true;

    return `${info.timestamp} ${info.level} UI: ${shouldInspect ? inspect(stripped, opts) : info.message}`;
  });

  const consoleTransportUI = new Console({
    format: format.combine(
      format.timestamp(),
      format.json(),
      format.colorize(),
      format.simple(),
      consoleFormatUI
    )
  });
  winstonUiLogger.add(consoleTransportUI);
}

// Export logger
export const logger = winstonLogger;
export const uilogger = winstonUiLogger;

export const loggerStream = {
  write: (message: any) => {
    winstonLogger.info(message);
  }
};
