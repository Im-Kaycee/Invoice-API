from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session, select
import models, schemas, database
from auth import get_current_user
import shutil
import os

router = APIRouter(prefix="/profiles", tags=["Profiles"])

UPLOAD_DIR = "static/profile_pics"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=schemas.ProfileRead)
def create_profile(
    profile: schemas.ProfileCreate,
    session: Session = Depends(database.get_session),
    current_user: models.User = Depends(get_current_user),
):
    db_profile = models.Profile(
        **profile.model_dump(),
        user_id=current_user.id
    )
    session.add(db_profile)
    session.commit()
    session.refresh(db_profile)
    return db_profile

@router.put("/picture", response_model=schemas.ProfileRead)
def upload_profile_picture(
    file: UploadFile = File(...),
    session: Session = Depends(database.get_session),
    current_user: models.User = Depends(get_current_user),
):
    profile = session.exec(
        select(models.Profile).where(models.Profile.user_id == current_user.id)
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    filename = f"{current_user.id}_{file.filename}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    profile.profile_picture = filename
    session.commit()
    session.refresh(profile)
    return profile

@router.patch("/", response_model=schemas.ProfileRead)
def update_profile(
    profile_update: schemas.ProfileUpdate,
    session: Session = Depends(database.get_session),
    current_user: models.User = Depends(get_current_user),
):
    profile = session.exec(
        select(models.Profile).where(models.Profile.user_id == current_user.id)
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    for key, value in profile_update.dict(exclude_unset=True).items():
        setattr(profile, key, value)
    session.commit()
    session.refresh(profile)
    return profile

@router.delete("/", response_model=dict)
def delete_profile(
    session: Session = Depends(database.get_session),
    current_user: models.User = Depends(get_current_user),
):
    profile = session.exec(
        select(models.Profile).where(models.Profile.user_id == current_user.id)
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    session.delete(profile)
    session.commit()
    return {"message": "Profile deleted"}
@router.get("/", response_model=schemas.ProfileRead)
def get_profile(
    session: Session = Depends(database.get_session),
    current_user: models.User = Depends(get_current_user),
):
    profile = session.exec(
        select(models.Profile).where(models.Profile.user_id == current_user.id)
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile