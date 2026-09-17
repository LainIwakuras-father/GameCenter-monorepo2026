const STORAGE_PREFIX = "gamecenter:station-timer";

export interface StationTimerState {
  startTime: number;
  endTime?: number;
}

const getKey = (teamId: number, stationId: number, suffix: "start" | "end") =>
  `${STORAGE_PREFIX}:${teamId}:${stationId}:${suffix}`;

const parseTimestamp = (value: string | null) => {
  if (value === null || value.trim() === "") {
    return null;
  }

  const timestamp = Number(value);
  return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : null;
};

/** Reads a timer snapshot scoped to both the team and station. */
export const readStationTimer = (
  teamId: number,
  stationId: number,
): StationTimerState | null => {
  try {
    const startTime = parseTimestamp(
      localStorage.getItem(getKey(teamId, stationId, "start")),
    );

    if (startTime === null) {
      return null;
    }

    const endTime = parseTimestamp(
      localStorage.getItem(getKey(teamId, stationId, "end")),
    );

    return endTime === null ? { startTime } : { startTime, endTime };
  } catch {
    return null;
  }
};

export const saveStationTimerStart = (
  teamId: number,
  stationId: number,
  startTime: number,
) => {
  try {
    localStorage.setItem(getKey(teamId, stationId, "start"), String(startTime));
    localStorage.removeItem(getKey(teamId, stationId, "end"));
  } catch {
    // Storage is optional state; the in-memory timer remains usable.
  }
};

export const saveStationTimerEnd = (
  teamId: number,
  stationId: number,
  endTime: number,
) => {
  try {
    localStorage.setItem(getKey(teamId, stationId, "end"), String(endTime));
  } catch {
    // Storage is optional state; the in-memory timer remains usable.
  }
};

export const clearStationTimer = (teamId: number, stationId: number) => {
  try {
    localStorage.removeItem(getKey(teamId, stationId, "start"));
    localStorage.removeItem(getKey(teamId, stationId, "end"));
  } catch {
    // Storage is optional state; the in-memory timer remains usable.
  }
};
