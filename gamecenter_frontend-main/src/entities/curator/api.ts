import { createEffect } from "effector";

import { get } from "../../shared/lib";

import type { Curator } from "./typings";

export const getCurator = createEffect(async () => {
  const raw = await get("/curator/me");
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new Error("Некорректный ответ куратора");
  }

  const value = raw as Record<string, unknown>;
  const station = value.station ?? value.station_id;
  const user = value.user ?? value.user_id;
  const id = Number(value.id);
  const stationValue =
    typeof station === "object" && station !== null
      ? (station as { id?: unknown }).id
      : station;
  const stationId = stationValue == null ? null : Number(stationValue);
  const userId = Number(
    typeof user === "object" && user !== null
      ? (user as { id?: unknown }).id
      : user,
  );

  if (
    !Number.isInteger(id) ||
    id < 1 ||
    (stationId !== null && (!Number.isInteger(stationId) || stationId < 1)) ||
    !Number.isInteger(userId) ||
    userId < 1
  ) {
    throw new Error("Некорректные данные куратора");
  }

  return {
    id,
    name: String(value.name ?? ""),
    station: stationId,
    user: userId,
  } satisfies Curator;
});
