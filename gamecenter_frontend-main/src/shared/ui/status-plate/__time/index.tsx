import cx from "classnames";

import { b } from "../status-plate";

export const StatusPlateTime = () => (
  <StatusPlateTimeRaw time="без лимита" mix={b("wrapped-block")} />
);

export const StatusPlateTimeRaw = ({
  time,
  mix,
}: {
  time: string;
  mix: string;
}) => (
  <div className={cx(b("block", { time: true }), mix)}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
    >
      <path
        d="M11.0001 7.26663V11L13.3334 13.3333M20.3334 11C20.3334 16.1546 16.1547 20.3333 11.0001 20.3333C5.84542 20.3333 1.66675 16.1546 1.66675 11C1.66675 5.8453 5.84542 1.66663 11.0001 1.66663C16.1547 1.66663 20.3334 5.8453 20.3334 11Z"
        stroke="var(--control-color-disabled-text)"
        strokeWidth="2.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>

    {time}
  </div>
);
