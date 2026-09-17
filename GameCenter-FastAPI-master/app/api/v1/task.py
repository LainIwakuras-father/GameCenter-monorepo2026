from fastapi import APIRouter, HTTPException, status

from app.schemas.task import Task, TaskCreate, TaskUpdate
from app.services.task import TaskService
from app.utils.dependencies import Superuser

router = APIRouter(prefix="/api/task", tags=["tasks"])
service = TaskService()


def serialize(task) -> dict:
    return {
        "id": task.id,
        "name": task.name,
        "question": task.question,
        "answer": task.answer,
    }


@router.get("", response_model=list[Task])
async def get_all_tasks(_: Superuser) -> list[dict]:
    return [serialize(task) for task in await service.get_all()]


@router.get("/{task_id}", response_model=Task)
async def get_task(task_id: int, _: Superuser) -> dict:
    task = await service.get_by_id(task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return serialize(task)


@router.post("", response_model=Task, status_code=status.HTTP_201_CREATED)
async def create_task(data: TaskCreate, _: Superuser) -> dict:
    return serialize(await service.create(data.model_dump()))


@router.put("/{task_id}", response_model=Task)
async def update_task(task_id: int, data: TaskUpdate, _: Superuser) -> dict:
    task = await service.update(task_id, data.model_dump(exclude_unset=True))
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return serialize(task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: int, _: Superuser) -> None:
    if not await service.delete(task_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
