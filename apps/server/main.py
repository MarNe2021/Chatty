import os
import sys
import logging
from ai_functionality import orchestrator
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from routers import converse

load_dotenv()


logger = logging.getLogger('uvicorn.error')


@asynccontextmanager
async def lifespan(app: FastAPI):

    app.state.orchestrator = orchestrator.Orchestrator()
    yield
    app.state.orchestrator = None


app = FastAPI(title="Chatty", lifespan=lifespan)


origins = {
    "http://127.0.0.1:3000",
    "http://localhost:3000"
}


app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
    

# ================================ API Router =================================

app.include_router(converse.router)



def main():
    print("Hello from chatty-backend!")


if __name__ == "__main__":
    main()
