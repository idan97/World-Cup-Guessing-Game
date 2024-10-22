# app/routes/guesses.py

from fastapi import APIRouter, HTTPException, Depends
from app.config import guesses_collection
from app.utils.token_utils import get_current_user  # Ensure this is correctly implemented
from app.schemas.GuessesSchema import PredictionPayload

router = APIRouter()

@router.get("/", tags=["guesses"])
async def get_user_guesses(current_user: str = Depends(get_current_user)):
    # Fetch all guesses for the current user
    user_guesses = await guesses_collection.find({"username": current_user}).to_list(length=None)
    
    if not user_guesses:
        raise HTTPException(status_code=404, detail="No guesses found for this user")
    
    # Separate top goal scorer prediction
    top_goal_scorer = None
    predictions = []
    for guess in user_guesses:
        if guess["round"] == "TopGoalScorer":
            top_goal_scorer = guess.get("topGoalScorer")
        else:
            predictions.append({
                "username": guess["username"],
                "match_id": guess["match_id"],
                "homeTeam": guess["homeTeam"],
                "awayTeam": guess["awayTeam"],
                "date": guess.get("date"),
                "group": guess.get("group"),
                "round": guess["round"],
                "userPrediction": guess["userPrediction"]
            })

    total_predictions = {
        "predictions": predictions,
        "topGoalScorer": top_goal_scorer
    }
    
    return total_predictions

@router.post("/", tags=["guesses"])
async def submit_predictions(payload: PredictionPayload, current_user: str = Depends(get_current_user)):
    try:
        # Validate that all knockout matches have valid teams
        invalid_knockout_matches = [
            pred for pred in payload.predictions
            if pred.round != "Group" and (pred.homeTeam == "-" or pred.awayTeam == "-")
        ]
        if invalid_knockout_matches:
            raise HTTPException(status_code=400, detail="All knockout matches must have valid teams.")
        
        # Remove existing guesses for the user
        await guesses_collection.delete_many({"username": current_user})
        
        # Insert new guesses
        predictions = [pred.dict() for pred in payload.predictions]
        await guesses_collection.insert_many(predictions)
        
        # Handle top goal scorer prediction if provided
        if payload.topGoalScorer:
            await guesses_collection.insert_one({
                "username": current_user,
                "round": "TopGoalScorer",
                "topGoalScorer": payload.topGoalScorer
            })
        
        return {"message": "Predictions submitted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
