import { createContext, useContext } from 'react';

type InstallPromptContextType = {
  canInstall: boolean;
  installed: boolean;
  isIos: boolean;
  triggerInstallPrompt: () => void;
  openInstallDialog: () => void;
};

export const InstallPromptContext = createContext<InstallPromptContextType>({
  canInstall: false,
  installed: false,
  isIos: false,
  triggerInstallPrompt: () => {},
  openInstallDialog: () => {},
});

export const useInstallPromptTrigger = () => useContext(InstallPromptContext);
