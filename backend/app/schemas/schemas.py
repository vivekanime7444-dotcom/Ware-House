from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str
    user: "UserOut"

class LoginRequest(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    role: str

# --- Category Schemas ---
class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None

# --- Product Schemas ---
class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_code: str
    name: str
    description: Optional[str] = None
    category_id: int
    category_name: Optional[str] = None
    image_url: Optional[str] = None
    quantity: int
    reserved_quantity: int
    available_quantity: int
    low_stock_threshold: int
    status: str
    created_at: datetime
    updated_at: datetime

class ProductCreate(BaseModel):
    product_code: str
    name: str
    description: Optional[str] = None
    category_id: int
    image_url: Optional[str] = None
    quantity: int = Field(ge=0, default=0)
    low_stock_threshold: int = Field(ge=1, default=10)

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    image_url: Optional[str] = None
    low_stock_threshold: Optional[int] = Field(default=None, ge=1)

# --- Restock Schemas ---
class RestockCreate(BaseModel):
    product_id: int
    quantity_added: int = Field(gt=0, description="Restock quantity must be positive")

class RestockOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    product_name: Optional[str] = None
    product_code: Optional[str] = None
    quantity_added: int
    previous_quantity: int
    new_quantity: int
    user_name: Optional[str] = None
    created_at: datetime

# --- Order Schemas ---
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0, description="Ordered quantity must be greater than zero")

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]

class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    product_name: Optional[str] = None
    product_code: Optional[str] = None
    product_image: Optional[str] = None
    quantity: int
    unit_price: float
    current_available: Optional[int] = None

class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_number: str
    user_id: int
    user_name: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemOut] = []
    fulfillment_ratio: float = 1.0
    priority_label: str = "High Priority"

# --- Verification & Tracking Schemas ---
class ItemVerificationInput(BaseModel):
    product_id: int
    good_quantity: int = Field(ge=0)
    damaged_quantity: int = Field(ge=0)
    missing_quantity: int = Field(ge=0)

class OrderVerificationRequest(BaseModel):
    items: List[ItemVerificationInput]

class ItemVerificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    product_id: int
    product_name: Optional[str] = None
    product_image: Optional[str] = None
    expected_quantity: int
    good_quantity: int
    damaged_quantity: int
    missing_quantity: int
    is_verified: bool
    verified_at: datetime

class OrderVerificationSummary(BaseModel):
    order_id: int
    order_number: str
    status: str
    verifications: List[ItemVerificationOut]
    total_damaged: int
    total_missing: int
    replacement_needed: int
    can_ship: bool

class ReplacementRequest(BaseModel):
    product_id: int
    replacement_quantity: int = Field(gt=0)

# --- Damaged & Missing Record Schemas ---
class DamageMissingRecordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    order_number: Optional[str] = None
    product_id: int
    product_name: Optional[str] = None
    product_code: Optional[str] = None
    product_image: Optional[str] = None
    category_name: Optional[str] = None
    damaged_quantity: int
    missing_quantity: int
    status: str
    created_at: datetime

# --- Dashboard & Analytics Schemas ---
class DashboardSummary(BaseModel):
    total_products: int
    total_units: int
    low_stock_items: int
    out_of_stock_items: int
    pending_orders: int
    ready_orders: int # ACCEPTED orders
    shipped_orders: int
    damaged_items: int
    missing_items: int

class AuditLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    action: str
    entity: str
    entity_id: Optional[int] = None
    user_name: str
    timestamp: datetime
    details: Optional[str] = None
