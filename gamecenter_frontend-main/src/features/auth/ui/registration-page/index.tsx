import React from "react";
import { useUnit } from "effector-react";
import { useNavigate } from "react-router";

import { $userStore } from "../../../../entities/user";
import productionMark from "../../../../shared/assets/brand/orgcom-production-mark.png";
import { Page } from "../../../../shared/ui/page";

import { RegistrationForm } from "../registration-form";

import "./index.scss";

export const RegistrationPage = () => {
  const { me } = useUnit($userStore);

  const redirect = useNavigate();

  // хук срабатывает когда изменяется информация об авторизации
  React.useEffect(() => {
    if (me && !localStorage.getItem("agreed")) {
      redirect("/welcome");
    } else if (me?.is_player) {
      redirect("/participant");
    } else if (me?.is_curator) {
      redirect("/curator");
    }
  }, [me, redirect]);

  return (
    <Page mix="registration-page">
      <img
        className="registration-page__watermark"
        src={productionMark}
        alt=""
        aria-hidden="true"
      />
      <RegistrationForm />
    </Page>
  );
};
