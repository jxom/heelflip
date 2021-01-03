import React from 'react';
import heelflip from '../../src/react';

export default function Disabling() {
  const [username, setUsername] = React.useState('');

  const getCharacters = React.useCallback(
    async ({ username }) =>
      fetch(`https://rickandmortyapi.com/api/character?name=${username}`).then((res) => res.json()),
    []
  );
  const record = heelflip.useFetch(['characters', [{ username }]], getCharacters, { enabled: false });

  const handleClickFetch = React.useCallback(() => {
    record.invoke({ username });
  }, [record, username]);

  console.log(record);

  return (
    <div>
      <input onChange={(e) => setUsername(e.target.value)} value={username} />
      <button disabled={record.isReloading} onClick={handleClickFetch}>
        {record.isReloading ? 'Fetching...' : 'Fetch'}
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
