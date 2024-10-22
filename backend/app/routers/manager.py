# app/routes/manager.py

from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, Body
from pymongo import UpdateOne
from app.config import matches_collection, results_collection, daily_summaries_collection
from app.routers.auth import get_current_manager_user  # Assume you have an auth module

router = APIRouter()

@router.get("/matches/all")
async def get_all_matches(current_user=Depends(get_current_manager_user)):
    matches = await matches_collection.find().to_list(length=None)
    if not matches:
        raise HTTPException(status_code=404, detail="No matches found")

    # Convert ObjectId to string and include results if available
    clean_matches = [
        {
            "id": str(match["_id"]),
            "homeTeam": match["homeTeam"],
            "awayTeam": match["awayTeam"],
            "date": match["date"],
            "group": match.get("group", "Unknown"),
            "result": match.get("result", None),
        }
        for match in matches
    ]

    return clean_matches

@router.post("/results")
async def submit_results(
    results: dict = Body(...),
    current_user=Depends(get_current_manager_user)
):
    try:
        # results: { "results": [ ... ] }
        results_list = results.get("results", [])
        bulk_operations = []

        for result in results_list:
            match_id = result["match_id"]
            match_result = result["result"]

            bulk_operations.append(
                UpdateOne(
                    {"_id": match_id},
                    {"$set": {"result": match_result}}
                )
            )

            # Optionally, you can store the results in a separate collection

        if bulk_operations:
            await matches_collection.bulk_write(bulk_operations)
        return {"message": "Results submitted successfully"}
    except Exception as e:
        print(f"Error submitting results: {e}")
        raise HTTPException(status_code=500, detail="Error submitting results")

@router.post("/daily-summary")
async def submit_daily_summary(
    summary: dict = Body(...),
    current_user=Depends(get_current_manager_user)
):
    try:
        content = summary.get("content", "")
        if not content:
            raise HTTPException(status_code=400, detail="Summary content is empty")

        # Store the daily summary in the database
        await daily_summaries_collection.insert_one({
            "content": content,
            "date": datetime.utcnow()
        })

        return {"message": "Daily summary published successfully"}
    except Exception as e:
        print(f"Error submitting daily summary: {e}")
        raise HTTPException(status_code=500, detail="Error submitting daily summary")
