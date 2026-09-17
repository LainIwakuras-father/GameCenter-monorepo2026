import { createStore } from "effector";

import { getErrorMessage } from "../../shared/lib";
import { sessionReset } from "../../shared/lib/session";

import { getCurator } from "./api";
import type { Curator } from "./typings";

export const $curatorStore = createStore<{
  curator: Curator | null;
  loading: boolean;
  error: string | null;
}>({
  curator: null,
  loading: true,
  error: null,
});

$curatorStore.on(getCurator, (state) => ({
  ...state,
  loading: true,
  error: null,
}));

$curatorStore.on(getCurator.doneData, (_, curator) => ({
  curator,
  loading: false,
  error: null,
}));

$curatorStore.on(getCurator.failData, (state, error) => ({
  ...state,
  loading: false,
  error: getErrorMessage(error, "Не удалось загрузить данные куратора"),
}));

$curatorStore.on(sessionReset, () => ({
  curator: null,
  loading: false,
  error: null,
}));
