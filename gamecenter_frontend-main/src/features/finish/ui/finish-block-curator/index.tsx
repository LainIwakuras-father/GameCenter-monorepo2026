import { BriefArticle } from "../../../../shared/ui/brief-article";

import { b } from "../finish-page";

export const FinishBlockCurator = () => {
  return (
    <>
      <div className={b("titles")}>
        <span className={b("title")}>квест завершён!</span>
        <span className={b("subtitle")}>спасибо за помощь!</span>
      </div>

      <BriefArticle
        title="Что дальше?"
        markdown="Отправляйтесь на Мойку, 61, там будет официальное закрытие квеста"
        color="gray"
      />

      <div style={{ marginTop: 12 }}>
        <BriefArticle
          title="Я молодец?"
          markdown="Конечно! Без кураторов квест бы не состоялся, поэтому мы благодарим всех, кто принял участие в организации и обещаем вам ещё больше крутых мероприятий в этом году"
          color="gray"
        />
      </div>
    </>
  );
};
