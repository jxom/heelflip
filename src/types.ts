export type TCacheStrategy = 'context-and-variables' | 'context-only';
export type TContextArg = string;
export type TFetchStrategy = 'cache-and-fetch' | 'fetch-only' | 'cache-only' | 'cache-first';
export type TFnArg<TResponse> = (...args: any) => Promise<TResponse>;
export type TConfig<TResponse, TError> = {
  cacheStrategy?: TCacheStrategy,
  defer?: boolean;
  enabled?: boolean;
  fetchStrategy?: TFetchStrategy,
  invalidateOnSuccess?: boolean;
  mutate?: boolean,
  timeToSlowConnection?: number;
  variables?: Array<unknown>;
};