import { createStore } from "effector";

import { getErrorMessage } from "../../shared/lib";
import { sessionReset } from "../../shared/lib/session";

import { getMe } from "./api";
import type { Me } from "./typings";

export const $userStore = createStore<{
  loading: boolean;
  me: Me | null;
  error: string | null;
}>({ loading: true, me: null, error: null });

/** Clears the in-memory session after an explicit logout. */
export const clearMe = sessionReset;

$userStore.on(clearMe, () => ({
  loading: false,
  me: null,
  error: null,
}));

$userStore.on(getMe, (state) => ({
  ...state,
  loading: true,
  error: null,
}));

$userStore.on(getMe.doneData, (_, me) => ({
  me,
  loading: false,
  error: null,
}));

$userStore.on(getMe.failData, (state, error) => ({
  ...state,
  loading: false,
  me: null,
  error: getErrorMessage(error, "Не удалось проверить авторизацию"),
}));
