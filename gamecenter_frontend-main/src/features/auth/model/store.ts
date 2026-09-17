import { createStore, createEffect, createEvent } from "effector";

import { clearMe, getMe } from "../../../entities/user";
import {
  getErrorMessage,
  post,
  postNoBody,
  setAuthToken,
  removeAuthToken,
  sessionExpired,
} from "../../../shared/lib";

interface AuthState {
  error: string | null;
  isAuthenticated: boolean;
}

export const setAuthState = createEvent<Partial<AuthState>>();

export const $authStore = createStore<AuthState>({
  error: null,
  isAuthenticated: !!localStorage.getItem("access_token"),
});

$authStore.on(setAuthState, (state, payload) => ({
  ...state,
  ...payload,
}));

$authStore.on(sessionExpired, () => ({
  error: null,
  isAuthenticated: false,
}));

export const postCheckAuth = createEffect(
  async (payload: { username: string; password: string }) => {
    setNoError();

    try {
      const { access } = (await post("/token", payload)) as {
        access: string;
      };

      if (!access) {
        throw Error("Invalid token response");
      }

      setAuthToken(access);
      setAuthState({ isAuthenticated: true });

      await getMe();
    } catch (e) {
      removeAuthToken();
      setAuthState({ isAuthenticated: false });
      setError(
        getErrorMessage(
          e,
          "Не удалось войти. Проверьте подключение и повторите попытку",
        ),
      );
      throw e;
    }
  },
);

export const logout = createEffect(async () => {
  try {
    await postNoBody("/token/logout");
  } catch {
    // Local logout must still complete when the server is unreachable.
  } finally {
    removeAuthToken();
    localStorage.removeItem("agreed");
    clearMe();
    setAuthState({ isAuthenticated: false });
  }
});

export const setError = createEvent<string>();

$authStore.on(setError, (state, error) => ({
  ...state,
  error,
}));

export const setNoError = createEvent();

$authStore.on(setNoError, (state) => ({
  ...state,
  error: null,
}));
