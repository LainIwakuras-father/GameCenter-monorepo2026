import { useMemo } from "react";
import { useUnit } from "effector-react";

import { $stantionsStore } from "../../../entities/stantion";

export const useOrderedStantionsById = (
  stantionOrderId: number | null | undefined,
) => {
  const { stantionsOrder, stantions } = useUnit($stantionsStore);

  const teamStantionsOrder = useMemo(
    () => stantionsOrder?.find(({ id }) => id === stantionOrderId),
    [stantionOrderId, stantionsOrder],
  );

  const orderedStantions = useMemo(() => {
    if (!teamStantionsOrder?.order || !stantions) {
      return undefined;
    }

    return teamStantionsOrder.order.map((stantionId) =>
      stantionId == null ? null : (stantions[stantionId] ?? null),
    );
  }, [stantions, teamStantionsOrder]);

  return orderedStantions;
};
