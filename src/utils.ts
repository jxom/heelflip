import { CACHE_STRATEGIES, STATES } from './constants';
import type { TArgs, TCacheStrategy, TContextKey, TContextKeyAndArgs, TLoadingState } from './types';

export function getStateVariables(state: TLoadingState, prevState: TLoadingState | undefined = undefined) {
  return {
    isIdle: state === STATES.IDLE,
    isLoading: state === STATES.LOADING || state === STATES.LOADING_SLOW,
    isLoadingSlow: state === STATES.LOADING_SLOW,
    isReloading: state === STATES.RELOADING || state === STATES.RELOADING_SLOW,
    isReloadingSlow: state === STATES.RELOADING_SLOW,
    isSuccess: state === STATES.SUCCESS || ((state === STATES.RELOADING || state === STATES.RELOADING_SLOW) && prevState === STATES.SUCCESS),
    isError: state === STATES.ERROR || ((state === STATES.RELOADING || state === STATES.RELOADING_SLOW) && prevState === STATES.ERROR),
  };
}

export function getContextKeyAndArgs(contextKeyAndArgs: TContextKeyAndArgs | null): [TContextKey, TArgs] {
  let contextKey = contextKeyAndArgs as string;
  let args: TArgs = [];
  if (Array.isArray(contextKeyAndArgs)) {
    [contextKey, args = []] = contextKeyAndArgs;
  }
  return [contextKey, args];
}

export function getCacheKey({
  contextKeyAndArgs,
  cacheStrategy = CACHE_STRATEGIES.CONTEXT_AND_ARGS
}: {
  contextKeyAndArgs: TContextKeyAndArgs;
  cacheStrategy: TCacheStrategy;
}) {
  const [contextKey, args] = getContextKeyAndArgs(contextKeyAndArgs);
  const argsHash = args.length > 0 ? JSON.stringify(args) : '';
  let cacheKey = Array.isArray(contextKey) ? contextKey.join('.') : contextKey;
  if (argsHash && cacheStrategy === CACHE_STRATEGIES.CONTEXT_AND_ARGS) {
    cacheKey = `${cacheKey}.${argsHash}`;
  }
  return cacheKey;
}