# 🧾 Freelancer Invoice API

A lightweight, secure API built with **FastAPI** that allows freelancers to manage and generate invoices for their clients.

---

## 📌 Project Purpose

Freelancers often juggle multiple projects and clients, making manual invoice generation error-prone and time-consuming. This API provides a simple backend to:

- Authenticate securely
- Create detailed invoices
- Associate multiple items to an invoice
- Download invoices
- Easily integrate with a future frontend or PDF generation service

---

## 🚀 Tech Stack

- **FastAPI**: Modern, fast Python web framework
- **Pydantic**: Data validation and serialization
- **JWT**: Secure authentication using access tokens
- **SQLite / SQLAlchemy**: Lightweight, relational database setup

---

## 🔐 Features & Design Decisions

### 1. **User Registration & Login**
- 🔐 Users must register and log in to use the system.
- 🛡 Authentication is handled with JWT tokens to secure endpoints.
- 🎯 Decision: Keeps user-specific invoices private and secure.

### 2. **Invoice Management**
- 🧾 Each invoice is tied to a specific authenticated user.
- 📦 Invoices contain:
  - Client name/email
  - Due date
  - Status (`unpaid`, `paid`)
  - Multiple invoice items with quantity, unit price, subtotal
- 🎯 Decision: This structure mirrors a real-world invoice layout and supports total calculation.

### 3. **Ownership Enforcement**
- 🔐 All endpoints are protected and user-specific.
- 🎯 Decision: A user can only view or delete their own invoices, ensuring data isolation.

### 4. **Expandable Architecture**
- ✅ Clean structure with separate routers and models.
- 📄 A PDF download endpoint using `WeasyPrint`.

---

## 📚 Endpoints Reference

All routes are prefixed with `/` and require authentication except registration/login.

### 🔐 Auth Routes (Public)
| Method | Endpoint           | Description                    |
|--------|--------------------|--------------------------------|
| POST   | `/users/register`  | Register a new user            |
| POST   | `/users/login`     | Log in and receive JWT token   |

### 📦 Invoice Routes (Protected)
> 🔑 Requires `Authorization: Bearer <token>` in header.

| Method | Endpoint               | Description                                  |
|--------|------------------------|----------------------------------------------|
| POST   | `/invoices/`           | Create a new invoice with items              |
| GET    | `/invoices/`           | List all invoices belonging to the user      |
| GET    | `/invoices/{id}`       | View a specific invoice by ID (user-owned)   |
| DELETE | `/invoices/{id}`       | Delete an invoice by ID (user-owned)         |


| Method | Endpoint                     | Description                      |
|--------|------------------------------|----------------------------------|
| GET    | `/invoices/{id}/download`    | Download invoice as PDF         |

---

## ⚙️ How to Run

1. Install requirements:
   ```bash
   pip install -r requirements.txt
2. Start Server:
   ```bash
   uvicorn app:main --reload
