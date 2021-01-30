from services.hkex_web_service import HkexWebService
from datetime import datetime, date
from utils.datetime_utils import daterange
import itertools

class HolderDataSerivce():
    def __init__(self):
        self.web_service = HkexWebService()
        self.current_date = date.today().strftime("%Y%m%d")

    def get_all_holders_data(self, stock_code, start_date, end_date) -> [dict]:
        holders_data = []

        start_date = start_date.replace('-', '')
        end_date = end_date.replace('-', '')
        start = datetime.strptime(start_date, '%Y%m%d')
        end = datetime.strptime(end_date, '%Y%m%d')

        for single_date in daterange(start, end):
            shareholding_date = single_date.strftime("%Y/%m/%d")
            print("Requsting holder data on {}".format(shareholding_date))
            holders_data.append(
                self.web_service.get_shareholding_data(self.current_date, stock_code, shareholding_date)
            )
        
        return holders_data

    def get_top_holders(self, number_of_holders, stock_code, shareholding_date) -> dict:
        shareholding_data = self.web_service.get_shareholding_data(
            self.current_date, stock_code, shareholding_date)

        # We queried HKEx holders data in descending order by shareholding
        top_holdings = dict(itertools.islice(
            shareholding_data['Holdings'].items(), int(number_of_holders)))
        top_holders = [{"Id": k, "Name": v["Name"]} for k, v in top_holdings.items()]

        return {
            "TopHoldersAsOf": shareholding_data['AsOf'],
            "StockCode": shareholding_data['StockCode'],
            "Holders": top_holders
        }
