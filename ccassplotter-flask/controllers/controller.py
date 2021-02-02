from flask import Blueprint, request, jsonify, render_template
import json
from services.ccass_plotter_service import CcassPlotterService
from utils.api_exceptions import ServiceUnavailable
from utils.wrappers import throw_api_error

bp = Blueprint('', __name__)


@bp.app_errorhandler(ServiceUnavailable)
def handle_service_unavailable(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response


@bp.route('/')
def home():
    return render_template('index.html')


@bp.route('/api/healthcheck')
def healthcheck() -> str:
    return json.dumps("success")


@bp.route("/api/getHistoricalHoldings")
@throw_api_error
def get_historical_holdings():
    stock_code = request.args['StockCode']
    start_date = request.args['StartDate']
    end_date = request.args['EndDate']
    number_of_holders = request.args['NumberOfHolders']
    multi = request.args['IsMulti'] in ['true', 'True']
    result = CcassPlotterService().get_historical_holdings(number_of_holders, stock_code, start_date, end_date, multi)
    return json.dumps(result)


@bp.route("/api/findTransactions")
@throw_api_error
def find_transactions():
    stock_code = request.args['StockCode']
    start_date = request.args['StartDate']
    end_date = request.args['EndDate']
    threshold = request.args['Threshold']
    multi = request.args['IsMulti'] in ['true', 'True']
    result = CcassPlotterService().find_transactions(threshold, stock_code, start_date, end_date, multi)
    return json.dumps(result)
