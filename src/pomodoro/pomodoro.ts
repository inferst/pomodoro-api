export type OnUpdateStateProps = {
  round: number;
  status: PomodoroStatus;
};

export type PomodoroProps = {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  rounds: number;
  onUpdateState: (state: PomodoroState) => void;
};

export type PomodoroState = {
  seconds: number;
  minutes: number;
  round: number;
  status: PomodoroStatus;
  play: boolean;
};

export type Pomodoro = {
  start: () => void;
  clearTimer: () => void;
  getState: () => PomodoroState;
};

export enum PomodoroStatus {
  focus = 'focus',
  shortBreak = 'shortBreak',
  longBreak = 'longBreak',
}

export const createPomodoro = (props: PomodoroProps): Pomodoro => {
  const {
    focusDuration,
    longBreakDuration,
    shortBreakDuration,
    rounds,
    onUpdateState,
  } = props;

  let seconds = 0;
  let minutes = focusDuration;
  let round = 0;
  let status = PomodoroStatus.focus;
  let timer: NodeJS.Timeout;

  const getState = (): PomodoroState => ({
    seconds,
    minutes,
    round,
    status,
    play: timer != null,
  });

  const start = () => {
    clearTimer();
    timer = setInterval(() => {
      if (seconds == 0) {
        minutes = minutes - 1;

        if (minutes < 0) {
          if (status == PomodoroStatus.focus) {
            status =
              round >= rounds
                ? PomodoroStatus.longBreak
                : PomodoroStatus.shortBreak;
            minutes = round >= rounds ? longBreakDuration : shortBreakDuration;
          } else if (status == PomodoroStatus.shortBreak) {
            status = PomodoroStatus.focus;
            minutes = focusDuration;
            round = round + 1;
          } else if (status == PomodoroStatus.longBreak) {
            status = PomodoroStatus.focus;
            minutes = focusDuration;
            round = 0;
          }

          clearTimer();

          onUpdateState(getState());
        } else {
          seconds = 59;
        }
      } else {
        seconds = seconds - 1;
      }
    }, 1000);
  };

  const clearTimer = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  return {
    start,
    clearTimer,
    getState,
  };
};
