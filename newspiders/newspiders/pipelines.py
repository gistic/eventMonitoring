# -*- coding: utf-8 -*-

# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: http://doc.scrapy.org/en/latest/topics/item-pipeline.html

import requests
import json

class NewspidersPipeline(object):
	

	def process_item(self, item, spider):
		if spider.name in ['akhbarak', 'google_news']: 
			data={'source': item['source'], 'country': item['country'], 'uuid': item['uuid'], 'title': item['title'], 'url': item['url'], 'image_url': item['image_url'], 'date': item['date']}
			r = requests.post("http://localhost:8080/api/liveNews", data=json.dumps(data), headers = {'content-type': 'application/json'})
		return item


class FacebookPipeline(object):

	def process_item(self, item, spider):
		if spider.name in ['facebook']: 
			data={'source': item['source'], 'uuid': item['uuid'], 'text': item['text'], 'url': item['url'], 'date': item['date']}
			r = requests.post("http://localhost:8080/api/liveFacebook", data=json.dumps(data), headers = {'content-type': 'application/json'})
		return item
