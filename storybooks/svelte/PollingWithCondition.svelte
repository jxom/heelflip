<script>
  import heelflip from '../../src/svelte';

  const response = {
    pending: true
  };
  setTimeout(() => {
    response.pending = false;
  }, 10000);

  const getCharacters = async () => response;
  const store = heelflip.fetch('characters', getCharacters, {
    pollingInterval: 5000,
    pollWhile: (record) => record.response && record.response.pending
  });

  $: {
    console.log($store);
  }
</script>

<div>
  <p>Poll when `pending` is `true`. After 10 seconds (2 polls), it should stop polling</p>
  {#if $store.isLoading}
    <p>Loading...</p>
  {/if}
  {#if $store.isSuccess}
    <p>Is pending: {$store.response.pending}</p>
  {/if}
  {#if $store.isError}
    <p>Awwies</p>
  {/if}
</div>
