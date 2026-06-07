import os
import boto3
from dotenv import load_dotenv


client = boto3.client(
    service_name='bedrock-runtime',
    region_name= os.getenv("region_name"),
    aws_access_key_id=os.getenv("aws_access_key_id"),
    aws_secret_access_key=os.getenv("aws_secret_access_key")
    )