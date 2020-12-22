<script>
  import { boomerang } from '../index.ts';

  const getRepos = async () => fetch('https://rickandmortyapi.com/api/character?name=rick').then((res) => res.json());

  const firstStore = boomerang.fetch('characters', getRepos, { enabled: false });
  const secondStore = boomerang.fetch('characters', getRepos, { enabled: false });
  const thirdStore = boomerang.fetch('characters', getRepos, { enabled: false });
</script>

<div>
  <p>
    When we fetch the first characters store, it will also fetch the second and third store as it will broadcast the
    successful response across all consumer stores with context "characters".
  </p>

  <button on:click={() => firstStore.invoke()}>Fetch first store</button>

  <h1>Characters (first store)</h1>
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
  <h1>Characters (second store)</h1>
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
  <h1>Characters (third store)</h1>
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
