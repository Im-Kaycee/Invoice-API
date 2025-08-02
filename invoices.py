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
    invoice = session.get(models.Invoice, invoice_id)
    if not invoice or invoice.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Invoice not found")

    # If invoice.items is not a relationship, you may need to query them:
    items = session.exec(
        select(models.InvoiceItem).where(models.InvoiceItem.invoice_id == invoice.id)
    ).all()

    invoice_data = {
        "id": invoice.id,
        "client_name": invoice.client_name,
        "client_email": invoice.client_email,
        "due_date": invoice.due_date,
        "status": invoice.status,
        "billing_address": invoice.billing_address,
        "extra_information": invoice.extra_information,
        "created_at": invoice.created_at,
        "total": sum([item.quantity * item.unit_price for item in items]),
        "items": [
            {
                "title": item.title,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "subtotal": item.quantity * item.unit_price
            }
            for item in items
        ]
    }

    html_content = templates.get_template("invoice.html").render({
        "request": request,
        "invoice": invoice_data
    })

    pdf_file = BytesIO()
    HTML(string=html_content).write_pdf(pdf_file)
    pdf_file.seek(0)

    return StreamingResponse(
        pdf_file,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=invoice_{invoice.id}.pdf"}
    )
    
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