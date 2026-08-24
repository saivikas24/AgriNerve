from pydantic import BaseModel, ConfigDict, EmailStr


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: str | None = None
    village: str | None = None
    district: str | None = None
    state: str = "Andhra Pradesh"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    role: str