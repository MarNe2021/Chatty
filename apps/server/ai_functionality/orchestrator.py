import asyncio
import logging
import boto3
import os
import sys
import json
from typing import Dict, List
logger = logging.getLogger('uvicorn.info')


class Orchestrator():


    def __init__(self):
       # self.model = create_boto3_client
        logger.info("Orchestrator created") 
        self.client = boto3.client(
            service_name='bedrock-runtime',
            region_name= os.getenv("region_name"),
            aws_access_key_id=os.getenv("aws_access_key_id"),
            aws_secret_access_key=os.getenv("aws_secret_access_key")
            )
        self.model_id = os.getenv("model_id")
        if self.client:
            logger.info("Client created")
    


    def create_messages(self, payload:IChat) -> List[Dict]:

        contextHorizont = 2 * payload.contextHorizont + 1

        messages:List[Dict] = [{"role":m.role , "content":[{"text": m.content}]} for m in payload.messages[1: contextHorizont]]
        logger.info(f"Messages in create:messages:\n{messages} ") 
        if messages[-1]["role"] != "user":
            logger.info(f"Not user - in create:messages:\n{messages[-1]} ") 
            messages = messages[:-1]        
        
        messages.reverse()

        return messages




    async def invoke(self, payload:IChat|None=None):


        if not payload:
            return

        messages:List[Dict] = self.create_messages(payload)
        
        logger.info(f"Model: {payload.model}" )
        logger.info(f"Kontexthorizont: {payload.contextHorizont}" )
        logger.info(f"Messages:\n{messages} ") 

        if not messages or len(messages) == 0:
            logger.warn(f"Messages is empyt -> payload: \n{payload.messages}")
            return

        converse_params = {
                "modelId": self.model_id, #payload.model if payload.model else self.model_id,
                
                # 1. Die Nachrichten (ohne anthropic-spezifische Typen-Verschachtelung)
                "messages": messages,
                
                # 2. Der System-Prompt (Direkt als Parameter für converse_stream)
                "system": [
                    {
                        "text": "You are a helpful assistant. Answer concisely."
                    }
                ],
                
                # 3. HIER kommen Temperatur und Max Tokens rein!
                "inferenceConfig": {
                    "maxTokens": 512,      
                    "temperature": payload.temperatur
                }
            }

        response = self.client.converse_stream(
            **converse_params
        )

        for event in response["stream"]:

            if "contentBlockDelta" in event:
                text_chunk = event["contentBlockDelta"]["delta"]["text"]
                yield f"event: text\ndata: {json.dumps(text_chunk)}\n\n"

            elif "metadata" in event:
                metrics_dict = event["metadata"]["usage"]
                metrics_json = json.dumps(metrics_dict) # Macht aus dem Dict einen String!
                yield f"event: metrics\ndata: {metrics_json}\n\n"
                
    