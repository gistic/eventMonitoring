# coding=UTF-8
import scrapy
import urllib
from bs4 import BeautifulSoup

from newspiders.items import Article

class MakkahSpider(scrapy.Spider):

	name = "makkah_newspaper"
	MONTHS_AR = {
		u"يناير": "01",
		u"فبراير": "02",
		u"مارس": "03",
		u"ابريل": "04",
		u"مايو": "05",
		u"يونيو": "06",
		u"يونيه": "06",
		u"يوليو": "07",
		u"يوليه": "07",
		u"اغسطس": "08",
		u"سبتمبر": "09",
		u"اكتوبر": "10",
		u"نوفمبر": "11",
		u"ديسمبر": "12"
	}

	def __init__(self, *args, **kwargs):
		super(MakkahSpider, self).__init__(*args, **kwargs)
		self.keywords = kwargs.get('keywords', '')
		self.uuid = kwargs.get('euuid', '')
		self.start_urls = [
			"http://makkahnewspaper.com/search/"+self.keywords
		]

	def start_requests(self):
		for url in self.start_urls:
			for page in xrange(1, 10):
				yield scrapy.Request(url +"/"+str(page), callback=self.parse, meta={'uuid': self.uuid})

	def parse(self,response):
		for url in response.xpath("//*[contains(@class,'searchItemTitle')]//a/@href"):
			url = url.extract().split("/")
			article_url = '/'.join(url[0:-2])
			article_url += "/"+urllib.quote_plus(url[-1].encode('UTF-8'))
			yield scrapy.Request(article_url, callback=self.parse_article, meta={'uuid': response.meta['uuid']})
	
	def parse_article(self, response):

		article = Article()
		article['uuid'] = response.meta['uuid']
		article['url'] = response.url
		article['title'] = ''.join(response.xpath("//*[contains(@class,'articles-details')]/div[2]/text()").extract()).encode('utf-8')
		article['image_url'] = ''.join(response.xpath("//*[contains(@class,'article-img-block')]//img/@src").extract())
		if "makkahnewspaper.com" not in article['image_url']:
			article['image_url'] = "http://makkahnewspaper.com/"+article['image_url']
		# article['text'] = ''.join(response.xpath("//*[contains(@class,'col-md-9 col-sm-8 col-xs-12')]//p").extract()).encode('utf-8')
		article['date'] = ''.join(response.xpath("//*[contains(@class,'articleBlock')]/*[contains(@class,'date')]/text()").extract()).split("-")[1]#.encode('utf-8')
		
		#### Normalizing the date by converting from arabic and unifying the format
		date_splited = article['date'].strip(" ").replace(u"أ",u"ا").replace(u"إ",u"ا").split(" ")
		# print date_splited[1].encode('utf-8')
		# print MakkahSpider.MONTHS_AR.keys()
		# print "======"
		date_splited[1] = MakkahSpider.MONTHS_AR[date_splited[1]]
		article['date'] = "-".join([date_splited[2], date_splited[1], date_splited[0]])


		yield article



