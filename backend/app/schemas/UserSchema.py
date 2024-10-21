# app/schemas/UserSchema.py

from pydantic import BaseModel, EmailStr

class UserCreateSchema(BaseModel):
    username: str
    password: str
    number: int
    email: EmailStr

class UserLoginSchema(BaseModel):
    username: str
    password: str

class UserResponseSchema(BaseModel):
    id: str
    username: str
    email: EmailStr

    class Config:
        orm_mode = True
