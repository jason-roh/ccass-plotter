from datetime import datetime
from services.holder_data_service import HolderDataSerivceSingle, HolderDataSerivceMulti
from services.chart_data_service import ChartDataService

class CcassPlotterService(object):
    def __init__(self):
        pass

    @staticmethod
    def get_holding(participant_id, holdings_dict) -> dict:
        holding = holdings_dict.get(participant_id)

        # If data is not found, this probably means the participant does not have holdings
        return {
            "Shareholding": holding['ShareholdingNumber'] if holding else 0,
            "Percent": holding['PercentNumber'] if holding else 0.0,
        }

    @staticmethod
    def filter_and_create_grid_data(all_holders_data, top_holders) -> [dict]:
        holding_data = []
        row_id = 1

        for holders_data in all_holders_data:
            as_of = holders_data['AsOf']

            for holder in top_holders['Holders']:
                holding = CcassPlotterService.get_holding(holder['Id'], holders_data['Holdings'])
                as_of_holding = {
                    "id": row_id,
                    "AsOf": as_of,
                    "ParticipantId": holder['Id'],
                    "Name": holder['Name'],
                    "Shareholding": holding['Shareholding'],
                    "Percent": holding['Percent']
                }
                holding_data.append(as_of_holding)
                row_id = row_id + 1
        return holding_data

    @staticmethod
    def calculate_daily_changes(historical_holdings, threshold):
        for holder in historical_holdings['Holders']:
            holdings = [
                holding for holding in historical_holdings['Holdings'] if holding['ParticipantId'] == holder['Id']
            ]

            holdings = sorted(holdings, key=lambda x: x['AsOf'])
            for i in range(1, len(holdings)):
                shareholding_prev = holdings[i-1]['Shareholding']
                if not shareholding_prev:
                    continue

                shareholding = holdings[i]['Shareholding']
                change = shareholding - shareholding_prev
                change_in_percent = 100 * (shareholding - shareholding_prev) / shareholding_prev
                holdings[i]['ShareholdingChange'] = change
                holdings[i]['ShareholdingChangeInPercent'] = change_in_percent
                holdings[i]['Side'] = 'BUY' if change_in_percent > 0 else 'SELL'
        
        holdings_with_change = [
            holding for holding in historical_holdings['Holdings']
            if 'ShareholdingChange' in holding and abs(holding['ShareholdingChangeInPercent']) > float(threshold)
        ]
        return sorted(holdings_with_change, key=lambda x: (x['AsOf'], -x['ShareholdingChangeInPercent']))

    @staticmethod
    def find_daily_transactions(holdings_with_change):
        holdings_with_transactions = []
        as_of_dates = sorted({holding['AsOf'] for holding in holdings_with_change})
        
        # Find any transactions each day
        for as_of in as_of_dates:
            # Get holding changes data each day
            holdings_per_as_of = [holding for holding in holdings_with_change if holding['AsOf'] == as_of]
            
            # If given a day we have both of BUY and SELL directions, we assume they are potential transactions
            if all(x in {d['Side'] for d in holdings_per_as_of} for x in ['BUY', 'SELL']):
                holdings_with_transactions.extend(holdings_per_as_of)
        return holdings_with_transactions

    def _create_top_holdings_data(self, holder_service, number_of_holders, stock_code, start_date, end_date) -> dict:
        """
        Find historical holdings data of top holders as of End Date
        :param number_of_holders: Number of holders
        :param stock_code: Stock Ric Code
        :param start_date: Start Date of the holding period
        :param end_date: End Date of the holding period
        :return: list of historical holdings data
        """

        # 1. Iterate over the date ranges to find shareholdings
        all_holders_data = holder_service.get_all_holders_data(stock_code, start_date, end_date)
        all_holders_data = sorted(all_holders_data, key=lambda x: x['AsOf'])

        # 2. find the top holders of a stock code as of end date
        top_holders = holder_service.get_top_holders(int(number_of_holders), stock_code, end_date)
        if not top_holders['Holders']:
            # If we can't find the list of top holders - it is critical error
            raise RuntimeError(
                'Unable to find Top Holders for {} - please check HKEx Website or adjust End Date {}'.format(stock_code, end_date)
            )

        # 3. Filtering out with top holders and create Grid data
        top_holders['Holdings'] = CcassPlotterService.filter_and_create_grid_data(all_holders_data, top_holders)

        return top_holders
    
    def get_historical_holdings(self, number_of_holders, stock_code, start_date, end_date, multi) -> dict:
        holder_service = HolderDataSerivceMulti() if multi else HolderDataSerivceSingle()
        historical_holdings = self._create_top_holdings_data(holder_service, number_of_holders, stock_code, start_date, end_date)
        chart_data = ChartDataService.create_chart_data(historical_holdings)
        return {
            "Result": historical_holdings,
            "Chart": chart_data
        }

    def find_transactions(self, threshold, stock_code, start_date, end_date, multi) -> dict:
        '''
        Find any potential transactions each day among top 10 holders
        It assumes that holding data given a day is EOD data

        :param threshold: Threshold of shareholding % changes of a holder position 
        :param stock_code: Stock Ric Code
        :param start_date: Start Date of the holding period
        :param end_date: End Date of the holding period
        :param multi: Flag for multi threading or single threading
        :return: dictionary of historical holdings change and transactions data
        '''
        holder_service = HolderDataSerivceMulti() if multi else HolderDataSerivceSingle()
        historical_holdings = self._create_top_holdings_data(holder_service, 10, stock_code, start_date, end_date)
        holdings_with_change = CcassPlotterService.calculate_daily_changes(historical_holdings, threshold)
        holdings_with_transactions = CcassPlotterService.find_daily_transactions(holdings_with_change)
               
        return {
            "StockCode": stock_code,
            "StartDate": start_date,
            "EndDate": end_date,
            "Threshold": threshold,
            "StockName": historical_holdings['StockName'],
            "HoldingChanges": holdings_with_change,
            "Transactions": holdings_with_transactions
        }
