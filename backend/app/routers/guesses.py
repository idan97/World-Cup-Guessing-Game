# app/routes/guesses.py

from fastapi import APIRouter, HTTPException, Depends
from app.config import guesses_collection
from app.utils.token_utils import get_current_user  # Ensure this is correctly implemented

router = APIRouter()

@router.get("/", tags=["guesses"])
async def get_user_guesses(current_user: str = Depends(get_current_user)):
    # Fetch all guesses for the current user from the guesses collection
    user_guesses = await guesses_collection.find({"username": current_user}).to_list(length=None)

    if not user_guesses:
        raise HTTPException(status_code=404, detail="No guesses found for this user")

    # Prepare a clean response with guesses
    clean_guesses = [
        {
            "match_id": guess["match_id"],
            "homeTeam": guess["homeTeam"],
            "awayTeam": guess["awayTeam"],
            "date": guess["date"],
            "group": guess.get("group", "Unknown"),
            "userPrediction": guess["userPrediction"]
        }
        for guess in user_guesses
    ]

    return clean_guesses



