import secrets
import string


async def generate_random_password(length: int = 16) -> str:
    """Generate a cryptographically random password for a seeded account."""
    if length < 12:
        raise ValueError("password length must be at least 12 characters")

    characters = string.ascii_letters + string.digits + string.punctuation
    return "".join(secrets.choice(characters) for _ in range(length))
