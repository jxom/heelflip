import React from 'react';
import heelflip from '../../src/react';

export default function BasicDeffered() {
  const getCharacters = React.useCallback(
    async () => fetch('https://rickandmortyapi.com/api/character?name=rick').then((res) => res.json()),
    []
  );

  const firstRecord = heelflip.useFetch('characters', getCharacters, { enabled: false });
  const secondRecord = heelflip.useFetch('characters', getCharacters, { enabled: false });
  const thirdRecord = heelflip.useFetch('characters', getCharacters, { enabled: false });

  return (
    <div>
      <p>
        When we fetch the first characters store, it will also fetch the second and third store as it will broadcast the
        successful response across all consumer stores with context "characters".
      </p>
      <button>Fetch</button>
      <div>
        <h1>Characters (first record)</h1>
        {firstRecord.isLoading && <p>Loading...</p>}
        {firstRecord.isSuccess && (
          <ul>
            {firstRecord.response.results.map((character, i) => (
              <li key={i}>{character.name}</li>
            ))}
          </ul>
        )}
        {firstRecord.isError && <p>Awwies</p>}
      </div>
      <div>
        <h1>Characters (second record)</h1>
        {secondRecord.isLoading && <p>Loading...</p>}
        {secondRecord.isSuccess && (
          <ul>
            {secondRecord.response.results.map((character, i) => (
              <li key={i}>{character.name}</li>
            ))}
          </ul>
        )}
        {secondRecord.isError && <p>Awwies</p>}
      </div>
      <div>
        <h1>Characters (third record)</h1>
        {thirdRecord.isLoading && <p>Loading...</p>}
        {thirdRecord.isSuccess && (
          <ul>
            {thirdRecord.response.results.map((character, i) => (
              <li key={i}>{character.name}</li>
            ))}
          </ul>
        )}
        {thirdRecord.isError && <p>Awwies</p>}
      </div>
    </div>
  );
}
