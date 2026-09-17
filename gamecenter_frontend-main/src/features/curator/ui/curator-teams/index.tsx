import cx from "classnames";
import { useUnit } from "effector-react";
import { useEffect } from "react";

import { $curatorStore } from "../../../../entities/curator";
import { $stantionsStore } from "../../../../entities/stantion";

import { bem } from "../../../../shared/lib";
import { PopupPlate } from "../../../../shared/ui/popup-plate";
import { SetupState } from "../../../../shared/ui/setup-state";
import { $teamsStore } from "../../../../entities/participant-team";

import { useAcceptedTeamsCount, useMapTeamIdToStatus } from "../../lib/hooks";

import { CuratorTeam } from "../curator-team";

import "./index.scss";
import { useNavigate } from "react-router";

interface Props {
  mix?: string;
}

export const b = bem("curator-teams");

export const CuratorTeams = ({ mix }: Props) => {
  const { curator } = useUnit($curatorStore);
  const { allTeams } = useUnit($teamsStore);
  const { stantions } = useUnit($stantionsStore);

  const redirect = useNavigate();
  const stationId = curator?.station ?? undefined;

  const { count, teamsCount } = useAcceptedTeamsCount(stationId);
  useEffect(() => {
    if (teamsCount > 0 && count === teamsCount) {
      redirect("/finisher", { replace: true });
    }
  }, [count, redirect, teamsCount]);

  const stantion = stationId === undefined ? undefined : stantions?.[stationId];

  const teamIdToStatus = useMapTeamIdToStatus(stationId);

  if (curator?.station == null) {
    return (
      <div className={cx(b(), mix)}>
        <SetupState
          title="Станция ещё не назначена"
          message="Организатор скоро назначит вам станцию и команды для работы."
        />
      </div>
    );
  }

  if (!stantion) {
    return (
      <div className={cx(b(), mix)}>
        <SetupState
          title="Станция пока недоступна"
          message="Данные станции ещё не настроены. Попробуйте обновить страницу позже."
        />
      </div>
    );
  }

  if (allTeams && allTeams.length === 0) {
    return (
      <div className={cx(b(), mix)}>
        <SetupState
          title="Команды ещё не добавлены"
          message="Как только участники присоединятся к игре, они появятся здесь."
        />
      </div>
    );
  }

  return (
    <div className={cx(b(), mix)}>
      <div className={b("scroll")}>
        {allTeams?.map((team, index) => {
          const { teamname, id } = team;
          const stationNumber = index + 1;

          if (teamIdToStatus[team.id] === "accepted") {
            return (
              <PopupPlate
                mix={b("content-wrapper")}
                title={teamname}
                status="finished"
                key={`${id}-${team.current_station}`}
                color="gray"
                animationDelay={Math.min(index, 8) * 45 + 40}
              />
            );
          } else if (teamIdToStatus[team.id] === "on-prev-stantions") {
            return (
              <PopupPlate
                mix={b("content-wrapper")}
                title={teamname}
                status="locked"
                key={`${id}-${team.current_station}`}
                color="gray"
                animationDelay={Math.min(index, 8) * 45 + 40}
              />
            );
          }

          return (
            <PopupPlate
              mix={b("content-wrapper")}
              title={teamname}
              status="active"
              numberic={stationNumber}
              key={`${id}-${team.current_station}`}
              color="gray"
              animationDelay={Math.min(index, 8) * 45 + 40}
            >
              <CuratorTeam team={team} stantion={stantion} />
            </PopupPlate>
          );
        })}
      </div>
    </div>
  );
};
