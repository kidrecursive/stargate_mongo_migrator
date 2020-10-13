from django.shortcuts import render
from django.http import HttpResponse
from mongo_migrator.migrator.mongoconnect import MongoConnect
from mongo_migrator.migrator.datamigrate import migrator
from mongo_migrator.migrator.authenticator import auth
from .tasks import go_to_sleep


def index(request):
    count = MongoConnect.count()
    return render(request, 'astra/home.html',{"count" : count})

def status(request):
    token = auth.authenticate()
    task = go_to_sleep.delay(.25)
    return render(request, 'astra/status.html',{"task_id" : task.task_id,"token":token})




