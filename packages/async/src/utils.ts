import { STATES } from './constants';

export function getStateVariables(state, prevState = undefined) {
  return {
    isIdle: state === STATES.IDLE,
    isLoading: state === STATES.LOADING,
    isReloading: state === STATES.RELOADING,
    isSuccess: state === STATES.SUCCESS || (state === STATES.RELOADING && prevState === STATES.SUCCESS),
    isError: state === STATES.ERROR || (state === STATES.RELOADING && prevState === STATES.ERROR),
  };
}