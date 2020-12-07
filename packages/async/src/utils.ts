import { CACHE_STRATEGIES, STATES } from './constants';
import type { TContextArg, TCacheStrategy } from './types';

export function getStateVariables(state, prevState = undefined) {
  return {
    isIdle: state === STATES.IDLE,
    isLoading: state === STATES.LOADING,
    isReloading: state === STATES.RELOADING,
    isSuccess: state === STATES.SUCCESS || (state === STATES.RELOADING && prevState === STATES.SUCCESS),
    isError: state === STATES.ERROR || (state === STATES.RELOADING && prevState === STATES.ERROR),
  };
}
export function getCacheKey({
  contextKey,
  variables = [],
  cacheStrategy
}: {
  contextKey: TContextArg | null;
  variables: Array<Object>;
  cacheStrategy: TCacheStrategy;
}) {
  const variablesHash = variables.length > 0 ? JSON.stringify(variables) : '';
  let cacheKey = Array.isArray(contextKey) ? contextKey.join('.') : contextKey;
  if (variablesHash && cacheStrategy === CACHE_STRATEGIES.CONTEXT_AND_VARIABLES) {
    cacheKey = `${cacheKey}.${variablesHash}`;
  }
  return cacheKey;
}