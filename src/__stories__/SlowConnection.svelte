<script>
  import { boomerang } from '../index.ts';

  const getThing = async () => new Promise((res) => setTimeout(() => res('This is a slow response'), 5000));
  const store = boomerang.deferredFetch('thing', getThing);

  $: {
    console.log($store);
  }
</script>

<div>
  {#if $store.isIdle}<button on:click={store.invoke}>Load</button>{/if}
  {#if $store.isLoading}
    <p>Loading...</p>
    {#if $store.isLoadingSlow}
      <p>Taking a while...</p>
    {/if}
  {/if}
  {#if $store.isSuccess}
    {#each $store.response as message}{message}{/each}
  {/if}
  {#if $store.isError}
    <p>Awwies</p>
  {/if}
</div>
