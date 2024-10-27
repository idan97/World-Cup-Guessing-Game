from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, Body
from pymongo import UpdateOne
from app.config import matches_collection, daily_summaries_collection
from app.routers.auth import get_current_manager_user

router = APIRouter()

@router.get("/matches/all", tags=["manager"])
async def get_all_matches(current_user=Depends(get_current_manager_user)):
    matches = await matches_collection.find().to_list(length=None)
    if not matches:
        raise HTTPException(status_code=404, detail="No matches found")

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

@router.post("/results", tags=["manager"])
async def submit_results(
    results: dict = Body(...),
    current_user=Depends(get_current_manager_user)
):
    try:
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

        if bulk_operations:
            await matches_collection.bulk_write(bulk_operations)
        return {"message": "Results submitted successfully"}
    except Exception as e:
        print(f"Error submitting results: {e}")
        raise HTTPException(status_code=500, detail="Error submitting results")

@router.post("/daily-summary", tags=["manager"])
async def submit_daily_summary(
    summary: dict = Body(...)
):
    try:
        date = summary.get("date", datetime.utcnow().strftime('%Y-%m-%d'))
        content = summary.get("content", "")

        if not content:
            raise HTTPException(status_code=400, detail="Summary content is empty")

        existing_summary = await daily_summaries_collection.find_one({"date": date})

        if existing_summary:
            await daily_summaries_collection.update_one(
                {"date": date},
                {"$set": {"content": content}}
            )
            message = "Daily summary updated successfully"
        else:
            await daily_summaries_collection.insert_one({
                "date": date,
                "content": content
            })
            message = "Daily summary published successfully"

        return {"message": message}
    except Exception as e:
        print(f"Error submitting daily summary: {e}")
        raise HTTPException(status_code=500, detail="Error submitting daily summary")

@router.get("/daily-summary", tags=["manager"])
async def get_daily_summary(date: str):
    try:
        summary = await daily_summaries_collection.find_one({"date": date})
        if not summary:
            return {"summary": ""}

        return {"summary": summary["content"]}
    except Exception as e:
        print(f"Error fetching daily summary: {e}")
        raise HTTPException(status_code=500, detail="Error fetching daily summary")

@router.get("/all-summaries", tags=["manager"])
async def get_all_summaries():
    try:
        # Fetch all summaries from the collection
        summaries_cursor = daily_summaries_collection.find({})
        summaries = await summaries_cursor.to_list(length=None)
        
        # Format each summary with `date` and `content`
        formatted_summaries = [
            {"date": summary["date"], "content": summary["content"]}
            for summary in summaries
        ]

        return {"summaries": formatted_summaries}
    except Exception as e:
        print(f"Error fetching all summaries: {e}")
        raise HTTPException(status_code=500, detail="Error fetching all summaries")
