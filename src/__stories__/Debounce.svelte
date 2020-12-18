<script>
  import { boomerang } from '../index.ts';

  let getCharacters = async ({ username }) =>
    fetch(`https://rickandmortyapi.com/api/character?name=${username}`).then((res) => res.json());

  let username = 'rick';
  let charactersStore = boomerang.fetch(['characters', [{ username }]], getCharacters, { debounceInterval: 1000 });

  $: {
    charactersStore.invoke({ username })
  }
</script>

<div>
  <div style="display: flex;">
    <input bind:value={username} />
  </div>
  {#if $charactersStore.isLoading}
    <p>Loading...</p>
  {/if}
  {#if $charactersStore.isSuccess}
    <ul>
      {#each $charactersStore.response.results || [] as character}
        <li>{character.name}</li>
      {/each}
    </ul>
  {/if}
  {#if $charactersStore.isError}
    <p>Awwies</p>
  {/if}
</div>
