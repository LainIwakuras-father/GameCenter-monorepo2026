import { useUnit } from "effector-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";

import { $userStore } from "../../../../entities/user";
import onIc from "../../../../shared/assets/brand/on-ic.svg";
import { bem, getAdminUrl, useSafari } from "../../../../shared/lib";
import { Page } from "../../../../shared/ui/page";
import { Button } from "../../../../shared/ui/button";
import { BriefArticle } from "../../../../shared/ui/brief-article";

import "./index.scss";

const b = bem("welcome-page");

const participantMarkdown =
  "Ежегодно вузы Санкт-Петербурга открывают свои двери для новых ребят из разных уголков нашей огромной страны, именно для первокурсников Организационный комитет СПБГУТ проводит свое самое масштабное мероприятие - спортивно-развлекательный квест «ИграЦентр».\n\nЦель квеста - познакомить новоиспеченных студентов с городом, его историей и культурным наследием, а также подарить заряд энергии и неповторимые эмоции!\n\nЗадача каждой команды полностью завершить квест, успешно выполнив задания на станциях. Чем быстрее команда справляется с каждым заданием, тем больше вероятность победы в квесте. ";
const curatorMarkdown =
  "Ежегодно вузы Санкт-Петербурга открывают свои двери для новых ребят из разных уголков нашей огромной страны, именно для первокурсников Организационный комитет СПБГУТ проводит свое самое масштабное мероприятие - спортивно-развлекательный квест «ИграЦентр».\n\nЦель квеста - познакомить новоиспеченных студентов с городом, его историей и культурным наследием, а также подарить заряд энергии и неповторимые эмоции!\n\nВы - куратор. Ваша задача принять на станции все команды и главное - вовремя. Следите за правильным выполнением заданий команды и хорошо повеселитесь вместе с участниками!";

export const WelcomePage = () => {
  const { me } = useUnit($userStore);
  const redirect = useNavigate();

  useEffect(() => {
    if (!me) {
      redirect("/", { replace: true });
    }
  }, [me, redirect]);

  const handleAgreement = () => {
    localStorage.setItem("agreed", "true");

    if (!me) {
      redirect("/", { replace: true });
      return;
    }

    if (me.is_superuser && !me.is_player && !me.is_curator) {
      window.location.assign(getAdminUrl());
      return;
    }

    if (me.is_player) {
      redirect("/participant");
    } else if (me.is_curator) {
      redirect("/curator");
    }
  };

  const safari = useSafari();

  return (
    <Page>
      <div className={b(null, { safari })}>
        <div className={b("heading")}>
          <div>
            <span className={b("eyebrow")}>перед стартом</span>
            <h2 className={b("title")}>добро пожаловать!</h2>
          </div>
          <img className={b("badge")} src={onIc} alt="" />
        </div>
        <span className={b("subtitle")}>
          Прежде чем начать, прочти небольшую справку о&nbsp;предстоящем квесте.
          Мы понимаем, что читать сейчас не&nbsp;очень хочется, но тут
          содержится важная информация о&nbsp;квесте, так&nbsp;что лучше этим
          не&nbsp;пренебрегать
        </span>

        <div className={b("scroll-block")}>
          <BriefArticle
            title="Что такое Играцентр?"
            color="gray"
            markdown={me?.is_player ? participantMarkdown : curatorMarkdown}
          />
        </div>

        <Button onClick={handleAgreement}>готово</Button>
      </div>
    </Page>
  );
};
