import redis
import requests
import json

r = redis.StrictRedis(host='localhost', port=6379, db=0)
for uuid in r.smembers("events:uuids"):
	for url_param in r.smembers("events:scrapy_params:"+uuid):
		url = "http://localhost:6800/schedule.json?"+url_param
		requests.post(url)