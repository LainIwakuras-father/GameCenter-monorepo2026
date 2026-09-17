import React, { useEffect } from "react";
import { useUnit } from "effector-react";

import wordmarkGreen from "../../../../shared/assets/brand/wordmark-green.svg";
import star from "../../../../shared/assets/brand/star.svg";
import { getMe } from "../../../../entities/user";
import { Button } from "../../../../shared/ui/button";
import { Logo } from "../../../../shared/ui/logo";
import { $authStore, postCheckAuth } from "../../model/store";

import "./index.scss";

/** Форма регистрации при входе на платформу */
export const RegistrationForm = () => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [wasEdited, setWasEdited] = React.useState(false);

  const postCheckAuthPending = useUnit(postCheckAuth.pending);
  const getMePending = useUnit(getMe.pending);
  const pending = postCheckAuthPending || getMePending;

  const { error } = useUnit($authStore);
  const hasError = Boolean(error);

  useEffect(() => {
    setWasEdited(true);
  }, [username, password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setWasEdited(false);
    void postCheckAuth({ username, password }).catch(() => undefined);
  };

  const shouldDisableSubmit =
    pending || !username || !password || (hasError && !wasEdited);

  return (
    <form className="registration-form" onSubmit={handleSubmit}>
      <div className="registration-form__eyebrow">
        <span>вход на маршрут</span>
        <span>01 / 26</span>
      </div>

      <div className="registration-form__hero">
        <div className="registration-form__logo-wrap">
          <Logo mix="registration-form__logo" />
        </div>
        <img
          className="registration-form__wordmark"
          src={wordmarkGreen}
          alt="ИграЦентр"
        />
        <img className="registration-form__star" src={star} alt="" />
        <span className="registration-form__subtitle">
          городской квест для тех, кто готов свернуть с прямой дороги
        </span>
      </div>

      <div className="registration-form__heading">
        <span className="registration-form__kicker">доступ участника</span>
        <span className="registration-form__title">авторизация</span>
      </div>

      <div className="registration-form__controls">
        <label className="registration-form__field">
          <span>логин</span>
          <input
            className="registration-form__input"
            placeholder="введи логин"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            name="login"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            aria-required="true"
            aria-invalid={Boolean(hasError && !wasEdited)}
            aria-describedby={
              hasError && !wasEdited ? "registration-error" : undefined
            }
          />
        </label>
        <label className="registration-form__field">
          <span>пароль</span>
          <input
            className="registration-form__input"
            placeholder="введи пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            name="password"
            autoComplete="current-password"
            required
            aria-required="true"
            aria-invalid={Boolean(hasError && !wasEdited)}
            aria-describedby={
              hasError && !wasEdited ? "registration-error" : undefined
            }
          />
        </label>

        <Button type="submit" disabled={shouldDisableSubmit}>
          войти в игру
        </Button>
      </div>

      {hasError && !wasEdited && (
        <div
          className="registration-form__error"
          id="registration-error"
          role="alert"
        >
          {error}
        </div>
      )}
    </form>
  );
};
