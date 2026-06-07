from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Any
import logging



router = APIRouter()
logger = logging.getLogger('uvicorn.error')


class IMessage(BaseModel): 
    timestamp:int
    role:str
    content:str
    files:List[Any]




class IChat(BaseModel):
    
    owner:str
    timestamp:int
    date:str
    messages:List[IMessage]
    model:str
    contextHorizont:int
    temperatur:float
    inputTokens:int
    outputTokens:int
    totalCosts:float
    web:bool
    rag:bool
    tool:bool


@router.post("/api/converse")
async def converse(request:Request, payload:IChat):

    orchestrator = request.app.state.orchestrator
    return StreamingResponse(content=orchestrator.invoke(payload.dict()), media_type="text/event-stream")