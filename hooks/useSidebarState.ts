import { useState, useEffect } from "react";

/**
 * Custom hook to manage sidebar state with localStorage persistence
 * Ensures that when sidebar is minimized, it stays minimized across page navigation
 */

// Initialize state from localStorage (runs once at module load)
function getInitialSidebarState(): boolean {
  if (typeof window === "undefined") return false;
  const saved = localStorage.getItem("sidebarSlim");
  return saved !== null ? JSON.parse(saved) : false;
}

export function useSidebarState() {
  // Use lazy initialization to avoid hydration mismatch
  const [sidebarSlim, setSidebarSlim] = useState(() => getInitialSidebarState());

  // Save to localStorage whenever state changes
  const updateSidebarSlim = (newState: boolean | ((prev: boolean) => boolean)) => {
    setSidebarSlim((prev) => {
      const state = typeof newState === "function" ? newState(prev) : newState;
      if (typeof window !== "undefined") {
        localStorage.setItem("sidebarSlim", JSON.stringify(state));
      }
      return state;
    });
  };

  return { sidebarSlim, setSidebarSlim: updateSidebarSlim };
}
