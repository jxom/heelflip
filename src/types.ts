export type TArgs = Array<unknown>;
export type TCacheProvider = {
  get: (key: string) => any;
  set: (key: string, value: any) => void;
  clear: () => void;
  delete: (key: string) => void;
};
export type TCacheStrategy = 'context-and-args' | 'context-only';
export type TContextKey = string;
export type TContextKeyAndArgs = TContextKey | [TContextKey, TArgs] | null;
export type TLoadingState =
  | 'idle'
  | 'loading'
  | 'loading-slow'
  | 'success'
  | 'error'
  | 'reloading'
  | 'reloading-slow';
export type TFetchStrategy = 'cache-and-fetch' | 'fetch-only' | 'cache-only' | 'cache-first';
export type TFn<TResponse> = (...args: any) => Promise<TResponse>;
export type TResponseOrResponseFn<TResponse> = TResponse | ((response: TResponse) => TResponse);
export type TRecord<TResponse, TError> = {
  args: TArgs,
  contextKey: TContextKey;
  contextKeyAndArgs: TContextKeyAndArgs;
  error: TError | undefined;
  response: TResponse | undefined;
  promise: Promise<any> | undefined;
  updatedAt?: Date;
  state: TLoadingState;
  isIdle: boolean;
  isLoading: boolean;
  isLoadingSlow: boolean;
  isReloading: boolean;
  isReloadingSlow: boolean;
  isSuccess: boolean;
  isError: boolean;
};
export type TSetDataOpts = {
  isBroadcast?: boolean;
  localArgs?: Array<unknown> | undefined;
  localInvokeCount?: number | undefined;
  setCache?: boolean;
  slowConnectionTimeout?: number | undefined
}
export type TSetDataRecord<TResponse, TError> = {
  error?: TError | undefined;
  responseOrResponseFn?: TResponseOrResponseFn<TResponse> | undefined;
  state: TLoadingState;
}
export type TSetSuccessOpts = TSetDataOpts;
export type TSetErrorOpts = TSetDataOpts;

export type TConfig<TResponse, TError> = {
  cacheProvider?: TCacheProvider;
  cacheStrategy?: TCacheStrategy;
  cacheTime?: number;
  defer?: boolean;
  debounceInterval?: number;
  dedupingInterval?: number;
  dedupeManualInvoke?: boolean;
  enabled?: boolean;
  fetchStrategy?: TFetchStrategy,
  invalidateOnSuccess?: boolean;
  mutate?: boolean,
  onError?: (error: TError | undefined) => void;
  onSuccess?: (response: TResponse | undefined) => void;
  pollingInterval?: number;
  pollWhile?: boolean | ((record: TRecord<TResponse, TError>) => boolean);
  pollWhenHidden?: boolean;
  rejectRetryInterval?: number | ((count: number) => number);
  revalidateTime?: number;
  revalidateOnWindowFocus?: boolean;
  timeToSlowConnection?: number;
};