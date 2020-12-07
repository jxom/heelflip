export type TCacheStrategy = 'context-and-variables' | 'context-only';
export type TContextArg = string;
export type TFnArg<TResponse> = (...args: any) => Promise<TResponse>;
export type TConfig<TResponse, TError> = {
  cacheStrategy?: TCacheStrategy,
  defer?: boolean;
  initialVariables?: Array<unknown>;
};