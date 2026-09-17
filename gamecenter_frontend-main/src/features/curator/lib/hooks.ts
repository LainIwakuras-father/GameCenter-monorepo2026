import { useMemo } from "react";
import { useUnit } from "effector-react";

import { $stantionsStore, StantionsOrder } from "../../../entities/stantion";
import {
  $teamsStore,
  ParticipantTeam,
} from "../../../entities/participant-team";

export const useMapTeamIdToStantionsOrder = () => {
  const { allTeams } = useUnit($teamsStore);
  const { stantionsOrder } = useUnit($stantionsStore);

  const mapStantionsOrderByTeamId: Partial<
    Record<ParticipantTeam["id"], StantionsOrder>
  > = useMemo(() => {
    const x: Partial<Record<ParticipantTeam["id"], StantionsOrder>> = {};

    allTeams?.forEach(({ id, stations }) => {
      const stationOrder = stantionsOrder?.find(
        (order) => order.id === stations,
      );
      if (stationOrder) {
        x[id] = stationOrder;
      }
    });

    return x;
  }, [allTeams, stantionsOrder]);

  return mapStantionsOrderByTeamId;
};

export const useMapTeamIdToStatus = (stantionId?: number) => {
  const { allTeams } = useUnit($teamsStore);

  const mapStantionsOrderByTeamId = useMapTeamIdToStantionsOrder();

  const teamIdToStatus: Record<
    ParticipantTeam["id"],
    "accepted" | "not-accepted" | "on-prev-stantions"
  > = {};

  if (!allTeams) {
    return {};
  }

  allTeams.forEach((team) => {
    teamIdToStatus[team.id] = "on-prev-stantions";
    const stationOrder = mapStantionsOrderByTeamId[team.id]?.order;
    if (!stationOrder || typeof stantionId !== "number") {
      return;
    }

    for (let i = 1; i < team.current_station; i++) {
      if (stationOrder[i - 1] === stantionId) {
        teamIdToStatus[team.id] = "accepted";
        break;
      }
    }

    if (stationOrder[team.current_station - 1] === stantionId) {
      teamIdToStatus[team.id] = "not-accepted";
    }
  });

  return teamIdToStatus;
};

export const useAcceptedTeamsCount = (stantionId?: number) => {
  const { allTeams } = useUnit($teamsStore);

  const mapStantionsOrderByTeamId = useMapTeamIdToStantionsOrder();

  if (typeof stantionId !== "number" || !allTeams) {
    return { count: 0, teamsCount: 0 };
  }

  const teamsWithRoutes = allTeams.filter(
    ({ id }) => mapStantionsOrderByTeamId[id] !== undefined,
  );

  const count = teamsWithRoutes.reduce((prev, { id, current_station }) => {
    const stationOrder = mapStantionsOrderByTeamId[id]?.order;
    if (!stationOrder) {
      return prev;
    }

    for (let i = 1; i < current_station; i++) {
      if (stationOrder[i - 1] === stantionId) {
        return prev + 1;
      }
    }

    return prev;
  }, 0);

  // Teams without a route cannot arrive at this station and must not block a
  // curator from completing their station.  They remain visible in the list
  // as locked entries, but are excluded from the progress denominator.
  return { count, teamsCount: teamsWithRoutes.length };
};
