from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import invoices, users, profiles, accounts
app = FastAPI()
app.include_router(users.router)
app.include_router(invoices.router)
app.include_router(profiles.router)
app.include_router(accounts.router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
from fastapi.templating import Jinja2Templates
from fastapi import Request

templates = Jinja2Templates(directory="templates")
from fastapi.staticfiles import StaticFiles

app.mount("/static", StaticFiles(directory="static"), name="static")
@app.get("/")
async def root():
    return {"message": "Hello, World!"}
'''
# Database Initialization
from database import engine
import models

def create_db():
    models.SQLModel.metadata.create_all(engine)

create_db()
'''