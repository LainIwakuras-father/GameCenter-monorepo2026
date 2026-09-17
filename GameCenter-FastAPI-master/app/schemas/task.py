from app.schemas.base import BaseSchema


class TaskBase(BaseSchema):
    name: str | None = None
    question: str | None = None
    answer: str | None = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseSchema):
    name: str | None = None
    question: str | None = None
    answer: str | None = None


class Task(TaskBase):
    id: int
