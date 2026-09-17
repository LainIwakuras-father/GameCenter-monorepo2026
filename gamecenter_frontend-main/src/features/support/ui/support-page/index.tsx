import { useNavigate } from "react-router";

import { bem } from "../../../../shared/lib";
import { Button } from "../../../../shared/ui/button";
import { Page } from "../../../../shared/ui/page";

import avatar from "./z1ngger19.png";

import "./index.scss";

const b = bem("support-page");

const TELEGRAM_URL = "https://t.me/z1ngger19";
const VK_URL = "https://vk.com/z1ngger19";

export const SupportPage = () => {
  const navigate = useNavigate();

  return (
    <Page>
      <main className={b()}>
        <header className={b("heading")}>
          <div>
            <span className={b("eyebrow")}>экстренная связь</span>
            <h1 className={b("title")}>SOS</h1>
          </div>
          <span className={b("heading-mark")} aria-hidden="true">
            ИЦ
          </span>
        </header>

        <section className={b("card")} aria-labelledby="support-title">
          <div className={b("profile")}>
            <img
              className={b("avatar")}
              src={avatar}
              alt="Аватар Ромы Плескачева"
            />
            <div className={b("profile-copy")}>
              <span className={b("profile-label")}>организатор</span>
              <h2 className={b("name")} id="support-title">
                Рома Плескачев
              </h2>
              <p className={b("description")}>
                Если нужна помощь на маршруте, напиши в удобный мессенджер.
              </p>
            </div>
          </div>

          <div className={b("links")}>
            <a
              className={b("link")}
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={b("link-service")}>Telegram</span>
              <span className={b("link-handle")}>@z1ngger19</span>
              <span className={b("link-arrow")} aria-hidden="true">
                ↗
              </span>
            </a>
            <a
              className={b("link")}
              href={VK_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={b("link-service")}>ВКонтакте</span>
              <span className={b("link-handle")}>@z1ngger19</span>
              <span className={b("link-arrow")} aria-hidden="true">
                ↗
              </span>
            </a>
          </div>
        </section>

        <Button type="button" view="secondary" onClick={() => navigate("/")}>
          назад
        </Button>
      </main>
    </Page>
  );
};
