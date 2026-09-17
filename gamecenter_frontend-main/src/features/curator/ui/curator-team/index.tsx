import React, { useEffect, useState } from "react";

import {
  ParticipantTeam,
  saveScore,
} from "../../../../entities/participant-team";
import { Stantion } from "../../../../entities/stantion";

import {
  useTimer,
  bem,
  plural,
  clearStationTimer,
  readStationTimer,
  saveStationTimerEnd,
  saveStationTimerStart,
  getErrorMessage,
} from "../../../../shared/lib";
import { BriefArticle } from "../../../../shared/ui/brief-article";
import { Button } from "../../../../shared/ui/button";
import { StatusPlatePointsRaw } from "../../../../shared/ui/status-plate";

import "./index.scss";
import { useUnit } from "effector-react";

interface Props {
  team: ParticipantTeam;
  stantion: Stantion;
}

const b = bem("curator-team");

export const CuratorTeam = ({ team, stantion }: Props) => {
  const {
    spentTime,
    startTimer,
    stopTimer,
    isTimerStarted,
    isTimeEnded,
    extraMinutes,
    forceUpdateTimer,
  } = useTimer();

  const [answerAccepted, setAnswerAccepted] = React.useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // When the countdown reaches zero it stops itself inside `useTimer`.  The
  // curator must still be able to review and submit the result (with the
  // overtime penalty), so treat an automatic timeout as an accepted answer
  // just like pressing the stop button. Persisting the end also prevents a
  // remount from starting the same expired timer again.
  useEffect(() => {
    if (!isTimeEnded || answerAccepted) {
      return;
    }

    setAnswerAccepted(true);
    saveStationTimerEnd(team.id, stantion.id, Date.now() / 1000);
  }, [answerAccepted, isTimeEnded, stantion.id, team.id]);

  useEffect(() => {
    const timerState = readStationTimer(team.id, stantion.id);
    const durationSeconds = stantion.time * 60;

    if (timerState?.endTime !== undefined) {
      setAnswerAccepted(true);
      forceUpdateTimer(
        timerState.endTime - timerState.startTime,
        durationSeconds,
      );
    } else if (timerState) {
      startTimer(timerState.startTime, durationSeconds);
    }
  }, []);

  const handleStart = () => {
    const time = Date.now() / 1000;

    clearStationTimer(team.id, stantion.id);
    setAnswerAccepted(false);
    setRibbleAccepted(false);
    setSaveError(null);

    saveStationTimerStart(team.id, stantion.id, time);

    startTimer(time, stantion.time * 60);
  };

  const handleStop = () => {
    stopTimer();

    setAnswerAccepted(true);
    saveStationTimerEnd(team.id, stantion.id, Date.now() / 1000);
  };

  const [currentPoints, setCurrentPoints] = useState(stantion.points);

  const [ribbleAccepted, setRibbleAccepted] = useState(false);

  const handleRibbleButtonClick = () => {
    setCurrentPoints((points) => points + 3); // поинты доп загадки фиксированные
    setRibbleAccepted(true);
  };

  const handleSaveScore = async () => {
    const score = Math.max(0, currentPoints - extraMinutes);

    setSaveError(null);
    try {
      await saveScore({ team, score });
      clearStationTimer(team.id, stantion.id);
    } catch (error) {
      setSaveError(getErrorMessage(error, "Не удалось сохранить результат"));
    }
  };

  const isSaveScorePending = useUnit(saveScore.pending);

  return (
    <>
      <BriefArticle
        mix={b("art")}
        color="white"
        title="Станция"
        FooterContent={
          <div className={b("controls")}>
            <Button
              type="button"
              aria-label="запустить таймер"
              onClick={handleStart}
              disabled={isTimerStarted || isSaveScorePending}
              view="primary"
              mix={b("control")}
              size="s"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 14 14"
              >
                <path d="M1.97656 13.8281C1.34375 13.8281 0.898438 13.3438 0.898438 12.5703V1.42969C0.898438 0.65625 1.34375 0.171875 1.97656 0.171875C2.3125 0.171875 2.59375 0.289062 2.95312 0.5L12.1562 5.82812C12.8359 6.21875 13.1016 6.51562 13.1016 7C13.1016 7.48438 12.8359 7.78125 12.1562 8.17188L2.95312 13.5078C2.59375 13.7109 2.3125 13.8281 1.97656 13.8281Z" />
                <path d="M1.97656 13.8281C1.34375 13.8281 0.898438 13.3438 0.898438 12.5703V1.42969C0.898438 0.65625 1.34375 0.171875 1.97656 0.171875C2.3125 0.171875 2.59375 0.289062 2.95312 0.5L12.1562 5.82812C12.8359 6.21875 13.1016 6.51562 13.1016 7C13.1016 7.48438 12.8359 7.78125 12.1562 8.17188L2.95312 13.5078C2.59375 13.7109 2.3125 13.8281 1.97656 13.8281Z" />
              </svg>
            </Button>
            <Button
              type="button"
              aria-label="остановить таймер"
              onClick={handleStop}
              disabled={!isTimerStarted || answerAccepted}
              view="secondary"
              mix={b("control")}
              size="s"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="16"
                viewBox="0 0 14 14"
              >
                <path d="M0.507812 11.6953V2.30469C0.507812 1.1875 1.21094 0.507812 2.36719 0.507812H11.6328C12.7891 0.507812 13.4922 1.1875 13.4922 2.30469V11.6953C13.4922 12.8125 12.7891 13.4922 11.6328 13.4922H2.36719C1.21094 13.4922 0.507812 12.8125 0.507812 11.6953Z" />
                <path d="M0.507812 11.6953V2.30469C0.507812 1.1875 1.21094 0.507812 2.36719 0.507812H11.6328C12.7891 0.507812 13.4922 1.1875 13.4922 2.30469V11.6953C13.4922 12.8125 12.7891 13.4922 11.6328 13.4922H2.36719C1.21094 13.4922 0.507812 12.8125 0.507812 11.6953Z" />
              </svg>
            </Button>
            <div className={b("timer", { "too-much": isTimeEnded })}>
              {spentTime}
            </div>
            <div className={b("stantion-time")}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
              >
                <path
                  d="M11 7.26669V11L13.3333 13.3334M20.3333 11C20.3333 16.1547 16.1546 20.3334 11 20.3334C5.8453 20.3334 1.66663 16.1547 1.66663 11C1.66663 5.84536 5.8453 1.66669 11 1.66669C16.1546 1.66669 20.3333 5.84536 20.3333 11Z"
                  stroke="var(--font-color-dark-gray)"
                  strokeWidth="2.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{stantion.time}</span>{" "}
              <span id="mobile-none">
                {plural(["минута", "минуты", "минут"], stantion.time)}
              </span>
            </div>
          </div>
        }
      />

      <BriefArticle
        mix={b("art")}
        color="white"
        title="Штрафы"
        FooterContent={
          <div className={b("fines")}>
            <FinePlate
              title="Курение на станции"
              points={3}
              updatePoints={setCurrentPoints}
            />
            <FinePlate
              title="Мат на станции"
              points={2}
              updatePoints={setCurrentPoints}
            />
            <FinePlate
              title="Нарушение пдд"
              points={5}
              updatePoints={setCurrentPoints}
            />
            <FinePlate
              title="Недочет в ответе"
              points={1}
              updatePoints={setCurrentPoints}
            />
          </div>
        }
      />

      <BriefArticle
        mix={b("art")}
        color="white"
        title="Дополнительная загадка"
        FooterContent={
          <Button
            type="button"
            size="s"
            mix={b("riddle-btn")}
            aria-label="засчитать ответ на дополнительную загадку"
            disabled={!answerAccepted || ribbleAccepted || isSaveScorePending}
            onClick={handleRibbleButtonClick}
          >
            засчитать ответ
          </Button>
        }
      />

      <div className={b("score-row")}>
        <Button
          type="button"
          size="s"
          mix={b("send-btn")}
          aria-label="отправить баллы"
          disabled={!answerAccepted || isSaveScorePending}
          onClick={handleSaveScore}
        >
          отправить баллы
        </Button>
        <StatusPlatePointsRaw score={Math.max(currentPoints, 0)} />
      </div>

      <span className={b("warn")}>
        Проверьте количество баллов перед отправкой!
        <br />
        Результат нельзя будет изменить после отправки на сервер
      </span>
      {saveError && (
        <span className={b("error")} role="alert">
          {saveError}
        </span>
      )}
    </>
  );
};

const fb = bem("fine-plate");

interface FinePlateProps {
  title: string;
  points: number;
  updatePoints: (func: (points: number) => number) => void;
}

class FinePlate extends React.Component<FinePlateProps, { counter: number }> {
  constructor(props: FinePlateProps) {
    super(props);

    this.state = { counter: 0 };
  }

  shouldComponentUpdate(
    _: Readonly<FinePlateProps>,
    nextState: Readonly<{ counter: number }>,
  ) {
    return nextState.counter !== this.state.counter;
  }

  render(): React.ReactNode {
    const { title, points, updatePoints } = this.props;

    const handlePlusClick = () => {
      this.setState(({ counter }) => ({ counter: counter + 1 }));

      updatePoints((prev) => prev - points);
    };
    const handleMinusClick = () => {
      if (this.state.counter === 0) {
        return;
      }

      this.setState(({ counter }) => ({ counter: counter - 1 }));

      updatePoints((prev) => prev + points);
    };

    return (
      <div className={fb()}>
        <div className={fb("counter")}>{this.state.counter}</div>
        <div className={fb("text-wrapper")}>
          <div className={fb("title")}>{title}</div>
          <div
            className={fb("subtitle")}
          >{`-${points} ${plural(["балл", "балла", "баллов"], points)}`}</div>
        </div>
        <div className={fb("controls")}>
          <Button
            type="button"
            view="secondary"
            onClick={handlePlusClick}
            size="s"
            aria-label={`добавить штраф: ${title}`}
          >
            +
          </Button>
          <Button
            type="button"
            view="primary"
            onClick={handleMinusClick}
            size="s"
            aria-label={`убрать штраф: ${title}`}
            disabled={this.state.counter === 0}
          >
            -
          </Button>
        </div>
      </div>
    );
  }
}
