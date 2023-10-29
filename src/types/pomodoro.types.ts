export type PomodoroProps = PomodoroSettings & {
  onStatusUpdate: (state: PomodoroState) => void;
};

export type PomodoroState = {
  seconds: number;
  minutes: number;
  round: number;
  status: PomodoroTimerStatus;
  state: PomodoroTimerState;
};

export type PomodoroSettings = {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  rounds: number;
};

export type PomodoroTimer = {
  run: () => void;
  pause: () => void;
  finish: () => void;
  getState: () => PomodoroState;
  getSettings: () => PomodoroSettings;
};

export enum PomodoroTimerState {
  isRunning,
  isPaused,
  isFinished,
}

export enum PomodoroTimerStatus {
  focus = 'focus',
  shortBreak = 'shortBreak',
  longBreak = 'longBreak',
}
