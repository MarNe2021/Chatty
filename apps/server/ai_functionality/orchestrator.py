import asyncio
import logging
import boto3
import os
import sys
import json
from typing import Dict
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
    


    async def invoke(self, content:Dict|None=None):


        if not content:
            return

        prompt:str = content['messages'][1]['content']



        converse_params = {
                "modelId": self.model_id,
                
                # 1. Die Nachrichten (ohne anthropic-spezifische Typen-Verschachtelung)
                "messages": [
                    {
                        "role": "user",
                        "content": [{"text": prompt}],
                    }
                ],
                
                # 2. Der System-Prompt (Direkt als Parameter für converse_stream)
                "system": [
                    {
                        "text": "You are a helpful assistant. Answer concisely."
                    }
                ],
                
                # 3. HIER kommen Temperatur und Max Tokens rein!
                "inferenceConfig": {
                    "maxTokens": 512,      
                    "temperature": content['temperatur']
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
                
    