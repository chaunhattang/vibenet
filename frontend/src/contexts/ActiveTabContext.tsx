/**
 * ActiveTabContext — tracks which of the 4 primary tabs (Home / Explore /
 * Notifications / Profile) is active. Lives above the root stack so any
 * screen (including ones outside MainTabs, e.g. MessagesListScreen) can
 * jump straight to a tab via useGoToTab().
 */
import { createContext, ReactNode, useContext, useState } from 'react';
import { TabKey } from '../layout/FloatingTabBar';

type ActiveTabContextValue = {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
};

const ActiveTabContext = createContext<ActiveTabContextValue | null>(null);

export function ActiveTabProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  return (
    <ActiveTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </ActiveTabContext.Provider>
  );
}

export function useActiveTab() {
  const ctx = useContext(ActiveTabContext);
  if (!ctx) throw new Error('useActiveTab must be used within ActiveTabProvider');
  return ctx;
}
