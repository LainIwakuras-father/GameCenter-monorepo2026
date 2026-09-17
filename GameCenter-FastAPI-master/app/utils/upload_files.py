import base64
import binascii
import uuid
from pathlib import Path

import aiofiles

from app.config.config import STATIC_DIR


async def convert_base64_to_file(value: str) -> tuple[bytes, str]:
    """Decode a data URL and return bytes plus a safe image extension."""

    if not isinstance(value, str) or not value.strip():
        raise ValueError("Пустой файл")

    header, separator, encoded = value.partition(",")
    if not separator:
        header, encoded = "data:application/octet-stream;base64", value

    mime = header.lower().split(";", 1)[0].removeprefix("data:")
    extensions = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/gif": "gif",
        "image/webp": "webp",
    }
    file_format = extensions.get(mime)
    if file_format is None:
        raise ValueError(
            "Поддерживаются только изображения jpg, png, gif и webp"
        )

    try:
        return base64.b64decode(encoded, validate=True), file_format
    except (binascii.Error, ValueError) as exc:
        raise ValueError("Некорректные данные base64") from exc


async def save_upload_media(file: bytes, file_format: str) -> Path:
    if file_format not in {"jpg", "png", "gif", "webp"}:
        raise ValueError("Недопустимый формат файла")
    relative_path = Path("image") / f"{uuid.uuid4()}.{file_format}"
    full_path = STATIC_DIR / relative_path
    full_path.parent.mkdir(parents=True, exist_ok=True)
    async with aiofiles.open(full_path, mode="wb") as buffer:
        await buffer.write(file)
    return relative_path


async def delete_image(file_path: str) -> None:
    if not file_path:
        return
    relative = Path(file_path)
    full_path = (STATIC_DIR / relative).resolve()
    static_root = STATIC_DIR.resolve()
    if static_root not in full_path.parents:
        raise ValueError("Недопустимый путь к файлу")
    if full_path.exists():
        full_path.unlink()
