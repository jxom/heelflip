<script>
  import { boomerang } from '../index.ts';

  boomerang.setConfig({
    timeToSlowConnection: 1000
  });

  let getThing = async () => new Promise((res) => setTimeout(() => res('This is a slow response'), 3000));
  let store = boomerang.deferredFetch('thing', getThing);

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
