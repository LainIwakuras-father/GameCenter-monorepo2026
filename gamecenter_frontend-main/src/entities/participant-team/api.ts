import { createEffect } from "effector";

import { get, post } from "../../shared/lib";

import type { ParticipantTeam, SaveScoreResponse } from "./typings";

const asId = (value: unknown): number | undefined => {
  const candidate =
    typeof value === "object" && value !== null && "id" in value
      ? (value as { id?: unknown }).id
      : value;
  const id = Number(candidate);

  if (Number.isInteger(id) && id > 0) {
    return id;
  }

  return undefined;
};

/** Relations are nullable while an organizer is still assigning routes. */
const asNullableId = (value: unknown): number | null | undefined => {
  if (value == null) {
    return null;
  }

  if (typeof value === "object" && value !== null && "id" in value) {
    const relationId = (value as { id?: unknown }).id;
    if (relationId == null) {
      return null;
    }
  }

  return asId(value);
};

const normalizeTeam = (raw: Record<string, unknown>): ParticipantTeam => {
  const currentStation = asId(raw.current_station);
  const rawStations = raw.stations ?? raw.stations_id;
  const stations = asNullableId(rawStations);
  const user = asId(raw.user ?? raw.user_id);
  const score = Number(raw.score ?? 0);
  const teamname = String(raw.teamname ?? raw.team_name ?? "").trim();

  if (
    currentStation === undefined ||
    stations === undefined ||
    user === undefined ||
    !Number.isInteger(score) ||
    score < 0 ||
    !teamname
  ) {
    throw new Error("Некорректные данные команды");
  }

  const id = asId(raw.id);
  if (id === undefined) {
    throw new Error("Некорректный идентификатор команды");
  }

  return {
    id,
    teamname,
    score,
    user,
    stations,
    current_station: currentStation,
  };
};

export const getTeam = createEffect(async () => {
  const raw = await get("/playerteam/me");
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new Error("Некорректный ответ команды");
  }

  return normalizeTeam(raw as Record<string, unknown>);
});

export const getTeams = createEffect(async () => {
  const raw = await get("/playerteam");

  if (!Array.isArray(raw)) {
    throw new Error("Некорректный ответ списка команд");
  }

  return raw.map((team) => {
    if (typeof team !== "object" || team === null || Array.isArray(team)) {
      throw new Error("Некорректные данные команды");
    }

    return normalizeTeam(team as Record<string, unknown>);
  });
});

export const saveScore = createEffect(
  async ({ team, score }: { team: ParticipantTeam; score: number }) => {
    const response = (await post(`/playerteam/${team.id}/score`, {
      score,
    })) as SaveScoreResponse;

    if (
      typeof response?.score !== "number" ||
      typeof response?.current_station !== "number"
    ) {
      throw new Error("Некорректный ответ сохранения баллов");
    }

    return {
      ...team,
      score: response.score,
      current_station: response.current_station,
    };
  },
);
