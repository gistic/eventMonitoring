# coding=UTF-8
import scrapy
import urllib
from bs4 import BeautifulSoup
import feedparser
import datetime

from newspiders.items import Article

class GoogleNewsSpider(scrapy.Spider):

	name = "google_news"
	news_sources = {
		"ahram.org.eg": "الاهرام",
		"masrawy.com": "مصراوي",
		"bbc.com/arabic": "بي بي سي",
		"youm7.com": "اليوم السابع",
		"arabic.cnn.com": "سي إن إن",
		"akhbarelyom.com": "أخبار اليوم",
		"shorouknews.com": "الشروق",
		"alwafd.org": "الوفد",
		"huffpostarabi.com": "هافنجتون",
		"dostor.org": "الدستور",
		"gate.ahram.org.eg": "بوابة الآهرام",
		"almesryoon.com": "المصريون",
		"skynewsarabia.com": "سكاى نيوز عربية",
		"france24.com/ar": "فرانس ٢٤",
		"almasryalyoum.com": "المصري اليوم",
		"blarabi.net": "بالعربي",
		"egynews.net": "ايجي نيوز"
	}
	country_sources = {
		"ahram.org.eg": "eg",
		"masrawy.com": "eg",
		"bbc.com/arabic": "uk",
		"youm7.com": "eg",
		"arabic.cnn.com": "us",
		"akhbarelyom.com": "eg",
		"shorouknews.com": "eg",
		"alwafd.org": "eg",
		"huffpostarabi.com": "us",
		"dostor.org": "eg",
		"gate.ahram.org.eg": "eg",
		"almesryoon.com": "eg",
		"skynewsarabia.com": "uk",
		"france24.com/ar": "fr",
		"almasryalyoum.com": "eg",
		"blarabi.net": "eg",
		"egynews.net": "eg"
	}

	def __init__(self, *args, **kwargs):
		super(GoogleNewsSpider, self).__init__(*args, **kwargs)
		self.keywords = kwargs.get('keywords', '')
		self.uuid = kwargs.get('euuid', '')
		for news_source in GoogleNewsSpider.news_sources:
			self.start_urls.append("http://www.news.google.com/news?output=rss&q=site:"+news_source+"+"+self.keywords)		

	def parse(self, response):
		rss_feed = feedparser.parse(response.url)
		for entry in rss_feed.entries:
			
			desc = BeautifulSoup(entry.description)
			image = desc.find('img')

				
			article = Article()
			article["uuid"] = self.uuid
			article["country"] = GoogleNewsSpider.country_sources[response.url.split("site:")[-1].split("+")[0]]
			article["source"] = GoogleNewsSpider.news_sources[response.url.split("site:")[-1].split("+")[0]]
			article['url'] = entry.link.split("&url=")[-1].replace("%25","%")
			article['title'] = entry.title
			article['date'] = datetime.datetime.strptime(entry.published.split(",")[-1].strip(" "), "%d %b %Y %H:%M:%S GMT").strftime('%Y-%m-%d')

			if image is not None:

				if 'src' in image.attrs:
					article['image_url'] = image.attrs['src']
				elif 'imgsrc' in image.attrs:
					article['image_url'] = image.attrs['imgsrc']

			yield article



