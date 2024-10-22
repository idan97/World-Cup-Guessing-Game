from pydantic import BaseModel
from typing import List, Optional

class UserPrediction(BaseModel):
    team1: int
    team2: int
    winner: Optional[str] = None  # Only used in knockout matches

class Prediction(BaseModel):
    username: str
    match_id: str
    homeTeam: str
    awayTeam: str
    date: Optional[str]
    group: Optional[str]
    round: str  # 'Group', 'Round of 16', 'Quarterfinals', etc.
    userPrediction: UserPrediction

class PredictionPayload(BaseModel):
    predictions: List[Prediction]
    topGoalScorer: Optional[str] = None
