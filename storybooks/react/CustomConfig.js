import React from 'react';
import heelflip, { ConfigProvider } from '../../src/react';

function CustomConfig() {
  const getResource = React.useCallback(
    async () => new Promise((res) => setTimeout(() => res('This is a slow response'), 3000)),
    []
  );
  const record = heelflip.useDeferredFetch('resource', getResource);

  return (
    <div>
      {record.isIdle && <button onClick={record.invoke}>Load</button>}
      {record.isLoading && <p>Loading...</p>}
      {record.isLoadingSlow && <p>Taking a while...</p>}
      {record.isSuccess && record.response}
    </div>
  );
}

export default function Example() {
  return (
    <ConfigProvider config={{ timeToSlowConnection: 1000 }}>
      <CustomConfig />
    </ConfigProvider>
  );
}
