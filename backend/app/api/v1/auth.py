from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
)
from app.services.auth_service import (
    authenticate_user,
    create_user,
    get_user_by_email,
    update_password,
)
from app.services.otp_service import create_otp, verify_otp


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    user_data: UserRegister,
    db: Session = Depends(get_db),
):
    existing_user = get_user_by_email(db, user_data.email)

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    if not user_data.consent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Consent is required to create an AgriNerve account.",
        )

    user = create_user(db, user_data)

    return user


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    user_data: UserLogin,
    db: Session = Depends(get_db),
):
    user = authenticate_user(
        db,
        user_data.email,
        user_data.password,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(str(user.id))

    return TokenResponse(
        access_token=access_token,
    )


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user


@router.post(
    "/send-email-otp",
)
def send_email_otp(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already verified.",
        )

    otp = create_otp(
        db,
        current_user,
        "email_verification",
    )

    response = {
        "message": "Email verification OTP generated.",
    }

    if settings.debug:
        response["development_otp"] = otp

    return response


@router.post(
    "/verify-email-otp",
)
def verify_email_otp(
    otp_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    otp = str(otp_data.get("otp", ""))

    if current_user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already verified.",
        )

    if not verify_otp(
        db,
        current_user,
        "email_verification",
        otp,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP.",
        )

    return {
        "message": "Email verified successfully.",
        "email_verified": True,
    }


@router.post(
    "/send-mobile-otp",
)
def send_mobile_otp(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.farmer_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Farmer profile not found.",
        )

    if not current_user.farmer_profile.phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mobile number is required before verification.",
        )

    if current_user.mobile_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mobile number is already verified.",
        )

    otp = create_otp(
        db,
        current_user,
        "mobile_verification",
    )

    response = {
        "message": "Mobile verification OTP generated.",
    }

    if settings.debug:
        response["development_otp"] = otp

    return response


@router.post(
    "/verify-mobile-otp",
)
def verify_mobile_otp(
    otp_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    otp = str(otp_data.get("otp", ""))

    if current_user.mobile_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mobile number is already verified.",
        )

    if not current_user.farmer_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Farmer profile not found.",
        )

    if not current_user.farmer_profile.phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mobile number is required before verification.",
        )

    if not verify_otp(
        db,
        current_user,
        "mobile_verification",
        otp,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP.",
        )

    return {
        "message": "Mobile number verified successfully.",
        "mobile_verified": True,
    }


@router.post(
    "/forgot-password",
)
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    user = get_user_by_email(db, request.email)

    if user is None:
        return {
            "message": "If the account exists, a password reset OTP has been generated."
        }

    otp = create_otp(
        db,
        user,
        "password_reset",
    )

    response = {
        "message": "If the account exists, a password reset OTP has been generated."
    }

    if settings.debug:
        response["development_otp"] = otp

    return response


@router.post(
    "/reset-password",
)
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    user = get_user_by_email(db, request.email)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset request.",
        )

    valid = verify_otp(
        db,
        user,
        "password_reset",
        request.otp,
    )

    if not valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset OTP.",
        )

    update_password(
        db,
        user,
        request.new_password,
    )

    return {
        "message": "Password reset successfully.",
    }
