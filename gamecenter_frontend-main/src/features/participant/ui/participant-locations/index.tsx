import cx from "classnames";
import { useUnit } from "effector-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";

import { $teamsStore } from "../../../../entities/participant-team";

import { bem, getMediaUrl, plural } from "../../../../shared/lib";
import { BriefArticle } from "../../../../shared/ui/brief-article";
import { PopupPlate } from "../../../../shared/ui/popup-plate";
import { SetupState } from "../../../../shared/ui/setup-state";
import {
  StatusPlatePointsRaw,
  StatusPlateTimeRaw,
} from "../../../../shared/ui/status-plate";

import { useOrderedStantionsById } from "../../lib/hooks";

import "./index.scss";

export const b = bem("participant-locations");

interface Props {
  mix?: string;
}

export const ParticipantLocations = ({ mix }: Props) => {
  const { team } = useUnit($teamsStore);
  const redirect = useNavigate();
  const orderedStantions = useOrderedStantionsById(team?.stations ?? undefined);

  useEffect(() => {
    if (
      team?.current_station &&
      orderedStantions?.length &&
      team.current_station > orderedStantions.length
    ) {
      redirect("/finisher", { replace: true });
    }
  }, [orderedStantions?.length, redirect, team?.current_station]);

  if (!team) {
    return null;
  }

  if (team.stations === null) {
    return (
      <div className={cx(b(), mix)}>
        <SetupState
          title="Маршрут ещё не назначен"
          message="Организатор скоро добавит станции для вашей команды."
        />
      </div>
    );
  }

  if (!orderedStantions?.some(Boolean)) {
    return (
      <div className={cx(b(), mix)}>
        <SetupState
          title="Станции пока недоступны"
          message="Маршрут загружается или ещё не заполнен. Попробуйте обновить страницу позже."
        />
      </div>
    );
  }

  if (
    team.current_station <= orderedStantions.length &&
    !orderedStantions[team.current_station - 1]
  ) {
    return (
      <div className={cx(b(), mix)}>
        <SetupState
          title="Текущая станция ещё не назначена"
          message="Организатор дополняет маршрут. Обновите страницу немного позже."
        />
      </div>
    );
  }

  return (
    <div className={cx(b(), mix)}>
      <div className={b("viewport")}>
        {orderedStantions?.map((stantion, index) => {
          if (!stantion) {
            return null;
          }

          const { id, name, description, assignment, image } = stantion;
          const stationNumber = index + 1;
          const status =
            stationNumber === team.current_station
              ? "active"
              : stationNumber < team.current_station
                ? "finished"
                : "locked";

          if (status !== "active") {
            return (
              <PopupPlate
                mix={b("content-wrapper")}
                title={name}
                status={status}
                numberic={stationNumber}
                key={id}
                color="gray"
                animationDelay={Math.min(index, 8) * 45 + 40}
              />
            );
          }

          return (
            <PopupPlate
              mix={b("content-wrapper")}
              title={name}
              status={
                stationNumber === orderedStantions.length
                  ? "finish-stantion"
                  : "active"
              }
              numberic={stationNumber}
              key={id}
              defaultExpanded
              color="gray"
              animationDelay={Math.min(index, 8) * 45 + 40}
            >
              <BriefArticle
                title="Историческая справка"
                color="white"
                markdown={description}
                image={getMediaUrl(image)}
              />
              <BriefArticle
                title="Задание"
                markdown={assignment}
                color="white"
                mix={b("question")}
                Footer={() => (
                  <div style={{ display: "flex", marginTop: 12 }}>
                    <StatusPlateTimeRaw
                      time={
                        String(stantion.time) +
                        " " +
                        plural(["минута", "минуты", "минут"], stantion.time)
                      }
                      mix={b("time-plate")}
                    />
                    <StatusPlatePointsRaw score={stantion.points} />
                  </div>
                )}
              />
            </PopupPlate>
          );
        })}
      </div>
    </div>
  );
};
