from app.config import matches_collection


async def get_matches_from_db():
    matches = await matches_collection.find().sort("date").to_list(length=None)
    return matches