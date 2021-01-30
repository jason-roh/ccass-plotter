from datetime import datetime

class ChartDataService():
    @staticmethod
    def create_chart_data(result) -> [dict]:
        chart_data = []
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
            chart_data.append(line_dict)

        return chart_data
