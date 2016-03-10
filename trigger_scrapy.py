import redis
import requests
import json

r = redis.StrictRedis(host='localhost', port=6379, db=0)
for values in r.hvals("events:uuids"):
	values = json.loads(values)
	url = "http://localhost:6800/schedule.json?project=newspiders&spider=makkah_newspaper&euuid=%s&keywords=%s" % (values["uuid"],values["keywords"])
	requests.post(url)