from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from database import SessionLocal, PromptLog
from pii_scanner import scan_text

app = FastAPI(title="AI Agent Toolbar Backend - Phase 1")

# Configuracion CORS (Permite requests desde cualquier extension en el navegador)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permitir todos los origenes inicialmente
    allow_credentials=False,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["*"],
)

# Pydantic Schemas
class LogCreate(BaseModel):
    provider: str
    model: str
    raw_prompt: str
    timestamp: Optional[datetime] = None
    has_pii: Optional[bool] = False
    pii_types: Optional[str] = None
    has_attachments: Optional[bool] = False

class LogResponse(BaseModel):
    id: int
    provider: str
    model: str
    raw_prompt: str
    timestamp: datetime
    has_pii: bool
    pii_types: Optional[str] = None
    has_attachments: bool
    
    class Config:
        from_attributes = True

# Dependencia para obtener la DB local
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/log", response_model=LogResponse, status_code=201)
def create_log(log_in: LogCreate, db: Session = Depends(get_db)):
    # Scan logic
    final_has_pii = log_in.has_pii
    final_pii_types = log_in.pii_types
    
    if log_in.raw_prompt:
        scan_results = scan_text(log_in.raw_prompt)
        if scan_results["has_pii"]:
            final_has_pii = True
            if final_pii_types:
                existing_types = set(final_pii_types.split(","))
                new_types = set(scan_results["pii_types"].split(","))
                final_pii_types = ",".join(existing_types.union(new_types))
            else:
                final_pii_types = scan_results["pii_types"]

    # Crear la instancia del modelo SQLAlchemy
    db_log = PromptLog(
        provider=log_in.provider,
        model=log_in.model,
        raw_prompt=log_in.raw_prompt,
        timestamp=log_in.timestamp, # Si es None, SQLAlchemy asignará la fecha actual
        has_pii=final_has_pii,
        pii_types=final_pii_types,
        has_attachments=log_in.has_attachments
    )
    db.add(db_log)
    try:
        db.commit()
        db.refresh(db_log)
        return db_log
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
