import React from "react";

export const parseTime = (allSeconds: number, onlyMinutes?: boolean) => {
  const safeSeconds = Math.max(0, Number.isFinite(allSeconds) ? allSeconds : 0);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = onlyMinutes
    ? Math.floor(safeSeconds / 60)
    : Math.floor((safeSeconds % 3600) / 60);
  const seconds = Math.floor(safeSeconds % 60);

  if (onlyMinutes) {
    return (
      `${minutes.toString().padStart(2, "0")}` +
      `:${seconds.toString().padStart(2, "0")}`
    );
  }

  return (
    `${hours.toString().padStart(2, "0")}` +
    `:${minutes.toString().padStart(2, "0")}` +
    `:${seconds.toString().padStart(2, "0")}`
  );
};

// в секундах
export const getSpentTime = (time: number = 0, now = Date.now()) =>
  Math.max(0, now / 1000 - time);

export const useTimer = () => {
  const [leftTime, setLeftTime] = React.useState("--:--:--");
  const [spentTime, setSpentTime] = React.useState("00:00");

  const [started, setStarted] = React.useState(false);
  const [ended, setEnded] = React.useState(false);
  const [extraMinutes, setExtraMinutes] = React.useState(0);

  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // логика в тотале, если брать куда то еще, то надо переписать чутка понятнее
  const intervalFunc = (startTime: number, timeToSpend: number) => () => {
    const spentTime = getSpentTime(startTime);

    const hasTimeLeft = updateTimer(spentTime, timeToSpend);
    if (!hasTimeLeft && intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setStarted(false);
    }
  };

  const handleStartTimer = (startTime: number, timeToSpend: number) => {
    if (
      !Number.isFinite(startTime) ||
      !Number.isFinite(timeToSpend) ||
      timeToSpend < 0
    ) {
      return;
    }

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
    }

    setStarted(true);
    setEnded(false);
    setExtraMinutes(0);

    const f = intervalFunc(startTime, timeToSpend);
    f(); // чтобы не ждать первую секунду

    intervalRef.current = setInterval(f, 1000);
  };

  const handleStopTimer = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setStarted(false);
  };

  const updateTimer = (spentTime: number, timeToSpend: number) => {
    setSpentTime(parseTime(spentTime, true));

    const leftTime = timeToSpend - spentTime;
    if (leftTime <= 0) {
      setStarted(false);
      setEnded(true);
      setExtraMinutes(Math.ceil((leftTime * -1) / 60));
      setLeftTime("00:00:00");
      return false;
    } else {
      setLeftTime(parseTime(leftTime));
      return true;
    }
  };

  React.useEffect(
    () => () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    },
    [],
  );

  return {
    leftTime,
    spentTime,
    startTimer: handleStartTimer,
    stopTimer: handleStopTimer,
    isTimerStarted: started,
    isTimeEnded: ended,
    extraMinutes,
    forceUpdateTimer: updateTimer,
  };
};
