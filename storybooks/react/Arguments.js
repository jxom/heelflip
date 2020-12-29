import React from 'react';
import heelflip from '../../src/react';

export default function Basic() {
  const [username, setUsername] = React.useState('');

  const getCharacters = React.useCallback(
    async ({ username = 'rick' } = {}) => fetch(`https://rickandmortyapi.com/api/character?name=${username}`).then((res) => res.json()),
    []
  );
  const record = heelflip.useFetch('characters', getCharacters);

  function handleClickFetch() {
    record.invoke({ username });
  }

  return (
    <div>
      <input onChange={e => setUsername(e.target.value)} value={username} />
      <button onClick={handleClickFetch}>Fetch</button>
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
