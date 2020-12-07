import { getAsyncStore } from './getAsyncStore';
import type { TFnArg, TContextArg, TConfig } from './types';

export function getDeferredAsyncStore<TResponse, TError>(
  contextKeyOrFn: TContextArg | TFnArg<TResponse>,
  fnOrConfig?: TFnArg<TResponse> | TConfig<TResponse, TError>,
  maybeConfig?: TConfig<TResponse, TError>
) {
  let context = contextKeyOrFn as TContextArg | null;
  let config = maybeConfig;

  let fn = fnOrConfig as TFnArg<TResponse>;
  if (typeof contextKeyOrFn === 'function') {
    context = null;
    fn = contextKeyOrFn;
  }

  if (typeof fnOrConfig === 'object') {
    config = fnOrConfig;
  }

  return getAsyncStore<TResponse, TError>(context, fn, { ...config, defer: true });
}
