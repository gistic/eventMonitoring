# coding=UTF-8
import scrapy
import datetime
import json

from newspiders.items import Article



class AkhbarakSpider(scrapy.Spider):

	name = "akhbarak";
	# allowed_domains = ["akhbarak.net"]

	news_sources = {
		"algomhuria.net.eg": "الجمهورية",
		"almessa.net.eg": "المساء",
		"rosaelyoussef.com": "روز اليوسف"
	}


	def __init__(self, *args, **kwargs):
		super(AkhbarakSpider, self).__init__(*args, **kwargs)
		self.keywords = kwargs.get('keywords', '')
		self.uuid = kwargs.get('euuid', '')
		for keyword in self.keywords.split(","):
			self.start_urls.append("http://www.akhbarak.net/search?filter[search_in]=1&search_input="+keyword)


	def parse(self, response):
		for article in response.xpath('//article'):
			# title = rev.xpath('div/a[@class="a-size-base a-link-normal review-title a-color-base a-text-bold"]/text()').extract()[0];
			img = article.xpath('div[@class="media-object"]/a/img/@data-original').extract()[0]
			link = response.urljoin(article.xpath('div[@class="media-body clearfix"]/h4[@class="media-heading"]/a/@href').extract()[0])
			title = article.xpath('div[@class="media-body clearfix"]/h4[@class="media-heading"]/a/text()').extract()[0]
			source = article.xpath('div[@class="media-object"]/div[@class="media-tools clearfix"]/div[@class="links"]/a[1]/text()').extract()
			if len(source) == 0:
				source = article.xpath('div[@class="media-body clearfix"]/div[@class="media-tools clearfix"]/div[@class="links"]/a[1]/text()').extract()
			source_str = source[0]
			raw_date = article.xpath('div[@class="media-body clearfix"]/div[@class="time"]/span[@class="time-elapsed"]/@title').extract()
			if len(raw_date) == 0:
				raw_date = article.xpath('div[@class="media-body clearfix"]/div[@class="mb"]/span[@class="time-elapsed"]/@title').extract()
			raw_date_str = raw_date[0]
			# parsed_date = parse(raw_date).astimezone(timezone("UTC")).strftime('%d %b %Y %H:%M')
			parsed_date = self.parse_raw_date(raw_date_str)
			request = scrapy.Request(link, callback=self.parse_actual_source)
			request.meta["source"] = source_str
			request.meta["date"] = parsed_date
			request.meta["image_url"] = img
			request.meta["title"] = title
			request.meta['uuid'] = self.uuid
			yield request;

		nextPageURL = response.xpath('//a[@class="next_page"]/@href');
		if nextPageURL:
			nextPageURL = response.urljoin(nextPageURL.extract()[0])
			print "Next page url %s" %(nextPageURL)
			request = scrapy.Request(nextPageURL, callback = self.parse)
			yield request
	

	def parse_raw_date(self, date_str):
		raw_date = date_str[:date_str.find("+")]
		raw_offset = date_str[date_str.find("+"):]
		date = datetime.datetime.strptime(raw_date, '%Y-%m-%dT%H:%M:%S')
		offset_sign = raw_offset[0]
		if offset_sign == "+":
			delta = datetime.timedelta(hours = -int(raw_offset[1:3]), minutes = -int(raw_offset[4:6]))
		else:
			delta = datetime.timedelta(hours = int(raw_offset[1:3]), minutes = int(raw_offset[4:6]))
		date = date + delta
		return date.strftime('%Y-%m-%d')


	def parse_actual_source(self, response):
		allowed_to_save = False
		url = response.xpath("//iframe[@id='iframe']/@src").extract()[0]
		for news_source in AkhbarakSpider.news_sources:
			if news_source in url:
				allowed_to_save = True
				break


		if allowed_to_save:
			article = Article()
			article["uuid"] = response.meta["uuid"]
			article["country"] = "eg"
			article["source"] = response.meta["source"]
			article['url'] = url
			article['title'] = response.meta["title"]
			article['image_url'] = response.meta["image_url"]
			article['date'] = response.meta["date"]

			yield article

