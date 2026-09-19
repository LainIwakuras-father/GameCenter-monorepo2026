import { useUnit } from "effector-react";
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router";

import { CuratorPage } from "./features/curator";
import { ParticipantPage } from "./features/participant";
import { RegistrationPage } from "./features/auth";
import { WelcomePage } from "./features/welcome";
import { FinishPage } from "./features/finish";
import { SupportPage } from "./features/support";
import { BlinkPage } from "./features/blink";
import { OrgcomPage } from "./features/orgcom";

import { $userStore, clearMe, getMe } from "./entities/user";
import {
  ApiError,
  getErrorMessage,
  getAdminUrl,
  removeAuthToken,
  sessionExpired,
} from "./shared/lib";
import { Page } from "./shared/ui/page";
import { LoadError } from "./shared/ui/load-error";
import { LoadingState } from "./shared/ui/loading-state";
import { StartupIntro } from "./shared/ui/startup-intro";
import { RouteTransition } from "./shared/ui/route-transition";

import "./App.css";

function App() {
  const [isIntroLeaving, setIsIntroLeaving] = React.useState(false);
  const handleIntroLeaving = React.useCallback(
    () => setIsIntroLeaving(true),
    [],
  );

  return (
    <>
      <StartupIntro onLeaving={handleIntroLeaving} />
      <BrowserRouter basename="/">
        <Redirects>
          <RouteTransition initialCovered={!isIntroLeaving}>
            <Routes>
              <Route path="/" element={<RegistrationPage />} />
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path="/participant" element={<ParticipantPage />} />
              <Route path="/curator" element={<CuratorPage />} />
              <Route path="/finisher" element={<FinishPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/blink" element={<BlinkPage />} />
              <Route path="/orgcom" element={<OrgcomPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </RouteTransition>
        </Redirects>
      </BrowserRouter>
    </>
  );
}

const Redirects = ({ children }: React.PropsWithChildren) => {
  const [shouldRender, setShouldRender] = React.useState(false);
  const [sessionError, setSessionError] = React.useState<string | null>(null);

  const { me, loading } = useUnit($userStore);

  const redirect = useNavigate();
  const location = useLocation();
  const isPublicRoute =
    location.pathname === "/" ||
    location.pathname === "/support" ||
    location.pathname === "/blink" ||
    location.pathname === "/orgcom";

  const loadSession = React.useCallback(() => {
    if (
      location.pathname === "/support" ||
      location.pathname === "/blink" ||
      location.pathname === "/orgcom"
    ) {
      clearMe();
      setSessionError(null);
      setShouldRender(true);
      return;
    }

    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      clearMe();
      setSessionError(null);
      if (!isPublicRoute) {
        redirect("/", { replace: true });
      }
      setShouldRender(true);
      return;
    }

    setSessionError(null);
    setShouldRender(false);

    getMe()
      .then(() => {
        setShouldRender(true);
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) {
          removeAuthToken();
          localStorage.removeItem("agreed");
          if (!isPublicRoute) {
            redirect("/", { replace: true });
          }
          setShouldRender(true);
          return;
        }

        setSessionError(
          getErrorMessage(error, "Не удалось проверить авторизацию"),
        );
        setShouldRender(true);
      });
  }, [isPublicRoute, location.pathname, redirect]);

  React.useEffect(() => {
    const unsubscribe = sessionExpired.watch(() => {
      removeAuthToken();
      localStorage.removeItem("agreed");
      clearMe();
      setSessionError(null);
      setShouldRender(true);
      if (!isPublicRoute) {
        redirect("/", { replace: true });
      }
    });

    return unsubscribe;
  }, [isPublicRoute, location.pathname, redirect]);

  React.useEffect(() => {
    loadSession();
  }, [loadSession]);

  React.useEffect(() => {
    if (loading || sessionError) {
      return;
    }

    setShouldRender(true);

    if (isPublicRoute) {
      setShouldRender(true);
      return;
    }

    if (!me) {
      redirect("/", { replace: true });
      return;
    }

    const isAdminOnly = me.is_superuser && !me.is_curator && !me.is_player;
    if (isAdminOnly) {
      const agreed = Boolean(localStorage.getItem("agreed"));
      if (agreed) {
        // The admin panel uses its own cookie session.  Once the intro has
        // been acknowledged, take a pure superuser directly to that panel
        // instead of trapping the account in the player/curator guards.
        window.location.replace(getAdminUrl());
      } else if (location.pathname !== "/welcome") {
        redirect("/welcome", { replace: true });
      }
      return;
    }

    const agreed = Boolean(localStorage.getItem("agreed"));
    if (!agreed && location.pathname !== "/welcome") {
      redirect("/welcome", { replace: true });
      return;
    }

    if (
      agreed &&
      (location.pathname === "/" || location.pathname === "/welcome")
    ) {
      redirect(me.is_curator ? "/curator" : "/participant", { replace: true });
      return;
    }

    // Keep role specific pages isolated while allowing both roles to see the
    // shared finisher screen after the quest expires.
    if (!me.is_curator && location.pathname === "/curator") {
      redirect("/participant", { replace: true });
    } else if (!me.is_player && location.pathname === "/participant") {
      redirect("/curator", { replace: true });
    }
  }, [isPublicRoute, loading, me, location.pathname, redirect, sessionError]);

  if (!shouldRender) {
    return (
      <Page>
        <LoadingState message="Проверяем авторизацию…" />
      </Page>
    );
  }

  if (sessionError) {
    return (
      <Page>
        <LoadError message={sessionError} onRetry={loadSession} />
      </Page>
    );
  }

  return <>{children}</>;
};

export default App;
