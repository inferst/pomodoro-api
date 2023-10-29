import {
  PomodoroProps,
  PomodoroState,
  PomodoroTimer,
  PomodoroTimerState,
  PomodoroTimerStatus,
} from 'src/types/pomodoro.types';

export const pomodoroDefaultValues = {
  focusDuration: 25,
  longBreakDuration: 15,
  shortBreakDuration: 5,
  rounds: 4,
};

export const createPomodoro = (props: PomodoroProps): PomodoroTimer => {
  const {
    focusDuration,
    longBreakDuration,
    shortBreakDuration,
    rounds,
    onStatusUpdate,
  } = props;

  let seconds = 0;
  let minutes = focusDuration;
  let round = 0;
  let status = PomodoroTimerStatus.focus;
  let timer: NodeJS.Timeout;
  let state: PomodoroTimerState;

  const getState = (): PomodoroState => ({
    seconds,
    minutes,
    round,
    status,
    state,
  });

  const getSettings = () => ({
    focusDuration,
    longBreakDuration,
    shortBreakDuration,
    rounds,
  });

  const run = () => {
    state = PomodoroTimerState.isRunning;
    clearTimer();

    timer = setInterval(() => {
      if (seconds == 0) {
        minutes = minutes - 1;

        if (minutes < 0) {
          if (status == PomodoroTimerStatus.focus) {
            status =
              round >= rounds - 1
                ? PomodoroTimerStatus.longBreak
                : PomodoroTimerStatus.shortBreak;
            minutes =
              round >= rounds - 1 ? longBreakDuration : shortBreakDuration;
          } else if (status == PomodoroTimerStatus.shortBreak) {
            status = PomodoroTimerStatus.focus;
            minutes = focusDuration;
            round = round + 1;
          } else if (status == PomodoroTimerStatus.longBreak) {
            status = PomodoroTimerStatus.focus;
            minutes = focusDuration;
            round = 0;
          }

          finish();

          onStatusUpdate(getState());
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

  const pause = () => {
    state = PomodoroTimerState.isPaused;
    clearTimer();
  };

  const finish = () => {
    state = PomodoroTimerState.isFinished;
    clearTimer();
  };

  return {
    run,
    pause,
    finish,
    getState,
    getSettings,
  };
};
