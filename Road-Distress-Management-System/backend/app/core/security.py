"""
Security operations module for the Road Distress Management System.
Placeholder for cryptography, password hashing, and token mechanisms.
"""


import hashlib
import os


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain text password against its secure hash using PBKDF2-HMAC-SHA256.
    """
    try:
        if "$" not in hashed_password:
            # Fallback for plain text or legacy passwords if any
            return plain_password == hashed_password
        salt_hex, hash_hex = hashed_password.split("$", 1)
        salt = bytes.fromhex(salt_hex)
        computed_hash = hashlib.pbkdf2_hmac(
            "sha256",
            plain_password.encode("utf-8"),
            salt,
            100000
        )
        return computed_hash.hex() == hash_hex
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """
    Generate a secure password hash using PBKDF2-HMAC-SHA256 with a unique random salt.
    Format: salt_hex$hash_hex
    """
    salt = os.urandom(16)
    computed_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        100000
    )
    return f"{salt.hex()}${computed_hash.hex()}"
