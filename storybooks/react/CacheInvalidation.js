import React from 'react';
import heelflip from '../../src/react';
import heelflipCache from '../../src/cache';

export default function CacheInvalidation() {
  const getCharacters = React.useCallback(
    async ({ username }) =>
      fetch(`https://rickandmortyapi.com/api/character?name=${username}`).then((res) => res.json()),
    []
  );
  const record = heelflip.useFetch(['characters', [{ username: 'rick' }]], getCharacters);

  return (
    <div>
      <h1>Characters</h1>
      <button
        disabled={record.isReloading}
        onClick={() => heelflipCache.invalidate(['characters', [{ username: 'rick' }]])}
      >
        {record.isReloading ? 'Invalidating...' : 'Invalidate'}
      </button>
      {record.isLoading && <p>Loading...</p>}
      {record.isSuccess && (
        <ul>
          {record.response.results.map((character, i) => (
            <li key={i}>{character.name}</li>
          ))}
        </ul>
      )}
      {record.isError && <p>Awwies</p>}
    </div>
  );
}
