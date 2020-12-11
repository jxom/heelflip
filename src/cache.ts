import { FETCH_STRATEGIES } from "./constants";

export const recordCache = {
  cache: new Map(),
  get(key: string, opts: any) {
    const { fetchStrategy } = opts;
    if (fetchStrategy === FETCH_STRATEGIES.FETCH_ONLY) return;
    return this.cache.get(key);
  },
  set(key: string, value: any, opts: any) {
    const { fetchStrategy } = opts;
    if (fetchStrategy === FETCH_STRATEGIES.FETCH_ONLY) return;
    return this.cache.set(key, {
      updatedAt: new Date(),
      ...value,
    });
  },
};

//////////////////////////////////////////////

export const updaterCache = new Map();
