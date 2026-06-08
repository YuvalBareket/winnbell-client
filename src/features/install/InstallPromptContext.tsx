import { createContext, useContext } from 'react';

type InstallPromptContextType = {
  triggerInstallPrompt: () => void;
  openInstallDialog: () => void;
};

export const InstallPromptContext = createContext<InstallPromptContextType>({
  triggerInstallPrompt: () => {},
  openInstallDialog: () => {},
});

export const useInstallPromptTrigger = () => useContext(InstallPromptContext);
