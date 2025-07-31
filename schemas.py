# app/schemas.py
from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserRead(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

# --- Invoice Item ---
class InvoiceItemCreate(BaseModel):
    title: str
    quantity: int
    unit_price: float

class InvoiceItemRead(InvoiceItemCreate):
    id: int
    subtotal: float

    class Config:
        orm_mode = True

# --- Invoice ---
class InvoiceCreate(BaseModel):
    client_name: str
    client_email: str
    due_date: datetime
    items: List[InvoiceItemCreate]

class InvoiceRead(BaseModel):
    id: int
    client_name: str
    client_email: str
    due_date: datetime
    status: str
    total: float
    created_at: datetime
    items: List[InvoiceItemRead]

    class Config:
        orm_mode = True
