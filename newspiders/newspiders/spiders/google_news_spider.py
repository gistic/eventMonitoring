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
		"egynews.net": "ايجي نيوز",
		"aawsat.com": "الشرق الأوسط",
		"makkahnewspaper.com": "صحيفة مكة",
		"www.3seer.net": "صحيفة أخبار عسير",
		"www.al-jazirah.com": "جريدة الجزيرة",
		"www.al-madina.com": "صحيفة المدينة",
		"www.alarabiya.net": "العربية.نت",
		"www.albiladdaily.com": "صحيفة البلاد",
		"www.aleqt.com": "جريدة الاقتصادية",
		"www.alhayat.com": "جريدة الحياة",
		"www.alriyadh.com": "جريدة الرياض",
		"www.alsharq.net.sa": "صحيفة الشرق",
		"www.alwatan.com.sa": "الوطن أون لاين",
		"www.alyaum.com": "اليوم",
		"www.okaz.com.sa": "صحيفة عكاظ",
		"almdarnews.net": "صحيفة المدار الإخبارية",
		"sabq.org": "صحيفة سبق اﻹلكترونية",
		"www.al-jazirahonline.com/news": "الجزيرة أونلاين",
		"www.almowaten.net": "صحيفة المواطن الإلكترونية",
		"www.alweeam.com.sa": "صحيفة الوئام الالكترونية",
		"www.bab.com": "باب.كوم",
		"www.watny1.com": "صحيفة وطني الحبيب",
		"www.aljazeera.net/portal": "الجزيرة نت"
	}
	country_sources = {
		"ahram.org.eg": "eg",
		"masrawy.com": "eg",
		"bbc.com/arabic": "gb",
		"youm7.com": "eg",
		"arabic.cnn.com": "us",
		"akhbarelyom.com": "eg",
		"shorouknews.com": "eg",
		"alwafd.org": "eg",
		"huffpostarabi.com": "us",
		"dostor.org": "eg",
		"gate.ahram.org.eg": "eg",
		"almesryoon.com": "eg",
		"skynewsarabia.com": "gb",
		"france24.com/ar": "fr",
		"almasryalyoum.com": "eg",
		"blarabi.net": "eg",
		"egynews.net": "eg",
		"aawsat.com" : "sa",
		"makkahnewspaper.com" : "sa",
		"www.3seer.net" : "sa",
		"www.al-jazirah.com" : "sa",
		"www.al-madina.com" : "sa",
		"www.alarabiya.net" : "sa",
		"www.albiladdaily.com" : "sa",
		"www.aleqt.com" : "sa",
		"www.alhayat.com" : "sa",
		"www.alriyadh.com" : "sa",
		"www.alsharq.net.sa" : "sa",
		"www.alwatan.com.sa" : "sa",
		"www.alyaum.com" : "sa",
		"www.okaz.com.sa" : "sa",
		"almdarnews.net" : "sa",
		"sabq.org" : "sa",
		"www.al-jazirahonline.com/news" : "sa",
		"www.almowaten.net" : "sa",
		"www.alweeam.com.sa" : "sa",
		"www.bab.com" : "sa",
		"www.watny1.com" : "sa",
		"www.aljazeera.net/portal" : "qa"
	}

	def __init__(self, *args, **kwargs):
		super(GoogleNewsSpider, self).__init__(*args, **kwargs)
		self.keywords = kwargs.get('keywords', '')
		self.uuid = kwargs.get('euuid', '')
		for news_source in GoogleNewsSpider.news_sources:
			self.start_urls.append("http://www.news.google.com/news?output=rss&q=site:"+news_source+"+"+" OR ".join(self.keywords.split(",")))		

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
				else:
					article['image_url'] = "assets/images/article_default.jpg"

			yield article



