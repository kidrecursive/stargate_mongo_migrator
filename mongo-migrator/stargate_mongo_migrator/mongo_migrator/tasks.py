from celery import shared_task
from celery_progress.backend import ProgressRecorder
from time import sleep
from pymongo import MongoClient
import uuid
import requests
import json
from pprint import pprint

@shared_task(bind=True)

def go_to_sleep(self,duration):
  progress_recorder = ProgressRecorder(self)
  client = MongoClient(host='34.227.105.4:27017',serverSelectionTimeoutMS = 3000)
  mydb = client["stargatedb"]
  aircol = mydb["airline"]
  doccount = aircol.count_documents({})

  # astra migrate
  headers = {
    "x-cassandra-token": "4204c48b-efa6-4ed1-8b70-a70a6e936620",
    "content-type": "application/json"
    }

  URL = "https://c72c60e1-d1c1-4730-8d6a-413abce921ff-us-east-1.apps.astra.datastax.com"
  COLLECTION = "dj_airline"
  NAMESPACE = "mongo_migrator"
  
  for i in range(doccount):
    sleep(duration)
    if i==0:
      for data in aircol.find().limit(1):
        last_id=data.pop('_id')
        AIRLINE_ID = str(uuid.uuid4())
        DOC_ROOT_PATH = f"/api/rest/v2/namespaces/{NAMESPACE}/collections/{COLLECTION}/{AIRLINE_ID}"
        PUTTURL = URL+DOC_ROOT_PATH
        response = requests.request("PUT", PUTTURL, data=json.dumps(data), headers=headers)
        pprint(response.text)
    else:
      for data in aircol.find({'_id': {'$gt': last_id}}).limit(1):
        last_id=data.pop('_id')
        AIRLINE_ID = str(uuid.uuid4())
        DOC_ROOT_PATH = f"/api/rest/v2/namespaces/{NAMESPACE}/collections/{COLLECTION}/{AIRLINE_ID}"
        PUTTURL = URL+DOC_ROOT_PATH
        response = requests.request("PUT", PUTTURL, data=json.dumps(data), headers=headers)
        pprint(response.text)
    progress_recorder.set_progress(i+1,doccount)

  return 'Done'

