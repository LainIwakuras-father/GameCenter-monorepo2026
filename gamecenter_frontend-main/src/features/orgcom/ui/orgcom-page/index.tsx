import { useNavigate } from "react-router";

import orgcomMark from "../../../../shared/assets/brand/orgcom-red-mark.png";
import { bem } from "../../../../shared/lib";
import { Button } from "../../../../shared/ui/button";
import { Page } from "../../../../shared/ui/page";

import "./index.scss";

const b = bem("orgcom-page");

const ORGCOM_URL = "https://vk.ru/orgcomsut";

const activities = [
  {
    title: "командные квесты",
    description:
      "Спортивно-развлекательный «ИграЦентр» и интеллектуальный квест «11».",
  },
  {
    title: "игры и квизы",
    description: "«Игротека» и детективный квиз «Дело №2261».",
  },
  {
    title: "студенческие праздники",
    description:
      "«День всех влюблённых», «Масленица» и другие культурные события.",
  },
];

export const OrgcomPage = () => {
  const navigate = useNavigate();

  return (
    <Page>
      <main className={b()}>
        <header className={b("heading")}>
          <div className={b("heading-copy")}>
            <span className={b("eyebrow")}>организационный комитет СПбГУТ</span>
            <h1 className={b("title")}>ORG.COM</h1>
          </div>
          <span className={b("heading-mark")}>
            <img src={orgcomMark} alt="Логотип ORG.COM" />
          </span>
        </header>

        <section
          className={b("card")}
          aria-labelledby="orgcom-activities-title"
        >
          <p className={b("lead")}>
            Команда Студенческого совета СПбГУТ, которая организует досуг
            студентов: квесты, игры, квизы и университетские праздники.
          </p>

          <h2 className={b("section-title")} id="orgcom-activities-title">
            что делаем
          </h2>
          <ul className={b("activity-list")}>
            {activities.map((activity) => (
              <li className={b("activity")} key={activity.title}>
                <h3 className={b("activity-title")}>{activity.title}</h3>
                <p className={b("activity-description")}>
                  {activity.description}
                </p>
              </li>
            ))}
          </ul>

          <a
            className={b("cta")}
            href={ORGCOM_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>сообщество ВКонтакте</span>
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
