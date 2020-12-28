<script>
  import heelflip from '../svelte';

  const getCharacters = async ({ username }) =>
    fetch(`https://rickandmortyapi.com/api/character?name=${username}`).then((res) => res.json());

  let username = 'rick';
  const charactersStore = heelflip.fetch(['characters', [{ username }]], getCharacters, { enabled: false });

  function handleClickFetch() {
    charactersStore.invoke({ username });
  }

  $: {
    console.log($charactersStore);
  }
</script>

<div>
  <input bind:value={username} />
  <button on:click={handleClickFetch}>
    {#if $charactersStore.isReloading}Fetching...{:else}Fetch{/if}
  </button>
  {#if $charactersStore.isLoading}
    <p>Loading...</p>
  {/if}
  {#if $charactersStore.isSuccess}
    <ul>
      {#each $charactersStore.response.results as character}
        <li>{character.name}</li>
      {/each}
    </ul>
  {/if}
  {#if $charactersStore.isError}
    <p>Awwies</p>
  {/if}
</div>
