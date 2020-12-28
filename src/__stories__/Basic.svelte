<script>
  import heelflip from '../svelte';

  const getCharacters = async () =>
    fetch('https://rickandmortyapi.com/api/character?name=rick').then((res) => res.json());
  const store = heelflip.fetch('characters', getCharacters);

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
