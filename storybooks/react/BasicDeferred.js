import React from 'react';
import heelflip from '../../src/react';

export default function BasicDeffered() {
  const getCharacters = React.useCallback(
    async () => fetch('https://rickandmortyapi.com/api/character?name=rick').then((res) => res.json()),
    []
  );
  const record = heelflip.useDeferredFetch('characters', getCharacters);
  return (
    <div>
      <h1>Characters</h1>
      {record.isIdle && <button onClick={record.invoke}>Load</button>}
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
