from datetime import datetime

class ChartDataService():
    @staticmethod
    def _find_min_max(result) -> tuple:
        buffer = 100000
        all_positions = [x['Shareholding'] for x in result['Holdings']]
        return max(min(all_positions) - buffer, 0), max(all_positions) + buffer

    @staticmethod
    def _create_line_data(result) -> [dict]:
        line_data = []
        top_holders = [holder['Name'] for holder in result['Holders']]

        for holder in reversed(top_holders):
            holdings_per_holder = [
                holding for holding in result['Holdings']
                if holding['Name'] == holder
            ]

            line_dict = {
                'id': holder,
                'data': [
                    {
                        'x': datetime.strptime(holding['AsOf'], '%Y/%m/%d').strftime('%m/%d'),
                        'y': holding['Shareholding']
                    } 
                    for holding in holdings_per_holder
                ]   
            }
            line_data.append(line_dict)
        return line_data

    @staticmethod
    def create_chart_data(result) -> dict:
        min_value, max_value = ChartDataService._find_min_max(result)
        data = ChartDataService._create_line_data(result)

        return {
            "Min": min_value,
            "Max": max_value,
            "Data": data
        }