<script>
  import { asyncStore } from '../index.ts';

  let id = 1;

  let getCharacter = async ({ id }) => fetch(`https://rickandmortyapi.com/api/character/${id}`).then((res) => res.json());
  let characterStore = asyncStore.fetch(['character', [{ id }]], getCharacter);

  let getLocation = async ({ locationUrl }) => fetch(locationUrl).then((res) => res.json());
  let locationStore = asyncStore.fetch('location', getLocation, { enabled: false });

  $: {
    if ($characterStore.response) {
      locationStore.invoke({ locationUrl: $characterStore.response.location.url });
    }
  }

  $: {
    console.log($characterStore);
  }

  $: {
    console.log($locationStore);
  }
</script>

<div>
  {#if $characterStore.isLoading}
    <p>Loading...</p>
  {/if}
  {#if $characterStore.isSuccess}
    Name: {$characterStore.response.name}
    <br />
    {#if $locationStore.isSuccess}
      Location: {$locationStore.response.name}
    {/if}
  {/if}
  {#if $characterStore.isError}
    <p>Awwies</p>
  {/if}
</div>
