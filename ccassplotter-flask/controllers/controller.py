from flask import Blueprint, request, jsonify
from services.ccass_plotter_service import CcassPlotterService
import json

from test.test_multithreading import WebRequestSingle, WebRequestMulti

bp = Blueprint('', __name__)


@bp.route('/')
def home() -> str:
    return "This is backend of CCASS Plotter"


@bp.route('/api/healthcheck')
def healthcheck() -> str:
    """
    Healthcheck endpoint
    :return: a dummy string
    """
    return json.dumps("success")


@bp.route('/api/testMulti')
def test_multi() -> str:
    return json.dumps(WebRequestMulti().run())



@bp.route("/api/getHistoricalHoldings")
def get_historical_holdings():
    stock_code = request.args['StockCode']
    start_date = request.args['StartDate']
    end_date = request.args['EndDate']
    number_of_holders = request.args['NumberOfHolders']
    multi = request.args['Multi'] in ['true', 'True']
    result = CcassPlotterService().get_historical_holdings(number_of_holders, stock_code, start_date, end_date, multi)
    return json.dumps(result)


@bp.route("/api/findTransactions")
def find_transactions():
    stock_code = request.args['StockCode']
    start_date = request.args['StartDate']
    end_date = request.args['EndDate']
    threshold = request.args['Threshold']
    multi = request.args['Multi'] in ['true', 'True']
    result = CcassPlotterService().find_transactions(threshold, stock_code, start_date, end_date, multi)
    return json.dumps(result)
