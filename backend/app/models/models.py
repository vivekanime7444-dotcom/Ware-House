from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from app.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, nullable=True)
    full_name = Column(String, nullable=True)
    role = Column(String, default="warehouse") # "admin" or "warehouse"
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=utc_now)

    orders = relationship("Order", back_populates="user")
    restocks = relationship("RestockTransaction", back_populates="user")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)

    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    product_code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    image_url = Column(String, nullable=True)
    quantity = Column(Integer, default=0, nullable=False) # Physical total quantity
    reserved_quantity = Column(Integer, default=0, nullable=False) # Quantity reserved by pending/accepted orders
    low_stock_threshold = Column(Integer, default=10, nullable=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    category = relationship("Category", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product")
    restock_transactions = relationship("RestockTransaction", back_populates="product")
    verifications = relationship("OrderVerification", back_populates="product")
    damage_missing_records = relationship("DamageMissingRecord", back_populates="product")
    replacements = relationship("ReplacementTransaction", back_populates="product")

    @property
    def available_quantity(self) -> int:
        return max(0, self.quantity - self.reserved_quantity)

    @property
    def status(self) -> str:
        if self.quantity > self.low_stock_threshold:
            return "IN STOCK"
        elif 1 <= self.quantity <= self.low_stock_threshold:
            return "LOW STOCK"
        else:
            return "OUT OF STOCK"

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="PENDING") # PENDING, ACCEPTED, PROCESSING, SHIPPED, CANCELLED
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    verifications = relationship("OrderVerification", back_populates="order", cascade="all, delete-orphan")
    damage_missing_records = relationship("DamageMissingRecord", back_populates="order", cascade="all, delete-orphan")
    replacements = relationship("ReplacementTransaction", back_populates="order", cascade="all, delete-orphan")
    shipment = relationship("Shipment", back_populates="order", uselist=False)

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, default=0.0)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

class RestockTransaction(Base):
    __tablename__ = "restock_transactions"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity_added = Column(Integer, nullable=False)
    previous_quantity = Column(Integer, nullable=False)
    new_quantity = Column(Integer, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    product = relationship("Product", back_populates="restock_transactions")
    user = relationship("User", back_populates="restocks")

class OrderVerification(Base):
    __tablename__ = "order_verifications"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    expected_quantity = Column(Integer, nullable=False)
    good_quantity = Column(Integer, nullable=False)
    damaged_quantity = Column(Integer, default=0, nullable=False)
    missing_quantity = Column(Integer, default=0, nullable=False)
    is_verified = Column(Boolean, default=False)
    verified_at = Column(DateTime, default=utc_now)
    verified_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    order = relationship("Order", back_populates="verifications")
    product = relationship("Product", back_populates="verifications")

class DamageMissingRecord(Base):
    __tablename__ = "damage_missing_records"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    damaged_quantity = Column(Integer, default=0, nullable=False)
    missing_quantity = Column(Integer, default=0, nullable=False)
    status = Column(String, default="REPORTED") # REPORTED, REPLACED, RESOLVED
    created_at = Column(DateTime, default=utc_now)

    order = relationship("Order", back_populates="damage_missing_records")
    product = relationship("Product", back_populates="damage_missing_records")

class ReplacementTransaction(Base):
    __tablename__ = "replacement_transactions"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity_replaced = Column(Integer, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    order = relationship("Order", back_populates="replacements")
    product = relationship("Product", back_populates="replacements")

class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, unique=True)
    shipped_at = Column(DateTime, default=utc_now)
    shipped_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    tracking_code = Column(String, nullable=True)

    order = relationship("Order", back_populates="shipment")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String, nullable=False)
    entity = Column(String, nullable=False)
    entity_id = Column(Integer, nullable=True)
    user_id = Column(Integer, nullable=True)
    user_name = Column(String, default="System")
    timestamp = Column(DateTime, default=utc_now)
    details = Column(Text, nullable=True)
