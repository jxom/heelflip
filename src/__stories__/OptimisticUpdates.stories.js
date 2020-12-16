import _OptimisticUpdatesInstance from './OptimisticUpdatesInstance.svelte';
import _OptimisticUpdatesCache from './OptimisticUpdatesCache.svelte';

export default {
  title: 'Optimistic updates',
};

export const ViaInstance = () => ({
  Component: _OptimisticUpdatesInstance,
});

export const ViaCache = () => ({
  Component: _OptimisticUpdatesCache,
});
