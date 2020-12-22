import _FetchStrategyCacheFirst from './FetchStrategyCacheFirst.svelte';
import _FetchStrategyCacheFirstStale from './FetchStrategyCacheFirstStale.svelte';

export default {
  title: 'Fetch strategy (cache first)',
};

export const Default = () => ({
  Component: _FetchStrategyCacheFirst,
});

export const RevalidateOnStale = () => ({
  Component: _FetchStrategyCacheFirstStale,
});
