<script>
  import heelflip from '../svelte';

  const id = 1;

  const getCharacter = async ({ id }) =>
    fetch(`https://rickandmortyapi.com/api/character/${id}`).then((res) => res.json());
  const characterStore = heelflip.fetch(['character', [{ id }]], getCharacter);

  const getLocation = async ({ locationUrl }) => fetch(locationUrl).then((res) => res.json());
  const locationStore = heelflip.fetch('location', getLocation, { enabled: false });

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
    Name:
    {$characterStore.response.name}
    <br />
    {#if $locationStore.isSuccess}Location: {$locationStore.response.name}{/if}
  {/if}
  {#if $characterStore.isError}
    <p>Awwies</p>
  {/if}
</div>
