from pydantic import BaseModel
from typing import Optional

class MatchSchema(BaseModel):
    id: int
    team1: str
    team2: str
    date: str
    score: Optional[dict]  # You can define this more specifically based on your score structure
