import type { TCacheStrategy } from './types';

export const CACHE_STRATEGIES: { [key: string]: TCacheStrategy } = {
  CONTEXT_ONLY: 'context-only',
  CONTEXT_AND_VARIABLES: 'context-and-variables'
};
export const STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  RELOADING: 'reloading',
  SUCCESS: 'success',
  ERROR: 'error',
};
