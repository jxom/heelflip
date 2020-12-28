<script>
  import heelflip from '../svelte';

  const getCharacters = async () => new Promise((res, rej) => rej('This is an error'));
  const store = heelflip.fetch('characters', getCharacters, { onError: (error) => console.log('onError', error) });

  $: {
    console.log($store);
  }
</script>

<div>
  <h1>Characters</h1>
  {#if $store.isLoading}
    <p>Loading...</p>
  {/if}
  {#if $store.isSuccess}
    <ul>
      {#each $store.response.results as character}
        <li>{character.name}</li>
      {/each}
    </ul>
  {/if}
  {#if $store.isError}
    <p>Awwies</p>
  {/if}
</div>
