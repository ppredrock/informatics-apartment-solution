"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface SidebarMobileContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SidebarMobileContext = createContext<SidebarMobileContextValue>({
  open: false,
  setOpen: () => {},
});

export function SidebarMobileProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <SidebarMobileContext.Provider value={{ open, setOpen }}>
      {children}
    </SidebarMobileContext.Provider>
  );
}

export function useSidebarMobile() {
  return useContext(SidebarMobileContext);
}
