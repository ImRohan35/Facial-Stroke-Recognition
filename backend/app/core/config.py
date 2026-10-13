import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "StrokeCare AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "strokecare_ai_production_secret_key_change_in_production_2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database URL: default to local SQLite with full PostgreSQL compatibility via SQLAlchemy
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./strokecare.db")
    
    # Uploads & Assets
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    UPLOAD_DIR: str = os.path.join(BASE_DIR, "uploads")
    SAVED_MODELS_DIR: str = os.path.join(BASE_DIR, "ml_pipeline", "saved_models")
    
    # Resource and Upload Limits
    MAX_IMAGE_SIZE_MB: int = int(os.getenv("MAX_IMAGE_SIZE_MB", "15"))
    MAX_VIDEO_SIZE_MB: int = int(os.getenv("MAX_VIDEO_SIZE_MB", "100"))
    PROCESSING_TIMEOUT_SECONDS: int = int(os.getenv("PROCESSING_TIMEOUT_SECONDS", "45"))
    ALLOWED_IMAGE_EXTENSIONS: list[str] = [".jpg", ".jpeg", ".png", ".webp"]
    ALLOWED_VIDEO_EXTENSIONS: list[str] = [".mp4", ".webm", ".mov", ".avi", ".mkv"]

    # Security
    ALLOWED_HOSTS: list[str] = ["*"]

settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.SAVED_MODELS_DIR, exist_ok=True)

