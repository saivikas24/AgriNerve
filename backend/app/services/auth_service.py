from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.farmer import FarmerProfile
from app.models.user import User
from app.schemas.auth import UserRegister


def get_user_by_email(
    db: Session,
    email: str,
) -> User | None:
    """Find a user by email address."""
    statement = select(User).where(User.email == email)
    return db.scalar(statement)


def create_user(
    db: Session,
    user_data: UserRegister,
) -> User:
    """Create a new user and farmer profile."""
    hashed_password = hash_password(user_data.password)

    user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        role="farmer",
    )

    db.add(user)
    db.flush()

    farmer_profile = FarmerProfile(
        user_id=user.id,
        full_name=user_data.full_name,
        phone=user_data.phone,
        village=user_data.village,
        district=user_data.district,
        state=user_data.state,
    )

    db.add(farmer_profile)
    db.commit()
    db.refresh(user)

    return user


def authenticate_user(
    db: Session,
    email: str,
    password: str,
) -> User | None:
    """Verify user credentials."""
    user = get_user_by_email(db, email)

    if user is None:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    return user