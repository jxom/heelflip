import React from 'react';
import heelflip from '../../src/react';

export default function Basic() {
  const getCharacters = React.useCallback(async () => new Promise((res, rej) => rej('error')), []);
  const record = heelflip.useFetch('characters', getCharacters, { onError: (res) => console.log('error', res) });

  return (
    <div>
      <h1>Characters</h1>
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
