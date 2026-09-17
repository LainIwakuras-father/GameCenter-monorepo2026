import { useUnit } from "effector-react";
import cx from "classnames";

import { $teamsStore } from "../../../../entities/participant-team";

import { b } from "../status-plate";

export const StatusPlateLocations = () => {
  const { team } = useUnit($teamsStore);

  return (
    <div className={cx(b("block"), b("wrapped-block"))}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="22"
        viewBox="0 0 20 22"
        fill="none"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10 12.3251C10.7075 12.3251 11.386 12.0441 11.8864 11.544C12.3868 11.0439 12.6681 10.3655 12.6684 9.65801C12.6684 8.95031 12.3873 8.2716 11.8869 7.77118C11.3864 7.27076 10.7077 6.98963 10 6.98963C9.29232 6.98963 8.61361 7.27076 8.11319 7.77118C7.61277 8.2716 7.33164 8.95031 7.33164 9.65801C7.33199 10.3655 7.61328 11.0439 8.11366 11.544C8.61404 12.0441 9.29255 12.3251 10 12.3251Z"
          stroke="var(--control-color-disabled-text)"
          strokeWidth="2.33"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M18.0052 9.65801C18.0052 16.325 11.3342 20.3249 10 20.3249C8.66583 20.3249 1.99487 16.325 1.99487 9.65801C1.99593 7.53573 2.83984 5.50076 4.34102 4.00058C5.8422 2.5004 7.87774 1.65785 10 1.6582C14.4202 1.6582 18.0052 5.24051 18.0052 9.65801Z"
          stroke="var(--control-color-disabled-text)"
          strokeWidth="2.33"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {(team?.current_station || 1) - 1} / 10
    </div>
  );
};
