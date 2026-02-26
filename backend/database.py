import os
from datetime import datetime, timezone
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker

# Directorio de la base de datos
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "sqlite.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class PromptLog(Base):
    __tablename__ = "prompt_logs"

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String, index=True)
    model = Column(String, index=True)
    raw_prompt = Column(String)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    has_pii = Column(Boolean, default=False)
    pii_types = Column(String, nullable=True)
    has_attachments = Column(Boolean, default=False)

# Crea las tablas
Base.metadata.create_all(bind=engine)
