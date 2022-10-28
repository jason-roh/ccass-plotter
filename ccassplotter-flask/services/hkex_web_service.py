from typing import Tuple
import requests
from bs4 import BeautifulSoup
from functools import wraps
from utils.wrappers import retry


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
    def parse_result(soup_obj) -> Tuple[str, dict]:
        results = {}
        stock_name = ""
        keys = ["Name", "Address", "Shareholding", "Percent"]

        try:
            table_records = soup_obj.findAll("div", {"class": "mobile-list-body"})
            stock_name_input = soup_obj.find("input", {"name": "txtStockName"})
            stock_name = stock_name_input.get('value')

            n = 5
            for i in range(0, len(table_records), n):
                participant_id = table_records[i].get_text()
                values = [field.get_text() for field in table_records[i+1:i+n]]
                holdings_dict = dict(zip(keys, values))
                results[participant_id] = holdings_dict

            for item in results.values():
                item['ShareholdingNumber'] = int(item['Shareholding'].replace(",", ""))
                item['PercentNumber'] = float(item['Percent'].replace("%", ""))
        except Exception as e:
            print("No holding data from HKEx - {}".format(e))
        finally:
            return stock_name if stock_name else '', results

    @retry
    def get_shareholding_data(self, current_date, stock_code, shareholding_date) -> dict:
        with requests.Session() as s:
            s.headers.update({"User-Agent": "Mozilla/5.0"})
            postdata = HkexWebService.create_post_data(current_date, stock_code, shareholding_date)
            resp = s.post(self.url, data=postdata)
            soup = BeautifulSoup(resp.text, 'lxml')
            stock_name, holdings = HkexWebService.parse_result(soup)
            return {
                "StockCode": stock_code,
                "AsOf": shareholding_date,
                "StockName": stock_name,
                "Holdings": holdings
            }
