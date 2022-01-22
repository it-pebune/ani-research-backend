import { difference, flatten, pick, union, uniq, values } from 'lodash';

/**
 * Simple Access Control
 */
export class SimpleAclBackend {
  private _buckets: any;

  /**
   *
   */
  constructor() {
    this._buckets = {};
  }

  /**
   * Cleans the whole storage.
   */
  clean() {
    this._buckets = {};
  }

  /**
   * Gets the contents at the bucket's key
   * @param {string} bucket
   * @param {string|number} key
   * @return {any|any[]}
   */
  get(bucket: string, key: string | number): any | any[] {
    if (this._buckets[bucket]) {
      return this._buckets[bucket][key] || [];
    }
    return [];
  }

  /**
   * Gets the union of the keys in each of the specified buckets
   * @param {string[]} buckets
   * @param {string[]} keys
   * @return {any}
   */
  unions(buckets: string[], keys: string[]): any {
    const results: any = {};
    buckets.forEach((bucket) => {
      if (this._buckets[bucket]) {
        results[bucket] = uniq(flatten(values(pick(this._buckets[bucket], keys))));
      } else {
        results[bucket] = [];
      }
    });

    return results;
  }

  /**
   * Returns the union of the values in the given keys.
   * @param {string[]} bucket
   * @param {string[]} keys
   * @return {any[]}
   */
  union(bucket: string, keys: string[] | number[]): any[] {
    let match;
    let re;
    if (!this._buckets[bucket]) {
      Object.keys(this._buckets).some((b) => {
        re = new RegExp(`^${b}$`);
        match = re.test(bucket);
        if (match) {
          bucket = b;
        }
        return match;
      });
    }

    if (this._buckets[bucket]) {
      const keyArrays: any[] = [];
      for (let i = 0, len = keys.length; i < len; i++) {
        if (this._buckets[bucket][keys[i]]) {
          // eslint-disable-next-line prefer-spread
          keyArrays.push.apply(keyArrays, this._buckets[bucket][keys[i]]);
        }
      }
      return union(keyArrays);
    }

    return [];
  }

  /**
   * Adds values to a given key inside a bucket.
   * @param {string} bucket
   * @param {string|number} key
   * @param {any} vals
   */
  add(bucket: string, key: string | number, vals: any) {
    vals = this.makeArray(vals);

    if (!this._buckets[bucket]) {
      this._buckets[bucket] = {};
    }
    if (!this._buckets[bucket][key]) {
      this._buckets[bucket][key] = vals;
    } else {
      this._buckets[bucket][key] = union(vals, this._buckets[bucket][key]);
    }
  }

  /**
   * Delete the given key(s) at the bucket
   * @param {string} bucket
   * @param {string[]} keys
   */
  del(bucket: string, keys: string[]) {
    keys = this.makeArray(keys);

    if (this._buckets[bucket]) {
      for (let i = 0, len = keys.length; i < len; i++) {
        delete this._buckets[bucket][keys[i]];
      }
    }
  }

  /**
   * Removes values from a given key inside a bucket.
   * @param {string} bucket
   * @param {string|number} key
   * @param {any} vals
   */
  remove(bucket: string, key: string | number, vals: any) {
    vals = this.makeArray(vals);
    const old = this._buckets[bucket][key];
    if (this._buckets[bucket] && old) {
      this._buckets[bucket][key] = difference(old, vals);
    }
  }

  /**
   * @param {any} arr
   * @return {any[]}
   */
  private makeArray(arr: any): any[] {
    return Array.isArray(arr) ? arr : [arr];
  }
}
