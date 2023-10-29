import { PomodoroState } from './pomodoro.types';

export interface ClientToServerEvents {
  updateSettings: (data: UpdateSettingsData) => void;
  getSettings: (data: GetSettingsData, callback: GetSettingsCallback) => void;
  getState: (data: GetStateData, callback: GetStateCallback) => void;
  run: () => void;
  pause: () => void;
}

export interface ServerToClientEvents {
  updateState: (data: PomodoroState) => void;
}

export type SettingsData = {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  rounds: number;
};

export type UpdateSettingsData = SettingsData;

export type GetSettingsData = {
  roomId: string;
};

export type GetSettingsCallback = (
  settings: SettingsData,
  state: PomodoroState,
) => void;

export type GetStateData = {
  roomId: string;
};

export type GetStateCallback = (state: PomodoroState) => void;
