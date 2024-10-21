# app/Cruds/UserCrud.py

from app.config import users_collection
from app.utils.password_utils import verify_password

async def add_user(user_data: dict):
    result = await users_collection.insert_one(user_data)
    user_data['id'] = str(result.inserted_id)
    return user_data

async def get_user_by_email_and_password(email: str, password: str):
    user = await users_collection.find_one({"email": email})
    if user and verify_password(password, user["password"]):
        user['id'] = str(user['_id'])
        return user
    return None

async def get_user_by_username(username: str):
    user = await users_collection.find_one({"username": username})
    if user:
        user['id'] = str(user['_id'])
        return user
    return None

async def get_user_by_username_and_password(username: str, password: str):
    user = await get_user_by_username(username)
    if user and verify_password(password, user["password"]):
        return user
    return None