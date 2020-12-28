import type { TConfig, TFn, TContextKeyAndArgs } from '../types';
import fetch from './fetch';

export default function prefetch<TResponse, TError>(
  contextKeyAndArgs: TContextKeyAndArgs,
  fn: TFn<TResponse>,
  config?: TConfig<TResponse, TError>
) {
  const { prefetch } = fetch(contextKeyAndArgs, fn, config);
  return prefetch();
}