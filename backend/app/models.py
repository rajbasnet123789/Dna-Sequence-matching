from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    reports = relationship("Report", back_populates="user")

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    image1_name = Column(String(255))
    image2_name = Column(String(255))
    sequence1 = Column(Text)
    sequence2 = Column(Text)
    peak_match_percentage = Column(Float)
    kmp_match_percentage = Column(Float)
    rabin_karp_match_percentage = Column(Float)
    kmp_time = Column(Float)
    rabin_karp_time = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="reports")
