import { useUnit } from "effector-react";

import { $teamsStore } from "../../../../entities/participant-team";

import { b } from "../finish-page/";
import { BriefArticle } from "../../../../shared/ui/brief-article";
import { StatusPlatePointsRaw } from "../../../../shared/ui/status-plate";
import { StatusPlateLocations } from "../../../../shared/ui/status-plate/__locations";
import { StatusPlateTime } from "../../../../shared/ui/status-plate/__time";

export const FinishBlockParticipant = () => {
  const { team } = useUnit($teamsStore);

  const isFullyFinished = team?.current_station === 11;

  const { title, subtitle, pointsPlate, timePlate, whatsNext } =
    getText(isFullyFinished);

  return (
    <>
      <div className={b("titles")}>
        <span className={b("title")}>{title}</span>
        <span className={b("subtitle")}>{subtitle}</span>
      </div>
      <div className={b("plates")}>
        <div className={b("plate")}>
          <span>{pointsPlate}</span>
          <StatusPlatePointsRaw score={team?.score} />
        </div>
        <div className={b("plate")}>
          <span>{timePlate}</span>
          {isFullyFinished ? <StatusPlateLocations /> : <StatusPlateTime />}
        </div>
      </div>

      {!isFullyFinished && (
        <BriefArticle title="Что дальше?" markdown={whatsNext} color="gray" />
      )}
    </>
  );
};

const getText = (isFullyFinished: boolean) => {
  const title = isFullyFinished ? "квест завершён!" : "квест продолжается!";
  const subtitle = isFullyFinished
    ? "поздравляем!"
    : "у команды нет общего ограничения по времени";

  const pointsPlate = isFullyFinished
    ? "Ваша команда прошла все станции и заработала:"
    : "Ваша команда уже заработала:";

  const timePlate = isFullyFinished
    ? "Многие люди на планете не прошли ни одной станции, а вы справились с:"
    : "Общее время прохождения не ограничено:";

  const whatsNext =
    "Отправляйтесь на Мойку, 61, там будет официальное закрытие квеста";

  return { title, subtitle, pointsPlate, timePlate, whatsNext };
};
