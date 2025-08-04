from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
import models, schemas, database
from auth import get_current_user

router = APIRouter(prefix="/accounts", tags=["Accounts"])

@router.post("/", response_model=schemas.AccountRead)
def create_account(
    account: schemas.AccountCreate,
    session: Session = Depends(database.get_session),
    current_user: models.User = Depends(get_current_user),
):
    db_account = models.Account(
        **account.model_dump(),
        user_id=current_user.id
    )
    session.add(db_account)
    session.commit()
    session.refresh(db_account)
    return db_account

@router.get("/", response_model=list[schemas.AccountRead])
def get_accounts(
    session: Session = Depends(database.get_session),
    current_user: models.User = Depends(get_current_user),
):
    accounts = session.exec(
        select(models.Account).where(models.Account.user_id == current_user.id)
    ).all()
    return accounts

@router.delete("/{account_id}", response_model=dict)
def delete_account(
    account_id: int,
    session: Session = Depends(database.get_session),
    current_user: models.User = Depends(get_current_user),
):
    account = session.get(models.Account, account_id)
    if not account or account.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Account not found")
    session.delete(account)
    session.commit()
    return {"message": "Account deleted"}