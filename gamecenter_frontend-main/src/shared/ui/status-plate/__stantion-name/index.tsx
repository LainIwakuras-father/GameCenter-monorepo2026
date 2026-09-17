import { useUnit } from "effector-react";

import { $curatorStore } from "../../../../entities/curator";
import { $stantionsStore } from "../../../../entities/stantion";

import { b } from "../status-plate";

export const StatusPlateStantionName = () => {
  const { curator } = useUnit($curatorStore);
  const { stantions } = useUnit($stantionsStore);

  const myStantion = stantions?.[curator?.station || 0];

  return (
    <div className={b("stantion-name")}>
      {myStantion?.name || "станция не назначена"}
    </div>
  );
};
