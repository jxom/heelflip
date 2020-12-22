import { FETCH_STRATEGIES, CACHE_STRATEGIES } from './constants';
import type { TConfig } from './types';

export let globalConfig = {
  cacheStrategy: CACHE_STRATEGIES.CONTEXT_AND_ARGS,
  debounceInterval: 0,
  dedupingInterval: 500,
  dedupeManualInvoke: true,
  fetchStrategy: FETCH_STRATEGIES.CACHE_AND_FETCH,
  pollOnMount: true,
  staleTime: 300000,
  timeToSlowConnection: 3000,
};

export function setConfig<TResponse, TError>(config: TConfig<TResponse, TError>) {
  globalConfig = {
    ...globalConfig,
    ...config,
  };
}
