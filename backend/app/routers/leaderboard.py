# app/routes/leaderboard.py

from fastapi import APIRouter, HTTPException, Depends
from pymongo import UpdateOne
from app.config import predictions_collection, users_collection, matches_collection
from app.routers.auth import get_current_manager_user  # Assume you have an auth module

router = APIRouter()

@router.post("/leaderboard/update")
async def update_leaderboard(current_user=Depends(get_current_manager_user)):
    try:
        # Fetch all user predictions
        user_predictions = await predictions_collection.find().to_list(length=None)
        # Fetch real match results
        matches = await matches_collection.find().to_list(length=None)

        # Map match results for easy lookup
        results_map = {str(match["_id"]): match.get("result", None) for match in matches}

        # Calculate points for each user
        user_points = {}

        for prediction in user_predictions:
            username = prediction["username"]
            match_id = prediction["match_id"]
            user_pred = prediction["userPrediction"]
            real_result = results_map.get(match_id)

            if not real_result:
                continue  # Skip if result is not available

            # Compare user_pred and real_result to calculate points
            points = calculate_points(user_pred, real_result)

            if username not in user_points:
                user_points[username] = 0
            user_points[username] += points

        # Update user points in the users collection
        bulk_operations = []
        for username, points in user_points.items():
            bulk_operations.append(
                UpdateOne(
                    {"username": username},
                    {"$set": {"points": points}}
                )
            )

        if bulk_operations:
            await users_collection.bulk_write(bulk_operations)

        return {"message": "Leaderboard updated successfully"}

    except Exception as e:
        print(f"Error updating leaderboard: {e}")
        raise HTTPException(status_code=500, detail="Error updating leaderboard")

def calculate_points(user_pred, real_result):
    # Implement your scoring logic here
    # For example:
    points = 0
    if user_pred["team1"] == real_result["team1"] and user_pred["team2"] == real_result["team2"]:
        points += 3  # Exact score
    elif (user_pred["team1"] - user_pred["team2"]) == (real_result["team1"] - real_result["team2"]):
        points += 2  # Correct goal difference
    elif (user_pred["team1"] > user_pred["team2"] and real_result["team1"] > real_result["team2"]) or \
         (user_pred["team1"] < user_pred["team2"] and real_result["team1"] < real_result["team2"]) or \
         (user_pred["team1"] == user_pred["team2"] and real_result["team1"] == real_result["team2"]):
        points += 1  # Correct outcome

    return points
