import { useNavigate } from "react-router";

import blinkMark from "../../../../shared/assets/brand/blink-official-mark.png";
import { bem } from "../../../../shared/lib";
import { Button } from "../../../../shared/ui/button";
import { Page } from "../../../../shared/ui/page";

import "./index.scss";

const b = bem("blink-page");

const BLINK_URL = "https://blinkmap.com/ru";

const features = [
  {
    title: "друзья на карте",
    description: "Смотри, кто из друзей сейчас рядом и где можно встретиться.",
  },
  {
    title: "чаты и звонки",
    description: "Общайся лично или в группе прямо внутри приложения.",
  },
  {
    title: "чекины и поездки",
    description: "Делись любимыми местами и узнавай о поездках друзей.",
  },
];

export const BlinkPage = () => {
  const navigate = useNavigate();

  return (
    <Page>
      <main className={b()}>
        <header className={b("heading")}>
          <div className={b("heading-copy")}>
            <span className={b("eyebrow")}>приложение для друзей</span>
            <h1 className={b("title")}>Blink</h1>
          </div>
          <span className={b("heading-mark")}>
            <img src={blinkMark} alt="Логотип Blink" />
          </span>
        </header>

        <section className={b("card")} aria-labelledby="blink-features-title">
          <p className={b("lead")}>
            Карта, чаты, звонки и чекины — всё для общения в одном приложении.
          </p>

          <h2 className={b("section-title")} id="blink-features-title">
            что внутри
          </h2>
          <ul className={b("feature-list")}>
            {features.map((feature) => (
              <li className={b("feature")} key={feature.title}>
                <h3 className={b("feature-title")}>{feature.title}</h3>
                <p className={b("feature-description")}>
                  {feature.description}
                </p>
              </li>
            ))}
          </ul>

          <a
            className={b("cta")}
            href={BLINK_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>официальный сайт</span>
            <span className={b("cta-arrow")} aria-hidden="true">
              ↗
            </span>
            <span className={b("visually-hidden")}>
              (откроется в новой вкладке)
            </span>
          </a>
        </section>

        <Button type="button" view="secondary" onClick={() => navigate("/")}>
          назад
        </Button>
      </main>
    </Page>
  );
};
