import { FETCH_STRATEGIES } from './constants';
import type { TContextKeyAndArgs } from './types';
import * as utils from './utils';

export const recordCache = {
  records: new Map(),
  updaters: new Map(),
  get(contextKeyAndArgs: TContextKeyAndArgs, opts: any = {}) {
    const { cacheStrategy, fetchStrategy } = opts;

    let cacheKey = utils.getCacheKey({ contextKeyAndArgs, cacheStrategy });

    if (fetchStrategy === FETCH_STRATEGIES.FETCH_ONLY) return;

    return this.records.get(cacheKey);
  },
  set(contextKeyAndArgs: TContextKeyAndArgs, value: any, opts: any = {}) {
    const { cacheStrategy, fetchStrategy } = opts;

    let cacheKey = utils.getCacheKey({ contextKeyAndArgs, cacheStrategy });

    if (fetchStrategy === FETCH_STRATEGIES.FETCH_ONLY) return;

    return this.records.set(cacheKey, {
      ...value,
      updatedAt: new Date(),
    });
  },
  upsert(contextKeyAndArgs: TContextKeyAndArgs, value: any, opts: any = {}) {
    const { cacheStrategy, fetchStrategy } = opts;

    let cacheKey = utils.getCacheKey({ contextKeyAndArgs, cacheStrategy });

    if (fetchStrategy === FETCH_STRATEGIES.FETCH_ONLY) return;

    const currentValue = this.records.get(cacheKey);
    return this.records.set(cacheKey, {
      ...currentValue,
      ...value,
      updatedAt: new Date(),
    });
  },
  invalidate(contextKeyAndArgs: TContextKeyAndArgs, opts: any = {}) {
    const { cacheStrategy } = opts;

    let cacheKey = utils.getCacheKey({ contextKeyAndArgs, cacheStrategy });

    const [_, args] = utils.getContextKeyAndArgs(contextKeyAndArgs);

    const updaters = this.updaters.get(cacheKey);
    console.log(updaters);
    if (updaters) {
      updaters.forEach((updater: any) => updater.invoke?.(...args));
    }
  },
  broadcastChanges(contextKeyAndArgs: TContextKeyAndArgs, data: any, opts: any = {}) {
    const { cacheStrategy } = opts;

    let cacheKey = utils.getCacheKey({ contextKeyAndArgs, cacheStrategy });

    const updaters = this.updaters.get(cacheKey);
    if (updaters) {
      updaters.forEach((updater: any) => updater.setSuccess({ isBroadcast: true }, data));
    }
  },
  setSuccess(contextKeyAndArgs: TContextKeyAndArgs, data: any, opts: any = {}) {
    this.broadcastChanges(contextKeyAndArgs, data, opts);
  },
};
