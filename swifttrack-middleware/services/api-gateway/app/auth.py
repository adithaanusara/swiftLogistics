import os, time
from jose import jwt, JWTError
from passlib.context import CryptContext

JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret")
JWT_ALG = "HS256"
JWT_EXPIRE_SEC = 60 * 60 * 6  # 6 hours

# ✅ Use PBKDF2 (no bcrypt dependency problems in Docker)
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def hash_pw(pw: str) -> str:
    return pwd_context.hash(pw)

def verify_pw(pw: str, hashed: str) -> bool:
    return pwd_context.verify(pw, hashed)

def create_token(user_id: int, role: str, username: str) -> str:
    now = int(time.time())
    payload = {"sub": str(user_id), "role": role, "username": username, "iat": now, "exp": now + JWT_EXPIRE_SEC}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except JWTError:
        return {}