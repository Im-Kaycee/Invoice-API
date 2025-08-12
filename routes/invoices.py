# app/routers/invoices.py
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from datetime import datetime,timezone
import models, schemas, database
from auth import get_current_user
from fastapi.responses import StreamingResponse
from fastapi.templating import Jinja2Templates
from weasyprint import HTML
from io import BytesIO
from fastapi import Request

router = APIRouter(prefix="/invoices", tags=["Invoices"])
templates = Jinja2Templates(directory="templates")

@router.post("/", response_model=schemas.InvoiceRead)
def create_invoice(
    invoice: schemas.InvoiceCreate,
    session: Session = Depends(database.get_session),
    current_user: models.User = Depends(get_current_user),
):
    # Create invoice
    new_invoice = models.Invoice(
        client_name=invoice.client_name,
        client_email=invoice.client_email,
        due_date=invoice.due_date,
        status="unpaid",
        owner_id=current_user.id,
        created_at=datetime.now(timezone.utc),
        billing_address=invoice.billing_address,  
        extra_information=invoice.extra_information 
    )

    session.add(new_invoice)
    session.commit()
    session.refresh(new_invoice)

    total = 0.0
    for item in invoice.items:
        subtotal = item.quantity * item.unit_price
        total += subtotal
        invoice_item = models.InvoiceItem(
            title=item.title,
            quantity=item.quantity,
            unit_price=item.unit_price,
            subtotal=subtotal,
            invoice_id=new_invoice.id
        )
        session.add(invoice_item)

    new_invoice.total = total
    session.commit()
    session.refresh(new_invoice)

    return new_invoice


@router.get("/", response_model=List[schemas.InvoiceRead])
def get_user_invoices(
    session: Session = Depends(database.get_session),
    current_user: models.User = Depends(get_current_user),
):
    invoices = session.exec(
        select(models.Invoice).where(models.Invoice.owner_id == current_user.id)
    ).all()
    return invoices


@router.get("/{invoice_id}", response_model=schemas.InvoiceRead)
def get_invoice(
    invoice_id: int,
    session: Session = Depends(database.get_session),
    current_user: models.User = Depends(get_current_user),
):
    invoice = session.get(models.Invoice, invoice_id)
    if not invoice or invoice.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Invoice not found")

    return invoice


@router.delete("/{invoice_id}")
def delete_invoice(
    invoice_id: int,
    session: Session = Depends(database.get_session),
    current_user: models.User = Depends(get_current_user),
):
    invoice = session.get(models.Invoice, invoice_id)
    if not invoice or invoice.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Invoice not found")

    session.delete(invoice)
    session.commit()
    return {"message": "Invoice deleted"}

@router.get("/{invoice_id}/download")
def download_invoice(
    invoice_id: int,
    session: Session = Depends(database.get_session),
    current_user: models.User = Depends(get_current_user),
    request: Request = None
):
    # Get the invoice
    invoice = session.get(models.Invoice, invoice_id)
    if not invoice or invoice.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Invoice not found")

    # Get invoice items
    items = session.exec(
        select(models.InvoiceItem).where(models.InvoiceItem.invoice_id == invoice.id)
    ).all()

    # Get user profile - explicit query to avoid relationship issues
    user_profile = session.exec(
        select(models.Profile).where(models.Profile.user_id == current_user.id)
    ).first()

    # Get user account (optional)
    user_account = session.exec(
        select(models.Account).where(models.Account.user_id == current_user.id)
    ).first()

    # Prepare invoice data
    invoice_data = {
        "id": invoice.id,
        "client_name": invoice.client_name,
        "client_email": invoice.client_email,
        "due_date": invoice.due_date,
        "status": invoice.status,
        "billing_address": invoice.billing_address,
        "extra_information": invoice.extra_information,
        "created_at": invoice.created_at,
        "total": float(invoice.total),  # Ensure it's a float
        "items": [
            {
                "title": item.title,
                "quantity": int(item.quantity),  # Ensure it's an int
                "unit_price": float(item.unit_price),  # Ensure it's a float
                "subtotal": float(item.subtotal)  # Ensure it's a float
            }
            for item in items
        ]
    }
    
    # Prepare profile data with safe defaults
    profile = {
        "firstname": user_profile.firstname if user_profile else "User",
        "lastname": user_profile.lastname if user_profile else "",
        "business_name": user_profile.business_name if user_profile else None,
        "address": user_profile.address if user_profile else None,
        "profile_picture": user_profile.profile_picture if user_profile else None
    }

    # Prepare account data (optional)
    account = None
    if user_account:
        account = {
            "account_name": user_account.account_name,
            "account_number": user_account.account_number,
            "bank_name": user_account.bank_name,
            "paypal_ID": user_account.paypal_ID
        }

    try:
        # Debug: Print the data to see what's being passed
        print(f"Invoice data: {invoice_data}")
        print(f"Profile data: {profile}")
        print(f"Items count: {len(invoice_data['items'])}")
        
        # Render the HTML template
        html_content = templates.get_template("invoice.html").render({
            "request": request,
            "invoice": invoice_data,
            "profile": profile,
            "account": account,
        })

        # Generate PDF
        pdf_file = BytesIO()
        HTML(string=html_content).write_pdf(pdf_file)
        pdf_file.seek(0)

        return StreamingResponse(
            pdf_file,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=invoice_{invoice.id}.pdf"}
        )
        
    except Exception as e:
        print(f"Error generating PDF: {str(e)}")  # For debugging
        raise HTTPException(status_code=500, detail=f"Error generating PDF: {str(e)}")
@router.patch("/{invoice_id}/status")
def update_invoice_status(
    invoice_id: int,
    status: str,
    session: Session = Depends(database.get_session),
    current_user: models.User = Depends(get_current_user),
):
    invoice = session.get(models.Invoice, invoice_id)
    if not invoice or invoice.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Invoice not found")
    invoice.status = status
    session.commit()
    session.refresh(invoice)
    return invoice