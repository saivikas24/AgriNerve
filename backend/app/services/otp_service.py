from datetime import datetime, timedelta

import secrets
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.user import User
from app.models.verification_otp import VerificationOTP


OTP_EXPIRY_MINUTES = 10
MAX_OTP_ATTEMPTS = 5


def utc_now() -> datetime:
    """Return current UTC time as a naive datetime."""
    return datetime.utcnow()


def generate_otp() -> str:
    """Generate a secure 6-digit OTP."""
    return f"{secrets.randbelow(1_000_000):06d}"


def create_otp(
    db: Session,
    user: User,
    purpose: str,
) -> str:
    """Create and store a hashed OTP."""

    otp = generate_otp()

    statement = select(VerificationOTP).where(
        VerificationOTP.user_id == user.id,
        VerificationOTP.purpose == purpose,
        VerificationOTP.verified_at.is_(None),
    )

    existing_otps = db.scalars(statement).all()

    for existing in existing_otps:
        existing.verified_at = utc_now()

    verification = VerificationOTP(
        user_id=user.id,
        purpose=purpose,
        otp_hash=hash_password(otp),
        expires_at=utc_now() + timedelta(minutes=OTP_EXPIRY_MINUTES),
        attempts=0,
    )

    db.add(verification)
    db.commit()

    return otp


def verify_otp(
    db: Session,
    user: User,
    purpose: str,
    otp: str,
) -> bool:
    """Verify an OTP for a user and purpose."""

    statement = (
        select(VerificationOTP)
        .where(
            VerificationOTP.user_id == user.id,
            VerificationOTP.purpose == purpose,
            VerificationOTP.verified_at.is_(None),
        )
        .order_by(VerificationOTP.created_at.desc())
    )

    verification = db.scalar(statement)

    if verification is None:
        return False

    if verification.expires_at < utc_now():
        return False

    if verification.attempts >= MAX_OTP_ATTEMPTS:
        return False

    verification.attempts += 1

    if not verify_password(otp, verification.otp_hash):
        db.commit()
        return False

    verification.verified_at = utc_now()

    if purpose == "email_verification":
        user.email_verified = True

    elif purpose == "mobile_verification":
        user.mobile_verified = True

    db.commit()

    return True
