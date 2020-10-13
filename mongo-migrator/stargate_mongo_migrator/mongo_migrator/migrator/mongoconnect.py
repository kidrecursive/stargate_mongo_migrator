from pymongo import MongoClient

class MongoConnect:
  
  def count():
    client = MongoClient(host='34.227.105.4:27017',serverSelectionTimeoutMS = 3000)
    mydb = client["stargatedb"]
    aircol = mydb["airline"]
    doccount = aircol.count_documents({})
    return doccount