import * as React from 'react';

import type { TConfig } from '../types';

export const ConfigContext = React.createContext({});

export const ConfigProvider = <TResponse, TError>({
  children,
  config,
}: {
  children: React.ReactNode;
  config: TConfig<TResponse, TError>;
}) => <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;

export default ConfigContext;
