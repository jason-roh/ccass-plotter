import requests
from bs4 import BeautifulSoup
from functools import wraps

def retry(func):
    @wraps(func)
    def wrapped(*args, **kwargs):
        num_of_retry = 3
        ex = None
        for _ in range(num_of_retry):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                ex = e
        raise ex
    return wrapped

class HkexWebService(object):
    def __init__(self):
        self.url = 'https://www.hkexnews.hk/sdw/search/searchsdw.aspx'

    @staticmethod
    def create_post_data(today, stock_code, shareholding_date) -> dict:
        return {
            "__EVENTARGUMENT": "",
            "__EVENTTARGET": "btnSearch",
            "__VIEWSTATE": "/wEPDwULLTIwNTMyMzMwMThkZLiCLeQCG/lBVJcNezUV/J0rsyMr",
            "__VIEWSTATEGENERATOR": "A7B2BBE2",
            "today": today,
            "txtShareholdingDate": shareholding_date,
            "txtStockCode": stock_code,
            "sortBy": "shareholding",
            "sortDirection": "desc"
        }

    @staticmethod
    def parse_result(soup_obj) -> (str, dict):
        results = {}
        keys = ["Name", "Address", "Shareholding", "Percent"]
        table_records = soup_obj.findAll("div", {"class": "mobile-list-body"})
        as_of_updated = soup_obj.find("input", {"class": "input-searchDate"})
        as_of = as_of_updated.get('value')

        n = 5
        for i in range(0, len(table_records), n):
            participant_id = table_records[i].get_text()
            values = [field.get_text() for field in table_records[i+1:i+n]]
            holdings_dict = dict(zip(keys, values))
            results[participant_id] = holdings_dict

        for item in results.values():
            item['ShareholdingNumber'] = int(item['Shareholding'].replace(",", ""))
            item['PercentNumber'] = float(item['Percent'].replace("%", ""))           

        return as_of, results

    @retry
    def get_shareholding_data(self, current_date, stock_code, shareholding_date) -> dict:
        with requests.Session() as s:
            s.headers.update({"User-Agent": "Mozilla/5.0"})
            postdata = HkexWebService.create_post_data(current_date, stock_code, shareholding_date)
            resp = s.post(self.url, data=postdata)
            soup = BeautifulSoup(resp.text, 'lxml')
            as_of, holdings = HkexWebService.parse_result(soup)
            return {
                "StockCode": stock_code,
                "AsOf": shareholding_date,
                "Holdings": holdings
            }
