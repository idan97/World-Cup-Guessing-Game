# app/routes/matches.py

from fastapi import APIRouter, HTTPException
import requests
from app.config import matches_collection, groups_collection
import httpx  # Add this import to use httpx
from pymongo import UpdateOne  # Import UpdateOne to resolve the error

router = APIRouter()
first_run = True  # Initialize as True

async def fetch_and_store_matches():
    global first_run
    if first_run:
        # Fetch match data from the API
        url = "https://api.football-data.org/v4/competitions/WC/matches"
        headers = {"X-Auth-Token": "9d283d4b86cd4442833e84048aa60acd"}
        response = requests.get(url, headers=headers)

        if response.status_code != 200:
            print(f"Error fetching data from API: {response.status_code} - {response.text}")  # Log response text
            raise HTTPException(status_code=response.status_code, detail="Error fetching data from API")

        matches = response.json().get("matches", [])
        # Store matches in MongoDB
        await matches_collection.delete_many({})  # Clear previous data
        for match in matches:
            match_data = {
                "homeTeam": match["homeTeam"]["name"],
                "awayTeam": match["awayTeam"]["name"],
                "date": match["utcDate"],
                "score": match["score"],
                # Initialize group as 'Unknown' or based on your logic
                "group": "Unknown",
            }
            await matches_collection.insert_one(match_data)
        
        first_run = False  # Update the flag after fetching

async def fetch_and_store_groups():
    print("Fetching group data from API")
    url = "https://api.football-data.org/v4/competitions/WC/standings"
    headers = {"X-Auth-Token": "9d283d4b86cd4442833e84048aa60acd"}  
    
    async with httpx.AsyncClient() as client_httpx:
        response = await client_httpx.get(url, headers=headers)

    if response.status_code != 200:
        print(f"Error fetching data from API: {response.status_code} - {response.text}")  # Log the error
        raise HTTPException(status_code=response.status_code, detail="Error fetching data from API")

    standings = response.json().get("standings", [])
    if not standings:
        print("No standings data found in API response")
        raise HTTPException(status_code=500, detail="No standings data found in API response")

    # Clear previous group data
    await groups_collection.delete_many({})

    # Step 1: Build a team to group mapping and store team data
    team_group_map = {}  # Mapping from team name to group name

    for standing in standings:
        group_name = standing.get("group")
        if not group_name:
            continue  # Skip if group name is missing
        for team in standing.get("table", []):
            team_name = team["team"]["name"]
            team_data = {
                "name": team_name,
                "points": team["points"],
                "goalsFor": team["goalsFor"],
                "goalsAgainst": team["goalsAgainst"],
                "group": group_name  # Include group information
            }
            await groups_collection.insert_one(team_data)
            team_group_map[team_name] = group_name

    # Step 2: Assign groups to matches using bulk operations for efficiency
    # Fetch all matches from the database, sorted by date ascending
    all_matches = await matches_collection.find({}).sort("date", 1).to_list(length=None)

    bulk_operations = []
    knockout_started = False  # Flag to indicate if knockout stage has begun

    for match in all_matches:
        match_id = match["_id"]
        home_team = match.get("homeTeam")
        away_team = match.get("awayTeam")

        if not home_team or not away_team:
            print(f"Match {match_id} is missing team information; skipping.")
            continue  # Skip matches with missing team information

        if not knockout_started:
            # Retrieve groups for both teams
            home_group = team_group_map.get(home_team)
            away_group = team_group_map.get(away_team)

            if home_group and away_group and home_group == away_group:
                # Both teams are in the same group
                group_to_assign = home_group
                print(f"Match {match_id} between '{home_team}' and '{away_team}' assigned to group '{group_to_assign}'.")
            else:
                # Teams are in different groups or group information is missing
                group_to_assign = "Knockout Stage"
                knockout_started = True  # Set the flag as knockout stage has begun
                print(f"Match {match_id} between '{home_team}' and '{away_team}' assigned to '{group_to_assign}'.")
        else:
            # All subsequent matches are part of the Knockout Stage
            group_to_assign = "Knockout Stage"
            print(f"Match {match_id} between '{home_team}' and '{away_team}' assigned to '{group_to_assign}' (Knockout Stage).")

        # Check if the current group is different from the group to assign
        current_group = match.get("group", "Unknown")
        if current_group != group_to_assign:
            bulk_operations.append(
                UpdateOne(
                    {"_id": match_id},
                    {"$set": {"group": group_to_assign}}
                )
            )
            print(f"Prepared update for match {match_id} with group '{group_to_assign}'.")

    if bulk_operations:
        result = await matches_collection.bulk_write(bulk_operations)
    else:
        print("No matches needed updating.")


@router.on_event("startup")
async def startup_event():
    await fetch_and_store_matches()
    await fetch_and_store_groups()

@router.get("/")
async def get_matches():
    matches = await matches_collection.find().to_list(length=None)  # Correctly fetch matches
    if not matches:
        await fetch_and_store_matches()  # Fetch matches if not found
        matches = await matches_collection.find().to_list(length=None)  # Fetch again after storing

    # Convert ObjectId to string and prepare a clean response
    clean_matches = [
        {
            "id": str(match["_id"]),
            "homeTeam": match["homeTeam"],
            "awayTeam": match["awayTeam"],
            "date": match["date"],
            "group": match.get("group", "Unknown"),  # Include group information
        }
        for match in matches
    ]

    return clean_matches

@router.get("/groups")
async def get_groups():
    groups = await groups_collection.find().to_list(length=None)
    
    if not groups:
        await fetch_and_store_groups()
        groups = await groups_collection.find().to_list(length=None)

    # Organize data by groups and sort teams within each group
    grouped_teams = {}
    for team in groups:
        group_name = team['group']
        if group_name not in grouped_teams:
            grouped_teams[group_name] = []
        grouped_teams[group_name].append({
            "name": team["name"],
            "points": team["points"],
            "goalsFor": team["goalsFor"],
            "goalsAgainst": team["goalsAgainst"],
            "goalDifference": team["goalsFor"] - team["goalsAgainst"]
        })

    # Sort each group's teams by points, then goal difference, then goals for
    for group in grouped_teams.values():
        group.sort(key=lambda x: (x['points'], x['goalDifference'], x['goalsFor']), reverse=True)
    
    return grouped_teams
