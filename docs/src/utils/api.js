export async function getCharacters({ fetch } = {}) {
  if (typeof window !== 'undefined') {
    fetch = window.fetch;
  }
  return fetch('https://rickandmortyapi.com/api/character').then((res) => res.json());
}
