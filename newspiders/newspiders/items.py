# -*- coding: utf-8 -*-

# Define here the models for your scraped items
#
# See documentation in:
# http://doc.scrapy.org/en/latest/topics/items.html

import scrapy

class Article(scrapy.Item):
	uuid = scrapy.Field()
	url = scrapy.Field()
	title = scrapy.Field()
	text = scrapy.Field()
	date = scrapy.Field()
	image_url = scrapy.Field()
	fb_score = scrapy.Field()
	source = scrapy.Field()
	country = scrapy.Field()

