import { bem } from "../../lib";
import { Logo } from "../logo";

import { StatusPlateLocations } from "./__locations";
import { StatusPlatePoints } from "./__points";
import { StatusPlateTeams } from "./__teams";
import { StatusPlateStantionName } from "./__stantion-name";

import "./index.scss";

interface Props {
  type: "participant" | "curator";
}

export const b = bem("status-plate");

export const StatusPlate = ({ type }: Props) => (
  <>
    <div className={b()}>
      <Logo mix={b("logo")} />

      <div className={b("flex-center")}>
        {type === "participant" ? (
          <>
            <StatusPlateLocations />
            <StatusPlatePoints />
          </>
        ) : (
          <StatusPlateTeams />
        )}
      </div>
    </div>

    {type === "curator" && <StatusPlateStantionName />}
  </>
);
