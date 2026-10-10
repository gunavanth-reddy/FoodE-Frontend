import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react';

export interface PendingAction {
  type: string;

  payload?: any;

  redirectScreen?: string;

  redirectParams?: any;
}

interface PendingActionContextType {
  pendingAction: PendingAction | null;

  setPendingAction: (
    action: PendingAction | null,
  ) => void;

  clearPendingAction: () => void;
}

const PendingActionContext =
  createContext<PendingActionContextType | null>(
    null,
  );

export const PendingActionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [pendingAction, setPendingAction] =
    useState<PendingAction | null>(null);

  const clearPendingAction = () => {
    setPendingAction(null);
  };

  return (
    <PendingActionContext.Provider
      value={{
        pendingAction,
        setPendingAction,
        clearPendingAction,
      }}>
      {children}
    </PendingActionContext.Provider>
  );
};

export const usePendingAction = () => {
  const context = useContext(
    PendingActionContext,
  );

  if (!context) {
    throw new Error(
      'usePendingAction must be used inside PendingActionProvider',
    );
  }

  return context;
};
