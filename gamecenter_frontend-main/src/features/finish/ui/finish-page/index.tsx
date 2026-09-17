import { useUnit } from "effector-react";

import { $userStore } from "../../../../entities/user";
import wordmarkGreen from "../../../../shared/assets/brand/wordmark-green.svg";

import { bem, useSafari } from "../../../../shared/lib";
import { Page } from "../../../../shared/ui/page";
import { StatusPlate } from "../../../../shared/ui/status-plate";

import { FinishBlockParticipant } from "../finish-block-participant";
import { FinishBlockCurator } from "../finish-block-curator";

import "./index.scss";

export const b = bem("finish-page");

export const FinishPage = () => {
  const { me } = useUnit($userStore);

  const safari = useSafari();

  if (!me) {
    return null;
  }

  return (
    <Page>
      <StatusPlate type={me.is_player ? "participant" : "curator"} />

      <div className={b("content", { safari })}>
        <img className={b("wordmark")} src={wordmarkGreen} alt="ИграЦентр" />

        {me.is_player ? <FinishBlockParticipant /> : <FinishBlockCurator />}
      </div>
    </Page>
  );
};
