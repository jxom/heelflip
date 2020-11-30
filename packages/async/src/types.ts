export type TContextArg = string;
export type TFnArg<TResponse> = (...args: any) => Promise<TResponse>;
export type TConfig<TResponse, TError> = {
  defer?: boolean;
  initialVariables?: Array<unknown>;
};