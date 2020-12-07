import type { TCacheStrategy } from './types';

export const CACHE_STRATEGIES: { [key: string]: TCacheStrategy } = {
  CONTEXT_ONLY: 'context-only',
  CONTEXT_AND_VARIABLES: 'context-and-variables'
};
export const STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  LOADING_SLOW: 'loading-slow',
  RELOADING: 'reloading',
  RELOADING_SLOW: 'reloading-slow',
  SUCCESS: 'success',
  ERROR: 'error',
};
