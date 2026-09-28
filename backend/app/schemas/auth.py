from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
    full_name: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "PATIENT"  # PATIENT, DOCTOR, ADMIN
    # Optional doctor fields
    license_number: Optional[str] = None
    hospital_affiliation: Optional[str] = None
    specialty: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    patient_profile_id: Optional[str] = None
    doctor_profile_id: Optional[str] = None

    class Config:
        from_attributes = True
