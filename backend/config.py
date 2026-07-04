import os
from dotenv import load_dotenv

# Resolve absolute path to .env file inside backend directory
backend_env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
if os.path.exists(backend_env_path):
    load_dotenv(backend_env_path)
else:
    load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./eco_commit.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # For Vercel Serverless environment, SQLite must write to /tmp
    if os.getenv("VERCEL") == "1" and DATABASE_URL.startswith("sqlite"):
        DATABASE_URL = "sqlite:////tmp/eco_commit.db"

settings = Settings()