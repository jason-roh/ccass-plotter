from datetime import datetime, date
import itertools
from abc import ABC, abstractmethod
from concurrent.futures import ThreadPoolExecutor, as_completed
from utils.datetime_utils import daterange
from services.hkex_web_service import HkexWebService


class HolderDataService(ABC):
    def __init__(self):
        self.web_service = HkexWebService()
        self.current_date = date.today().strftime("%Y%m%d")
        self.holders_data = []
    
    @abstractmethod
    def get_all_holders_data(self, stock_code, start_date, end_date) -> [dict]:
        pass 

    @staticmethod
    def get_date_range(start_date, end_date):
        start_date = start_date.replace('-', '')
        end_date = end_date.replace('-', '')
        start = datetime.strptime(start_date, '%Y%m%d')
        end = datetime.strptime(end_date, '%Y%m%d')
        return daterange(start, end)

    def get_top_holders(self, number_of_holders, stock_code, shareholding_date) -> dict:
        shareholding_data = self.web_service.get_shareholding_data(
            self.current_date, stock_code, shareholding_date)

        # We queried HKEx holders data in descending order by shareholding
        top_holdings = dict(itertools.islice(
            shareholding_data['Holdings'].items(), int(number_of_holders)))
        top_holders = [{"Id": k, "Name": v["Name"], "Key": v["Name"] + "_" + k} for k, v in top_holdings.items()]

        return {
            "TopHoldersAsOf": shareholding_data['AsOf'],
            "StockCode": shareholding_data['StockCode'],
            "StockName": shareholding_data['StockName'],
            "Holders": top_holders
        }


class HolderDataSerivceSingle(HolderDataService):
    def __init__(self):
        super(HolderDataSerivceSingle, self).__init__()

    def get_all_holders_data(self, stock_code, start_date, end_date) -> [dict]:
        for single_date in HolderDataService.get_date_range(start_date, end_date):
            shareholding_date = single_date.strftime("%Y/%m/%d")
            self.holders_data.append(
                self.web_service.get_shareholding_data(self.current_date, stock_code, shareholding_date)
            )
            print("Processed holder data on {}".format(shareholding_date))
        
        return self.holders_data


class HolderDataSerivceMulti(HolderDataService):
    def __init__(self):
        super(HolderDataSerivceMulti, self).__init__()

    def _process_holders_data(self, stock_code, single_date):
        try:
            shareholding_date = single_date.strftime("%Y/%m/%d")
            self.holders_data.append(
                self.web_service.get_shareholding_data(self.current_date, stock_code, shareholding_date)
            )
            return "Processed holder data on {}".format(shareholding_date)
        except Exception as e:
            return e

    def get_all_holders_data(self, stock_code, start_date, end_date) -> [dict]:
        threads = []

        with ThreadPoolExecutor(max_workers=20) as executor:
            for single_date in HolderDataService.get_date_range(start_date, end_date):
                threads.append(executor.submit(self._process_holders_data, stock_code, single_date))

            for task in as_completed(threads):
                print(task.result()) 
                
            return self.holders_data
