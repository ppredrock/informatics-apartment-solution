import { useSyncExternalStore } from "react";

type ProgressState = {
  progress: number;
  active: boolean;
};

let state: ProgressState = { progress: 0, active: false };
let listeners = new Set<() => void>();
let trickleTimer: ReturnType<typeof setInterval> | null = null;
let doneTimer: ReturnType<typeof setTimeout> | null = null;

function emit() {
  listeners.forEach((l) => l());
}

function set(next: Partial<ProgressState>) {
  state = { ...state, ...next };
  emit();
}

function clearTimers() {
  if (trickleTimer) {
    clearInterval(trickleTimer);
    trickleTimer = null;
  }
  if (doneTimer) {
    clearTimeout(doneTimer);
    doneTimer = null;
  }
}

export function start() {
  if (state.active) return; // idempotent
  clearTimers();
  set({ progress: 10, active: true });

  trickleTimer = setInterval(() => {
    set({
      progress: Math.min(state.progress + (90 - state.progress) * 0.08, 90),
    });
  }, 200);
}

export function done() {
  if (!state.active) return;
  clearTimers();
  set({ progress: 100 });

  doneTimer = setTimeout(() => {
    set({ progress: 0, active: false });
  }, 300);
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): ProgressState {
  return state;
}

function getServerSnapshot(): ProgressState {
  return { progress: 0, active: false };
}

export function useRouteProgress() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
