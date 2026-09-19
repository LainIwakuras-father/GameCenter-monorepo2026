import secrets
import string

SAFE_SYMBOLS = "-_.!?"

async def generate_random_password(length: int = 8) -> str:
    """Generate a cryptographically random password for a seeded account."""
    if length < 8:
        raise ValueError("password length must be at least 18 characters")

    characters = string.ascii_letters + string.digits + SAFE_SYMBOLS
    return "".join(secrets.choice(characters) for _ in range(length))
