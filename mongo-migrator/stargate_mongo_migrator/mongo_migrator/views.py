from django.shortcuts import render
from django.http import HttpResponse
from mongo_migrator.migrator.mongoconnect import MongoConnect
from mongo_migrator.migrator.datamigrate import migrator
from mongo_migrator.migrator.authenticator import auth
from .tasks import go_to_sleep

def index(request):
    if 'q' in request.POST:
        try:
            dblist = MongoConnect.dblist()
            return render(request, 'astra/home.html',{"dblist":dblist})
        except:
            return render(request, 'astra/home.html')
    elif request.GET.get('dbname'):
         dbname = request.GET.get('dbname')
         dbcol = MongoConnect.dbcollist(dbname)
         return render(request, 'astra/home.html',{"dbcol":dbcol,"dbname":dbname})
    elif request.GET:
        colname = request.GET.get('colname')
        dbn = request.GET.get('dbn')
        print(colname[0])
        count = MongoConnect.count(dbn,colname)
        result = str(count)+" documents identified for migration."
        return render(request, 'astra/home.html',{"result" : result})
    else:
        return render(request, 'astra/home.html')

def status(request):
    token = auth.authenticate()
    task = go_to_sleep.delay(.25)
    count = MongoConnect.count("stargatedb","airline")
    return render(request, 'astra/status.html',{"task_id" : task.task_id,"token":token,"count":count})




