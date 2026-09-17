import { useEffect } from "react";
import { useUnit } from "effector-react";

import { bem, useSafari } from "../../../../shared/lib";
import { $teamsStore, getTeams } from "../../../../entities/participant-team";
import { $stantionsStore, getStantions } from "../../../../entities/stantion";

import { Page } from "../../../../shared/ui/page";
import { StatusPlate } from "../../../../shared/ui/status-plate";
import { LoadError } from "../../../../shared/ui/load-error";
import { LoadingState } from "../../../../shared/ui/loading-state";

import { CuratorTeams } from "../curator-teams";

import "./index.scss";

const b = bem("curator-page");

export const CuratorPage = () => {
  const {
    loading: tLoading,
    allTeams,
    error: teamsError,
  } = useUnit($teamsStore);
  const {
    loading: sLoading,
    stantions,
    error: stantionsError,
  } = useUnit($stantionsStore);

  useEffect(() => {
    if (!allTeams) {
      void getTeams();
    }

    if (!stantions) {
      void getStantions();
    }
  }, [allTeams, stantions]);

  const safari = useSafari();

  if (teamsError || stantionsError) {
    return (
      <Page>
        <LoadError
          message={
            teamsError || stantionsError || "Не удалось загрузить данные"
          }
          onRetry={() => {
            if (teamsError) {
              void getTeams();
            }
            if (stantionsError) {
              void getStantions();
            }
          }}
        />
      </Page>
    );
  }

  if (tLoading || sLoading) {
    return (
      <Page>
        <LoadingState message="Загружаем команды…" />
      </Page>
    );
  }

  return (
    <Page>
      <StatusPlate type="curator" />

      <CuratorTeams mix={b("teams", { safari })} />
    </Page>
  );
};
