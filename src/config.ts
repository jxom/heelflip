import { FETCH_STRATEGIES, CACHE_STRATEGIES } from './constants';

export let globalConfig = {
  cacheStrategy: CACHE_STRATEGIES.CONTEXT_AND_VARIABLES,
  fetchStrategy: FETCH_STRATEGIES.CACHE_AND_FETCH,
  timeToSlowConnection: 3000
};

export function setConfig(config) {
  globalConfig = {
    ...globalConfig,
    ...config,
  }
}