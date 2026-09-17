import { createEffect } from "effector";

import { get } from "../../shared/lib";

import { getCurator } from "../curator";
import { getTeam } from "../participant-team";

import type { Me } from "./typings";

export const getMe = createEffect(async () => {
  const raw = await get("/user/me");
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new Error("Некорректный ответ пользователя");
  }

  const me = raw as Me;
  if (
    !Number.isInteger(me.user_id) ||
    me.user_id < 1 ||
    typeof me.is_player !== "boolean" ||
    typeof me.is_curator !== "boolean" ||
    typeof me.is_superuser !== "boolean"
  ) {
    throw new Error("Некорректные данные пользователя");
  }

  // A user may have both role relations during administration or a staged
  // event setup.  Load every relation returned by `/user/me` so navigating to
  // either role page never leaves its store empty.
  await Promise.all([
    me.is_player ? getTeam() : Promise.resolve(),
    me.is_curator ? getCurator() : Promise.resolve(),
  ]);

  return me;
});
