import unittest
from mock import patch, MagicMock
import json
import os

from services.ccass_plotter_service import CcassPlotterService
from services.ccass_plotter_service import ChartDataService

class TestCcassPlotterService(unittest.TestCase):
    def setUp(self):
        self.ccass_plotter_service = CcassPlotterService()
        this_folder = os.path.dirname(os.path.abspath(__file__))
        all_holders_data_file = os.path.join(this_folder, 'all_holders_data_result.json')
        top_holder_data_file = os.path.join(this_folder, 'top_holders_result.json')
        
        with open(all_holders_data_file) as json_file:
            self.all_holders_data = json.load(json_file)
        with open(top_holder_data_file) as json_file2:
            self.top_holders_data = json.load(json_file2)
        
        self.stock_code = '01128'
        self.start_date = '2021-01-20'
        self.end_date = '2021-01-31'
    
    @patch('services.holder_data_service.HolderDataSerivceMulti')
    def test_should_get_historical_holdings(self, mock_holder):
        number_of_holders = 10

        mock_holder.get_all_holders_data.return_value = self.all_holders_data
        mock_holder.get_top_holders.return_value = self.top_holders_data

        historical_holdings = self.ccass_plotter_service._create_top_holdings_data(
            mock_holder, number_of_holders, self.stock_code, self.start_date, self.end_date
        )
        chart_data = ChartDataService.create_chart_data(historical_holdings)

        assert historical_holdings['Holdings'][0]['Shareholding'] == 525443870
        assert chart_data['Min'] == 13915898
        assert chart_data['Max'] == 531603640
        assert chart_data['Data'][0]['data'][0]['y'] == 20652144

    @patch('services.holder_data_service.HolderDataSerivceMulti')
    def test_should_find_transactions(self, mock_holder):
        threshold = 1

        mock_holder.get_all_holders_data.return_value = self.all_holders_data
        mock_holder.get_top_holders.return_value = self.top_holders_data

        historical_holdings = self.ccass_plotter_service._create_top_holdings_data(
            mock_holder, 10, self.stock_code, self.start_date, self.end_date
        )
        holdings_with_change = CcassPlotterService.calculate_daily_changes(historical_holdings, threshold)
        holdings_with_transactions = CcassPlotterService.find_daily_transactions(holdings_with_change)

        assert holdings_with_transactions[0]['ParticipantId'] == 'A00003'
        assert holdings_with_transactions[0]['Side'] == 'BUY'
        assert holdings_with_transactions[1]['ParticipantId'] == 'C00074'
        assert holdings_with_transactions[1]['Side'] == 'SELL'


if __name__ == '__main__':
    unittest.main()
