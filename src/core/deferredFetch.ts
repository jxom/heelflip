import type { TConfig, TFn, TContextKeyAndArgs } from '../types';

export default function deferredFetch({ fetch, mutate = false }: { fetch: unknown, mutate: boolean }) {
  return <TResponse, TError>(
    contextKeyAndArgsOrFn: TContextKeyAndArgs | TFn<TResponse>,
    fnOrConfig?: TFn<TResponse> | TConfig<TResponse, TError>,
    maybeConfig?: TConfig<TResponse, TError>
  ) => {
    let contextKeyAndArgs = contextKeyAndArgsOrFn as TContextKeyAndArgs | null;
    let config = maybeConfig;

    let fn = fnOrConfig as TFn<TResponse>;
    if (typeof contextKeyAndArgsOrFn === 'function') {
      contextKeyAndArgs = null;
      fn = contextKeyAndArgsOrFn;
    }

    if (typeof fnOrConfig === 'object') {
      config = fnOrConfig;
    }

    // @ts-ignore
    return fetch<TResponse, TError>(contextKeyAndArgs, fn, { ...config, defer: true, mutate });
  };
}
