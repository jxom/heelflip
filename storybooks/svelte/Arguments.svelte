<script>
  import heelflip from '../../src/svelte';

  const getCharacters = async ({ username }) =>
    fetch(`https://rickandmortyapi.com/api/character?name=${username}`).then((res) => res.json());

  let username = 'rick';
  const store = heelflip.fetch(['characters', [{ username }]], getCharacters);

  function handleClickFetch() {
    store.invoke({ username });
  }

  $: {
    console.log($store);
  }
</script>

<div>
  <input bind:value={username} />
  <button on:click={handleClickFetch}>
    {#if $store.isReloading}Fetching...{:else}Fetch{/if}
  </button>
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
