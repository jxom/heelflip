<script>
  import heelflip from 'heelflip/svelte';

  const getCharacters = async () => {
    if (typeof fetch !== 'undefined') {
      return fetch('https://rickandmortyapi.com/api/character').then((res) => res.json());
    }
    return;
  } 
  const store = heelflip.fetch('characters', getCharacters);
</script>

<svelte:head>
  <title>Sapper project template</title>
</svelte:head>

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
