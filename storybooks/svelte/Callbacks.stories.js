import SuccessCallback from './SuccessCallback.svelte';
import ErrorCallback from './ErrorCallback.svelte';

export default {
  title: 'Heelflip/Svelte/Callbacks',
};

export const Success = () => ({
  Component: SuccessCallback,
});

export const Error = () => ({
  Component: ErrorCallback,
});
