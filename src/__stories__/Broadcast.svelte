<script>
  import { asyncStore } from '../index.ts';

  let getRepos = async () => fetch('https://rickandmortyapi.com/api/character?name=rick').then((res) => res.json());

  let firstStore = asyncStore.fetch('characters', getRepos, { enabled: false });
  let secondStore = asyncStore.fetch('characters', getRepos, { enabled: false });
  let thirdStore = asyncStore.fetch('characters', getRepos, { enabled: false });
</script>

<div>
  <button on:click={() => firstStore.invoke()}>Fetch</button>

  <h1>Characters</h1>
  {#if $firstStore.isLoading}
    <p>Loading...</p>
  {/if}
  {#if $firstStore.isSuccess}
    <ul>
      {#each $firstStore.response.results as character}
        <li>{character.name}</li>
      {/each}
    </ul>
  {/if}
  {#if $firstStore.isError}
    <p>Awwies</p>
  {/if}
</div>

<div>
  <h1>Characters</h1>
  {#if $secondStore.isLoading}
    <p>Loading...</p>
  {/if}
  {#if $secondStore.isSuccess}
    <ul>
      {#each $secondStore.response.results as character}
        <li>{character.name}</li>
      {/each}
    </ul>
  {/if}
  {#if $secondStore.isError}
    <p>Awwies</p>
  {/if}
</div>

<div>
  <h1>Characters</h1>
  {#if $thirdStore.isLoading}
    <p>Loading...</p>
  {/if}
  {#if $thirdStore.isSuccess}
    <ul>
      {#each $thirdStore.response.results as character}
        <li>{character.name}</li>
      {/each}
    </ul>
  {/if}
  {#if $thirdStore.isError}
    <p>Awwies</p>
  {/if}
</div>