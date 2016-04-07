# coding=UTF-8
import scrapy
from newspiders.items import FbPost
import json
import datetime


class FacebookSpider(scrapy.Spider):

	name = "facebook"

	def __init__(self, *args, **kwargs):
		super(FacebookSpider, self).__init__(*args, **kwargs)
		self.keywords = kwargs.get('keywords', '').split(",")
		self.uuid = kwargs.get('euuid', '')
		self.fb_pages = kwargs.get('fb_pages', '').split(",")
		self.fb_pages_names = kwargs.get('fb_pages_names', '').split(",")
		self.sources_names = dict(zip(self.fb_pages, self.fb_pages_names))
		
		self.facebook_app_id = kwargs.get('facebook_app_id', '')
		if not self.facebook_app_id: self.facebook_app_id = "1678193799072169"

		self.facebook_app_secret = kwargs.get('facebook_app_secret', '')
		if not self.facebook_app_secret: self.facebook_app_secret = "470e009214cf195e711d43c4fb5fe0da"

		for fb_page in self.fb_pages:
			self.start_urls.append("https://graph.facebook.com/v2.5/"+fb_page+"/feed?limit=100&access_token="+self.facebook_app_id+"|"+self.facebook_app_secret)


	def parse(self, response):
		response_body = json.loads(response.body)
		last_date = datetime.datetime.now().strftime("%Y-%m-%d")
		for post in response_body['data']:
			if "message" in post:
				last_date = datetime.datetime.strptime(post["created_time"].split("T")[0], "%Y-%m-%d")

				if any(keyword in post['message'].encode('utf-8') for keyword in self.keywords):
					fb_post = FbPost()
					fb_post["uuid"] = self.uuid
					ids = post["id"].split("_")
					fb_post["url"] = "http://facebook.com/"+ids[0]+"/posts/"+ids[1]
					fb_post["text"] = post["message"].encode('utf-8')
					fb_post["date"] = datetime.datetime.strptime(post["created_time"].split("+")[0], "%Y-%m-%dT%H:%M:%S").strftime('%Y-%m-%d')
					fb_post["source"] = self.sources_names[ids[0]]
					yield fb_post

		if((datetime.datetime.now() - last_date).days < 31):
			yield scrapy.Request(response_body["paging"]["next"], callback=self.parse)

