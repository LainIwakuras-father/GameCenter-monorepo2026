import { createStore } from "effector";

import { getErrorMessage } from "../../shared/lib";
import { sessionReset } from "../../shared/lib/session";

import { getTeam, getTeams, saveScore } from "./api";
import type { ParticipantTeam } from "./typings";

export const $teamsStore = createStore<{
  loading: boolean;
  team: ParticipantTeam | null;
  allTeams: ParticipantTeam[] | null;
  error: string | null;
}>({ loading: true, team: null, allTeams: null, error: null });

$teamsStore.on(getTeam, (state) => ({
  ...state,
  loading: true,
  error: null,
}));

$teamsStore.on(getTeam.doneData, (state, myTeam) => ({
  ...state,
  loading: false,
  team: myTeam,
  error: null,
}));

$teamsStore.on(getTeams, (state) => ({
  ...state,
  loading: true,
  error: null,
}));

$teamsStore.on(getTeams.doneData, (state, teams) => ({
  ...state,
  loading: false,
  error: null,
  allTeams: [...teams].sort((a, b) => {
    if (a.teamname < b.teamname) {
      return -1;
    } else if (a.teamname > b.teamname) {
      return 1;
    }
    return 0;
  }),
}));

$teamsStore.on(getTeam.failData, (state, error) => ({
  ...state,
  loading: false,
  error: getErrorMessage(error, "Не удалось загрузить команду"),
}));

$teamsStore.on(getTeams.failData, (state, error) => ({
  ...state,
  loading: false,
  error: getErrorMessage(error, "Не удалось загрузить команды"),
}));

$teamsStore.on(saveScore.doneData, (state, updatedTeam) => {
  const allTeams = state.allTeams?.map((stateTeam) =>
    stateTeam.id === updatedTeam.id
      ? {
          ...stateTeam,
          score: updatedTeam.score,
          current_station: updatedTeam.current_station,
        }
      : stateTeam,
  );

  return {
    ...state,
    error: null,
    allTeams: allTeams ?? null,
    team: state.team?.id === updatedTeam.id ? updatedTeam : state.team,
  };
});

$teamsStore.on(saveScore.failData, (state, error) => ({
  ...state,
  error: getErrorMessage(error, "Не удалось сохранить результат"),
}));

$teamsStore.on(sessionReset, () => ({
  loading: false,
  team: null,
  allTeams: null,
  error: null,
}));
