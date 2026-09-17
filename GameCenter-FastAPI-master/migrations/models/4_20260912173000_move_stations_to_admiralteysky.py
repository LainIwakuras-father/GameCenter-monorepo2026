from tortoise import BaseDBAsyncClient


BLUE_BRIDGE_DESCRIPTION = (
    "Синий мост перекинут через Мойку и соединяет части Исаакиевской площади. "
    "Современный чугунный мост построили в 1818 году, а в 1842–1843 годах "
    "расширили. Благодаря необычной ширине мост воспринимается как "
    "продолжение площади. Название связано с традицией XVIII века "
    "окрашивать городские мосты через Мойку в разные цвета."
)

LIONS_DESCENT_DESCRIPTION = (
    "Дворцовый спуск со львами расположен на Адмиралтейской набережной. "
    "Пристань у восточного павильона Адмиралтейства оформили в 1832 году "
    "по проекту архитектора Луи Шарлеманя. Её гранитную лестницу охраняют "
    "два беломраморных льва, ставшие одним из узнаваемых символов "
    "набережной Невы."
)

MANEGE_DESCRIPTION = (
    "Конногвардейский манеж находится рядом с Исаакиевской площадью. "
    "Здание возвели в 1804–1807 годах по проекту Джакомо Кваренги для "
    "зимних тренировок лейб-гвардии Конного полка. Главный фасад выполнен "
    "в стиле классицизма и украшен портиком с восемью колоннами. Сегодня "
    "здесь работает Центральный выставочный зал «Манеж»."
)


def _sql_literal(value: str) -> str:
    """Quote a static text value for the migration SQL."""

    return "'" + value.replace("'", "''") + "'"


async def upgrade(db: BaseDBAsyncClient) -> str:
    """Move the three existing station records without changing their IDs."""

    return f"""
        UPDATE "stations"
        SET
            "name" = 'Синий мост',
            "description" = {_sql_literal(BLUE_BRIDGE_DESCRIPTION)},
            "image" = 'static/image/SINIY_MOST.jpg'
        WHERE "name" IN ('Спас на Крови', 'Синий мост');

        UPDATE "stations"
        SET
            "name" = 'Спуск со Львами',
            "description" = {_sql_literal(LIONS_DESCENT_DESCRIPTION)},
            "image" = 'static/image/SPUSK_SO_LVAMI.jpg'
        WHERE "name" IN ('пл.Искусств', 'Площадь Искусств', 'Спуск со Львами');

        UPDATE "stations"
        SET
            "name" = 'Манеж',
            "description" = {_sql_literal(MANEGE_DESCRIPTION)},
            "image" = 'static/image/MANEZH.jpg'
        WHERE "name" IN ('Екатерининский сквер', 'Манеж');
    """


async def downgrade(db: BaseDBAsyncClient) -> str:
    # The former locations and their descriptions are event data, not a
    # reversible schema change.  Keep the migration safe to downgrade.
    return """
        """
