# app/auth.py

from datetime import timedelta
from fastapi import APIRouter, HTTPException
from app.schemas.UserSchema import UserCreateSchema, UserLoginSchema, UserResponseSchema
from app.Cruds.UserCrud import add_user, get_user_by_username , get_user_by_username_and_password
from app.utils.password_utils import verify_password, hash_password
from app.config import guesses_collection, matches_collection
from backend.app.utils.token_utils import create_access_token

router = APIRouter()

async def copy_initial_guesses(username: str):
    # Fetch all matches from the matches collection
    matches = await matches_collection.find().to_list(length=None)
    
    # Prepare user guesses by copying the match data and initializing predictions to 0-0
    guesses = [
        {
            "username": username,
            "match_id": str(match["_id"]),
            "homeTeam": match["homeTeam"],
            "awayTeam": match["awayTeam"],
            "date": match["date"],
            "group": match["group"],
            "userPrediction": {
                "team1": 0,  # Initialize guess for home team to 0
                "team2": 0   # Initialize guess for away team to 0
            }
        }
        for match in matches
    ]
    
    # Insert the initial guesses into the guesses collection
    await guesses_collection.insert_many(guesses)

@router.post("/register/", response_model=UserResponseSchema)
async def register_user(user_data: UserCreateSchema):
    existing_user = await get_user_by_username(user_data.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")

    # Hash the password
    hashed_password = hash_password(user_data.password)

    # Create the new user
    user_dict = user_data.dict()
    user_dict["password"] = hashed_password

    new_user = await add_user(user_dict)

    # Copy initial guesses for the new user
    await copy_initial_guesses(user_data.username)

    return new_user


@router.post("/login/")
async def login_user(user_credentials: UserLoginSchema):
    # Use the username instead of email
    user = await get_user_by_username_and_password(user_credentials.username, user_credentials.password)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # Generate a JWT token
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user['username']}, expires_delta=access_token_expires
    )

    # Return the token and user info
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user['username']
    }
