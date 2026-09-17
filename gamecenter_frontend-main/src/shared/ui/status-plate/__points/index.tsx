import { useUnit } from "effector-react";
import cx from "classnames";

import { $teamsStore } from "../../../../entities/participant-team";

import { b } from "../status-plate";

export const StatusPlatePoints = () => {
  const { team } = useUnit($teamsStore);

  return <StatusPlatePointsRaw score={team?.score} mix={b("wrapped-block")} />;
};

export const StatusPlatePointsRaw = ({
  score,
  mix,
}: {
  score?: number;
  mix?: string;
}) => (
  <div className={cx(b("block", { secondary: true }), mix)}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M0 3.33333C0 1.49238 1.49238 0 3.33333 0H16.6667C18.5076 0 20 1.49238 20 3.33333V16.6667C20 18.5076 18.5076 20 16.6667 20H3.33333C1.49238 20 0 18.5076 0 16.6667V3.33333Z"
        fill="var(--control-color-secondary-text)"
      />
      <path
        d="M7.57161 15C6.95313 15 6.58854 14.6224 6.58854 13.9714V6.6276C6.58854 5.98307 6.95313 5.60547 7.57161 5.60547H12.0508C12.5911 5.60547 12.9427 5.90495 12.9427 6.41276C12.9427 6.92057 12.5846 7.22656 12.0508 7.22656H8.55469V9.13411H10.3776C12.3372 9.13411 13.6979 10.2995 13.6979 12.0378C13.6979 13.8151 12.3698 15 10.4427 15H7.57161ZM8.55469 13.431H9.95443C11.0482 13.431 11.6862 12.9427 11.6862 12.0378C11.6862 11.1263 11.0482 10.6315 9.94792 10.6315H8.55469V13.431Z"
        fill="var(--control-color-secondary)"
      />
    </svg>
    {score}
  </div>
);
