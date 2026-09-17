import { useEffect } from "react";
import { useUnit } from "effector-react";

import { bem, useSafari } from "../../../../shared/lib";

import { $stantionsStore, getStantions } from "../../../../entities/stantion";

import { Page } from "../../../../shared/ui/page";
import { StatusPlate } from "../../../../shared/ui/status-plate";
import { LoadError } from "../../../../shared/ui/load-error";
import { LoadingState } from "../../../../shared/ui/loading-state";

import { ParticipantLocations } from "../participant-locations";

import "./index.scss";

const b = bem("participant-page");

export const ParticipantPage = () => {
  const {
    loading: isLoading,
    stantions,
    stantionsOrder,
    error,
  } = useUnit($stantionsStore);

  useEffect(() => {
    if (!stantions || !stantionsOrder) {
      void getStantions();
    }
  }, [stantions, stantionsOrder]);

  const safari = useSafari();

  if (error) {
    return (
      <Page>
        <LoadError message={error} onRetry={() => void getStantions()} />
      </Page>
    );
  }

  if (isLoading) {
    return (
      <Page>
        <LoadingState message="Загружаем станции…" />
      </Page>
    );
  }

  return (
    <Page>
      <StatusPlate type="participant" />

      <ParticipantLocations mix={b("locations", { safari })} />
    </Page>
  );
};
