import { useEffect, useState } from "react";
import cx from "classnames";

import productionMark from "../../assets/brand/orgcom-production-mark.png";

import "./index.scss";

type Phase = "playing" | "leaving" | "hidden";

interface Props {
  onLeaving?: () => void;
}

export const StartupIntro = ({ onLeaving }: Props) => {
  const [phase, setPhase] = useState<Phase>("playing");

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let hideTimer: number | undefined;

    const leaveTimer = window.setTimeout(
      () => {
        setPhase("leaving");
        onLeaving?.();
        hideTimer = window.setTimeout(
          () => setPhase("hidden"),
          reducedMotion ? 120 : 620,
        );
      },
      reducedMotion ? 280 : 3750,
    );

    return () => {
      window.clearTimeout(leaveTimer);
      if (hideTimer) {
        window.clearTimeout(hideTimer);
      }
    };
  }, [onLeaving]);

  if (phase === "hidden") {
    return null;
  }

  return (
    <div
      className={cx("startup-intro", {
        "startup-intro_leaving": phase === "leaving",
      })}
      role="status"
      aria-label="ORG.COM PRODUCTION. ИграЦентр загружается"
    >
      <div className="startup-intro__frame" aria-hidden="true">
        <span className="startup-intro__meta startup-intro__meta_left">
          ИГРАЦЕНТР / 26
        </span>
        <span className="startup-intro__meta startup-intro__meta_right">
          SAINT-PETERSBURG
        </span>

        <div className="startup-intro__lockup">
          <div className="startup-intro__mark-shell">
            <span className="startup-intro__orbit" />
            <img className="startup-intro__mark" src={productionMark} alt="" />
          </div>

          <div className="startup-intro__brand">
            <div className="startup-intro__name">
              <span>O</span>
              <span>R</span>
              <span>G</span>
              <span>.</span>
              <span>C</span>
              <span>O</span>
              <span>M</span>
            </div>
            <div className="startup-intro__production">PRODUCTION</div>
          </div>

          <div className="startup-intro__progress">
            <span />
          </div>
        </div>

        <span className="startup-intro__edition">EST. 2026</span>
      </div>
    </div>
  );
};
