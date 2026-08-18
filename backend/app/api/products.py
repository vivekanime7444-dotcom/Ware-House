from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Product, Category, User, AuditLog
from app.schemas import ProductOut, ProductCreate, ProductUpdate, CategoryOut
from app.auth import get_current_user, require_roles
from datetime import datetime, timezone




router = APIRouter(prefix="/api/products", tags=["Products"])

def format_product_out(p: Product) -> ProductOut:
    return ProductOut(
        id=p.id,
        product_code=p.product_code,
        name=p.name,
        description=p.description,
        category_id=p.category_id,
        category_name=p.category.name if p.category else "Unassigned",
        image_url=p.image_url,
        quantity=p.quantity,
        reserved_quantity=p.reserved_quantity,
        available_quantity=p.available_quantity,
        low_stock_threshold=p.low_stock_threshold,
        status=p.status,
        created_at=p.created_at,
        updated_at=p.updated_at
    )

@router.get("", response_model=List[ProductOut])
def get_products(
    search: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    category_name: Optional[str] = Query(None),
    stock_status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Product)

    if category_id:
        query = query.filter(Product.category_id == category_id)
    elif category_name and category_name != "All":
        query = query.join(Category).filter(Category.name == category_name)

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            (Product.name.ilike(search_pattern)) |
            (Product.product_code.ilike(search_pattern)) |
            (Product.description.ilike(search_pattern))
        )

    products = query.order_by(Product.name.asc()).all()
    results = [format_product_out(p) for p in products]

    if stock_status and stock_status != "ALL":
        results = [p for p in results if p.status == stock_status]

    return results

@router.get("/categories", response_model=List[CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).order_by(Category.name.asc()).all()
    return [CategoryOut.model_validate(c) for c in categories]

@router.get("/low-stock", response_model=List[ProductOut])
def get_low_stock_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    low_stock = [format_product_out(p) for p in products if p.status == "LOW STOCK"]
    return low_stock

@router.get("/out-of-stock", response_model=List[ProductOut])
def get_out_of_stock_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    out_of_stock = [format_product_out(p) for p in products if p.status == "OUT OF STOCK"]
    return out_of_stock

@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return format_product_out(p)

@router.post("", response_model=ProductOut)
def create_product(
    item: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "manager"]))
):
    existing = db.query(Product).filter(Product.product_code == item.product_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Product code already exists")

    category = db.query(Category).filter(Category.id == item.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    p = Product(
        product_code=item.product_code,
        name=item.name,
        description=item.description,
        category_id=item.category_id,
        image_url=item.image_url,
        quantity=item.quantity,
        low_stock_threshold=item.low_stock_threshold
    )
    db.add(p)
    db.commit()
    db.refresh(p)

    audit = AuditLog(
        action="ADD_PRODUCT",
        entity="Product",
        entity_id=p.id,
        user_id=current_user.id,
        user_name=current_user.username,
        timestamp=datetime.now(timezone.utc),
        details=f"Product {p.name} ({p.product_code}) created with initial stock {p.quantity}."
    )
    db.add(audit)
    db.commit()

    return format_product_out(p)

@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    item: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "manager"]))
):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")

    if item.name is not None:
        p.name = item.name
    if item.description is not None:
        p.description = item.description
    if item.category_id is not None:
        p.category_id = item.category_id
    if item.image_url is not None:
        p.image_url = item.image_url
    if item.low_stock_threshold is not None:
        p.low_stock_threshold = item.low_stock_threshold

    p.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(p)

    audit = AuditLog(
        action="UPDATE_PRODUCT",
        entity="Product",
        entity_id=p.id,
        user_id=current_user.id,
        user_name=current_user.username,
        timestamp=datetime.now(timezone.utc),
        details=f"Product {p.name} ({p.product_code}) updated."
    )
    db.add(audit)
    db.commit()

    return format_product_out(p)

from sqlalchemy.exc import IntegrityError

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"]))
):

    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")

    product_name = p.name
    product_code = p.product_code
    
    try:
        db.delete(p)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete '{product_name}' because it is linked to existing orders or restock history."
        )

    audit = AuditLog(
        action="DELETE_PRODUCT",
        entity="Product",
        entity_id=product_id,
        user_id=current_user.id,
        user_name=current_user.username,
        timestamp=datetime.now(timezone.utc),
        details=f"Product {product_name} ({product_code}) deleted from warehouse due to low demand."
    )
    db.add(audit)
    db.commit()

    return {"message": f"Product '{product_name}' deleted successfully"}

