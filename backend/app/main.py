from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, matches, guesses

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(matches.router, prefix="/matches", tags=["matches"])  # Ensure matches router is included
app.include_router(guesses.router, prefix="/guesses", tags=["guesses"])  # Include guesses router



if __name__ == "__main__":
    import uvicorn
    # Start the server on host 127.0.0.1 and port 8000 without reload
    uvicorn.run(app, host="127.0.0.1", port=8000)
