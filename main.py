from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import invoices, users
app = FastAPI()
app.include_router(users.router)
app.include_router(invoices.router)
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

@app.get("/")
async def root():
    return {"message": "Hello, World!"}

