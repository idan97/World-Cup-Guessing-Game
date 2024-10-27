from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.UserSchema import UserCreateSchema, UserLoginSchema, UserResponseSchema
from app.Cruds.UserCrud import add_user, get_user_by_username, get_user_by_username_and_password, get_all_users, delete_user, promote_user
from app.utils.password_utils import hash_password
from backend.app.utils.token_utils import create_access_token, get_current_user
from datetime import timedelta
from fastapi.security import OAuth2PasswordBearer
from typing import List
from app.config import matches_collection , guesses_collection


router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def copy_initial_guesses(username: str):
    # Fetch all group stage matches from the matches collection
    group_matches = await matches_collection.find().to_list(length=None)
    
    # Define initial knockout matches
    knockout_matches = [
        # Round of 16
        {"match_id": "1", "homeTeam": "Winner Group A", "awayTeam": "Runner-up Group B", "round": "Round of 16", "date": None},
        {"match_id": "2", "homeTeam": "Winner Group C", "awayTeam": "Runner-up Group D", "round": "Round of 16", "date": None},
        {"match_id": "3", "homeTeam": "Winner Group E", "awayTeam": "Runner-up Group F", "round": "Round of 16", "date": None},
        {"match_id": "4", "homeTeam": "Winner Group G", "awayTeam": "Runner-up Group H", "round": "Round of 16", "date": None},
        {"match_id": "5", "homeTeam": "Winner Group B", "awayTeam": "Runner-up Group A", "round": "Round of 16", "date": None},
        {"match_id": "6", "homeTeam": "Winner Group D", "awayTeam": "Runner-up Group C", "round": "Round of 16", "date": None},
        {"match_id": "7", "homeTeam": "Winner Group F", "awayTeam": "Runner-up Group E", "round": "Round of 16", "date": None},
        {"match_id": "8", "homeTeam": "Winner Group H", "awayTeam": "Runner-up Group G", "round": "Round of 16", "date": None},
        
        # Quarterfinals
        {"match_id": "9", "homeTeam": "Winner Match 1", "awayTeam": "Winner Match 2", "round": "Quarterfinals", "date": None},
        {"match_id": "10", "homeTeam": "Winner Match 3", "awayTeam": "Winner Match 4", "round": "Quarterfinals", "date": None},
        {"match_id": "11", "homeTeam": "Winner Match 5", "awayTeam": "Winner Match 6", "round": "Quarterfinals", "date": None},
        {"match_id": "12", "homeTeam": "Winner Match 7", "awayTeam": "Winner Match 8", "round": "Quarterfinals", "date": None},
        
        # Semifinals
        {"match_id": "13", "homeTeam": "Winner Match 9", "awayTeam": "Winner Match 10", "round": "Semifinals", "date": None},
        {"match_id": "14", "homeTeam": "Winner Match 11", "awayTeam": "Winner Match 12", "round": "Semifinals", "date": None},
        
        # Final
        {"match_id": "15", "homeTeam": "Winner Semifinal 1", "awayTeam": "Winner Semifinal 2", "round": "Final", "date": None},
    ]
    
    # Prepare user guesses for group stage matches
    group_guesses = [
        {
            "username": username,
            "match_id": str(match["_id"]),
            "homeTeam": match["homeTeam"],
            "awayTeam": match["awayTeam"],
            "date": match["date"],
            "group": match["group"],
            "round": "Group",
            "userPrediction": {
                "team1": 0,
                "team2": 0
            }
        }
        for match in group_matches if match["group"] != "Knockout Stage"
    ]
    
    # Prepare user guesses for knockout matches
    knockout_guesses = [
        {
            "username": username,
            "match_id": match["match_id"],
            "homeTeam": match["homeTeam"],
            "awayTeam": match["awayTeam"],
            "date": match["date"],
            "group": None,
            "round": match["round"],
            "userPrediction": {
                "team1": 0,
                "team2": 0,
                "winner": None
            }
        }
        for match in knockout_matches
    ]

    all_guesses = group_guesses + knockout_guesses
    
    await guesses_collection.insert_many(all_guesses)


async def get_current_manager_user(token: str = Depends(oauth2_scheme)):
    # Fetch the username from the token
    user_name = await get_current_user(token)
    if not user_name:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # Fetch the full user details using the username
    user = await get_user_by_username(username=user_name)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if the user has a manager role
    if user.get("role") != "manager":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return user

@router.get("/users") 
async def list_users(current_user=Depends(get_current_manager_user)):
    users = await get_all_users()
    return users


@router.delete("/users/{user_id}")
async def delete_user_endpoint(user_id: str, current_user=Depends(get_current_manager_user)):
    deleted = await delete_user(user_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"message": "User deleted successfully"}


@router.put("/users/{user_id}/promote")
async def promote_user_endpoint(user_id: str, current_user=Depends(get_current_manager_user)):
    promoted = await promote_user(user_id)
    if not promoted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"message": "User promoted successfully"}


# Existing Register and Login Endpoints

@router.post("/register/", response_model=UserResponseSchema)
async def register_user(user_data: UserCreateSchema):
    existing_user = await get_user_by_username(user_data.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")

    # Hash the password
    hashed_password = hash_password(user_data.password)
    user_dict = user_data.dict()
    user_dict["password"] = hashed_password
    user_dict['role'] = "user"

    new_user = await add_user(user_dict)

    # Copy initial guesses for the new user
    await copy_initial_guesses(user_data.username)

    return new_user


@router.post("/login/")
async def login_user(user_credentials: UserLoginSchema):
    user = await get_user_by_username_and_password(user_credentials.username, user_credentials.password)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user['username']}, expires_delta=access_token_expires
    )

    user_to_return = {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user['username'],
        "role": user['role']
    }

    return user_to_return



