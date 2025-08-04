# app/models.py
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime, timezone

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str

    invoices: List["Invoice"] = Relationship(back_populates="owner")
    accounts: List["Account"] = Relationship(back_populates="user")


class Invoice(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    client_name: str
    client_email: str
    due_date: datetime
    status: str = "unpaid"
    total: float = 0.0
    created_at: datetime = Field(default_factory=datetime.now(timezone.utc))
    billing_address: str  
    extra_information: Optional[str] = None  

    owner_id: int = Field(foreign_key="user.id")
    owner: Optional[User] = Relationship(back_populates="invoices")
    items: List["InvoiceItem"] = Relationship(back_populates="invoice")

class InvoiceItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    quantity: int
    unit_price: float
    subtotal: float = 0.0

    invoice_id: int = Field(foreign_key="invoice.id")
    invoice: Optional[Invoice] = Relationship(back_populates="items")
class Profile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    firstname: str
    lastname: str
    business_name: Optional[str] = None
    address: Optional[str] = None
    profile_picture: Optional[str] = None  

    user_id: int = Field(foreign_key="user.id")
    user: Optional[User] = Relationship()
class Account(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    account_name: str
    account_number: str
    bank_name: str
    paypal_ID: Optional[str]  = None
    user_id: int = Field(foreign_key="user.id")
    user: Optional[User] = Relationship(back_populates="accounts")
