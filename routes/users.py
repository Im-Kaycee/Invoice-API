# app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
import schemas, models, auth, database
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

router = APIRouter(prefix="/users", tags=["Users"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")

# --- Register ---
@router.post("/register", response_model=schemas.UserRead)
def register(user: schemas.UserCreate, session: Session = Depends(database.get_session)):
    existing_user = session.exec(select(models.User).where(models.User.username == user.username)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed = auth.hash_password(user.password)
    db_user = models.User(username=user.username, email=user.email, hashed_password=hashed)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

# --- Login ---
@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(database.get_session)):
    user = session.exec(select(models.User).where(models.User.username == form_data.username)).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = auth.create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}

# --- Get Current User ---
@router.get("/me", response_model=schemas.UserRead)
def get_me(token: str = Depends(oauth2_scheme), session: Session = Depends(database.get_session)):
    payload = auth.decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid token")

    username = payload.get("sub")
    user = session.exec(select(models.User).where(models.User.username == username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user
