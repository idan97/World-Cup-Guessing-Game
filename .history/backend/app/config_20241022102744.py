# app/config.py
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

MONGO_DETAILS = "mongodb://localhost:27017"  # Your MongoDB connection string

# Initialize the MongoDB client
client = AsyncIOMotorClient(MONGO_DETAILS)

# Define the database and collection
database = client.world_cup_prediction  # Use your database name
users_collection = database.get_collection("users")  # Collection name: 'users'
matches_collection = database.get_collection("matches")  # Collection name: 'matches'
groups_collection = database.get_collection("groups")  # Collection name: 'groups'
guesses_collection = database.get_collection("guesses")  # Collection name: 'guesses'

# Helper function to convert MongoDB document to a dictionary
def user_helper(user) -> dict:
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "number": user["number"], 
        "mail": user["mail"]
    }
