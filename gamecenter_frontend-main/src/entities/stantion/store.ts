import { createStore } from "effector";

import { getErrorMessage } from "../../shared/lib";
import { sessionReset } from "../../shared/lib/session";

import { getStantions } from "./api";
import type { Stantion, StantionsOrder } from "./typings";

export const $stantionsStore = createStore<{
  loading: boolean;
  stantions: Record<Stantion["id"], Stantion> | null;
  stantionsOrder: StantionsOrder[] | null;
  error: string | null;
}>({
  loading: true,
  stantions: null,
  stantionsOrder: null,
  error: null,
});

$stantionsStore.on(getStantions, (state) => ({
  ...state,
  loading: true,
  error: null,
}));

$stantionsStore.on(getStantions.doneData, (_, payload) => ({
  loading: false,
  error: null,
  ...payload,
}));

$stantionsStore.on(getStantions.failData, (state, error) => ({
  ...state,
  loading: false,
  error: getErrorMessage(error, "Не удалось загрузить станции"),
}));

$stantionsStore.on(sessionReset, () => ({
  loading: false,
  stantions: null,
  stantionsOrder: null,
  error: null,
}));
