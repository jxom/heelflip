import _Polling from './Polling.svelte';
import _PollingWithCondition from './PollingWithCondition.svelte';
import _PollingWithManual from './PollingWithManual.svelte';

export default {
  title: 'Heelflip/Svelte/Polling',
};

export const Default = () => ({
  Component: _Polling,
});

export const WithCondition = () => ({
  Component: _PollingWithCondition,
});

export const WithManual = () => ({
  Component: _PollingWithManual,
});
