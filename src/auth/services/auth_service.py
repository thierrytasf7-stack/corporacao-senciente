import jwt
from datetime import datetime, timedelta
from jose import JWTError
from sqlalchemy.orm import Session
from passlib.hash import bcrypt

from infrastructure.config import settings
from auth.models.user import User
from auth.schemas.auth import TokenData, UserCreate

class AuthService:
    @staticmethod
    def authenticate(db: Session, email: str, password: str):
        user = db.query(User).filter(User.email == email).first()
        if user and user.verify_password(password):
            return user
        return None
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: timedelta = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def create_user(db: Session, user: UserCreate):
        hashed_password = bcrypt.hash(user.password)
        db_user = User(
            email=user.email,
            password_hash=hashed_password,
            is_active=user.is_active
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
