import { createContext, useContext, useState, useCallback } from 'react';

interface PageHeaderContextValue {
  hasOwnHeader: boolean;
  claimHeader: () => void;
  releaseHeader: () => void;
}

const PageHeaderContext = createContext<PageHeaderContextValue>({
  hasOwnHeader: false,
  claimHeader: () => {},
  releaseHeader: () => {},
});

export const usePageHeader = () => useContext(PageHeaderContext);

export const PageHeaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [hasOwnHeader, setHasOwnHeader] = useState(false);
  const claimHeader = useCallback(() => setHasOwnHeader(true), []);
  const releaseHeader = useCallback(() => setHasOwnHeader(false), []);
  return (
    <PageHeaderContext.Provider value={{ hasOwnHeader, claimHeader, releaseHeader }}>
      {children}
    </PageHeaderContext.Provider>
  );
};
