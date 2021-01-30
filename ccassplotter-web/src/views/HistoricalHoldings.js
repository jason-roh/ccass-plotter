import './App.css';
import React, { useState } from 'react'
import { Container, TextField, Box, CircularProgress, IconButton, MenuItem } from '@material-ui/core';
import { DataGrid } from '@material-ui/data-grid';
import Tooltip from '@material-ui/core/Tooltip'
import { KeyboardDatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import RefreshIcon from '@material-ui/icons/Refresh';
import { getAsyncHistoricalHoldings } from '../common/CcassPlotService';
import { formatDate, addDays, validateInput } from "../common/Utils";
import { ResponsiveLine } from '@nivo/line'

let ChartData = [];
let GridData = [];

let sampleData = {
    "Result": {
        "TopHoldersAsOf": "2020/12/31",
        "StockCode": "01128",
        "Holders": [
            {
                "Id": "C00100",
                "Name": "JPMORGAN CHASE BANK, NATIONAL"
            },
            {
                "Id": "C00019",
                "Name": "THE HONGKONG AND SHANGHAI BANKING"
            },
            {
                "Id": "C00010",
                "Name": "CITIBANK N.A."
            },
            {
                "Id": "C00039",
                "Name": "STANDARD CHARTERED BANK (HONG KONG) LTD"
            },
            {
                "Id": "B01130",
                "Name": "BOCI SECURITIES LTD"
            },
            {
                "Id": "A00003",
                "Name": "CHINA SECURITIES DEPOSITORY AND CLEARING"
            },
            {
                "Id": "C00074",
                "Name": "DEUTSCHE BANK AG"
            },
            {
                "Id": "C00033",
                "Name": "BANK OF CHINA (HONG KONG) LTD"
            },
            {
                "Id": "B01451",
                "Name": "GOLDMAN SACHS (ASIA) SECURITIES LTD"
            },
            {
                "Id": "B01161",
                "Name": "UBS SECURITIES HONG KONG LTD"
            }
        ],
        "Holdings": [
            {
                "id": 1,
                "AsOf": "2020/12/24",
                "ParticipantId": "C00100",
                "Name": "JPMORGAN CHASE BANK, NATIONAL",
                "Shareholding": 525495528,
                "Percent": 10.11
            },
            {
                "id": 2,
                "AsOf": "2020/12/24",
                "ParticipantId": "C00019",
                "Name": "THE HONGKONG AND SHANGHAI BANKING",
                "Shareholding": 453028943,
                "Percent": 8.71
            },
            {
                "id": 3,
                "AsOf": "2020/12/24",
                "ParticipantId": "C00010",
                "Name": "CITIBANK N.A.",
                "Shareholding": 107026096,
                "Percent": 2.05
            },
            {
                "id": 4,
                "AsOf": "2020/12/24",
                "ParticipantId": "C00039",
                "Name": "STANDARD CHARTERED BANK (HONG KONG) LTD",
                "Shareholding": 44200990,
                "Percent": 0.85
            },
            {
                "id": 5,
                "AsOf": "2020/12/24",
                "ParticipantId": "B01130",
                "Name": "BOCI SECURITIES LTD",
                "Shareholding": 31314483,
                "Percent": 0.6
            },
            {
                "id": 6,
                "AsOf": "2020/12/24",
                "ParticipantId": "A00003",
                "Name": "CHINA SECURITIES DEPOSITORY AND CLEARING",
                "Shareholding": 28626800,
                "Percent": 0.55
            },
            {
                "id": 7,
                "AsOf": "2020/12/24",
                "ParticipantId": "C00074",
                "Name": "DEUTSCHE BANK AG",
                "Shareholding": 26241519,
                "Percent": 0.5
            },
            {
                "id": 8,
                "AsOf": "2020/12/24",
                "ParticipantId": "C00033",
                "Name": "BANK OF CHINA (HONG KONG) LTD",
                "Shareholding": 24379890,
                "Percent": 0.46
            },
            {
                "id": 9,
                "AsOf": "2020/12/24",
                "ParticipantId": "B01451",
                "Name": "GOLDMAN SACHS (ASIA) SECURITIES LTD",
                "Shareholding": 17204568,
                "Percent": 0.33
            },
            {
                "id": 10,
                "AsOf": "2020/12/24",
                "ParticipantId": "B01161",
                "Name": "UBS SECURITIES HONG KONG LTD",
                "Shareholding": 16258378,
                "Percent": 0.31
            },
            {
                "id": 11,
                "AsOf": "2020/12/28",
                "ParticipantId": "C00100",
                "Name": "JPMORGAN CHASE BANK, NATIONAL",
                "Shareholding": 524233292,
                "Percent": 10.08
            },
            {
                "id": 12,
                "AsOf": "2020/12/28",
                "ParticipantId": "C00019",
                "Name": "THE HONGKONG AND SHANGHAI BANKING",
                "Shareholding": 453139579,
                "Percent": 8.71
            },
            {
                "id": 13,
                "AsOf": "2020/12/28",
                "ParticipantId": "C00010",
                "Name": "CITIBANK N.A.",
                "Shareholding": 107581965,
                "Percent": 2.07
            },
            {
                "id": 14,
                "AsOf": "2020/12/28",
                "ParticipantId": "C00039",
                "Name": "STANDARD CHARTERED BANK (HONG KONG) LTD",
                "Shareholding": 44248190,
                "Percent": 0.85
            },
            {
                "id": 15,
                "AsOf": "2020/12/28",
                "ParticipantId": "B01130",
                "Name": "BOCI SECURITIES LTD",
                "Shareholding": 31393683,
                "Percent": 0.6
            },
            {
                "id": 16,
                "AsOf": "2020/12/28",
                "ParticipantId": "A00003",
                "Name": "CHINA SECURITIES DEPOSITORY AND CLEARING",
                "Shareholding": 28625600,
                "Percent": 0.55
            },
            {
                "id": 17,
                "AsOf": "2020/12/28",
                "ParticipantId": "C00074",
                "Name": "DEUTSCHE BANK AG",
                "Shareholding": 26453166,
                "Percent": 0.5
            },
            {
                "id": 18,
                "AsOf": "2020/12/28",
                "ParticipantId": "C00033",
                "Name": "BANK OF CHINA (HONG KONG) LTD",
                "Shareholding": 24485090,
                "Percent": 0.47
            },
            {
                "id": 19,
                "AsOf": "2020/12/28",
                "ParticipantId": "B01451",
                "Name": "GOLDMAN SACHS (ASIA) SECURITIES LTD",
                "Shareholding": 17208668,
                "Percent": 0.33
            },
            {
                "id": 20,
                "AsOf": "2020/12/28",
                "ParticipantId": "B01161",
                "Name": "UBS SECURITIES HONG KONG LTD",
                "Shareholding": 16436443,
                "Percent": 0.31
            },
            {
                "id": 21,
                "AsOf": "2020/12/29",
                "ParticipantId": "C00100",
                "Name": "JPMORGAN CHASE BANK, NATIONAL",
                "Shareholding": 524238008,
                "Percent": 10.08
            },
            {
                "id": 22,
                "AsOf": "2020/12/29",
                "ParticipantId": "C00019",
                "Name": "THE HONGKONG AND SHANGHAI BANKING",
                "Shareholding": 452710279,
                "Percent": 8.71
            },
            {
                "id": 23,
                "AsOf": "2020/12/29",
                "ParticipantId": "C00010",
                "Name": "CITIBANK N.A.",
                "Shareholding": 108619126,
                "Percent": 2.08
            },
            {
                "id": 24,
                "AsOf": "2020/12/29",
                "ParticipantId": "C00039",
                "Name": "STANDARD CHARTERED BANK (HONG KONG) LTD",
                "Shareholding": 44242014,
                "Percent": 0.85
            },
            {
                "id": 25,
                "AsOf": "2020/12/29",
                "ParticipantId": "B01130",
                "Name": "BOCI SECURITIES LTD",
                "Shareholding": 31273683,
                "Percent": 0.6
            },
            {
                "id": 26,
                "AsOf": "2020/12/29",
                "ParticipantId": "A00003",
                "Name": "CHINA SECURITIES DEPOSITORY AND CLEARING",
                "Shareholding": 28486400,
                "Percent": 0.54
            },
            {
                "id": 27,
                "AsOf": "2020/12/29",
                "ParticipantId": "C00074",
                "Name": "DEUTSCHE BANK AG",
                "Shareholding": 26875936,
                "Percent": 0.51
            },
            {
                "id": 28,
                "AsOf": "2020/12/29",
                "ParticipantId": "C00033",
                "Name": "BANK OF CHINA (HONG KONG) LTD",
                "Shareholding": 24535890,
                "Percent": 0.47
            },
            {
                "id": 29,
                "AsOf": "2020/12/29",
                "ParticipantId": "B01451",
                "Name": "GOLDMAN SACHS (ASIA) SECURITIES LTD",
                "Shareholding": 16810968,
                "Percent": 0.32
            },
            {
                "id": 30,
                "AsOf": "2020/12/29",
                "ParticipantId": "B01161",
                "Name": "UBS SECURITIES HONG KONG LTD",
                "Shareholding": 16689043,
                "Percent": 0.32
            },
            {
                "id": 31,
                "AsOf": "2020/12/30",
                "ParticipantId": "C00100",
                "Name": "JPMORGAN CHASE BANK, NATIONAL",
                "Shareholding": 524708301,
                "Percent": 10.09
            },
            {
                "id": 32,
                "AsOf": "2020/12/30",
                "ParticipantId": "C00019",
                "Name": "THE HONGKONG AND SHANGHAI BANKING",
                "Shareholding": 451815533,
                "Percent": 8.69
            },
            {
                "id": 33,
                "AsOf": "2020/12/30",
                "ParticipantId": "C00010",
                "Name": "CITIBANK N.A.",
                "Shareholding": 107734456,
                "Percent": 2.07
            },
            {
                "id": 34,
                "AsOf": "2020/12/30",
                "ParticipantId": "C00039",
                "Name": "STANDARD CHARTERED BANK (HONG KONG) LTD",
                "Shareholding": 44238914,
                "Percent": 0.85
            },
            {
                "id": 35,
                "AsOf": "2020/12/30",
                "ParticipantId": "B01130",
                "Name": "BOCI SECURITIES LTD",
                "Shareholding": 31771283,
                "Percent": 0.61
            },
            {
                "id": 36,
                "AsOf": "2020/12/30",
                "ParticipantId": "A00003",
                "Name": "CHINA SECURITIES DEPOSITORY AND CLEARING",
                "Shareholding": 28470800,
                "Percent": 0.54
            },
            {
                "id": 37,
                "AsOf": "2020/12/30",
                "ParticipantId": "C00074",
                "Name": "DEUTSCHE BANK AG",
                "Shareholding": 26843336,
                "Percent": 0.51
            },
            {
                "id": 38,
                "AsOf": "2020/12/30",
                "ParticipantId": "C00033",
                "Name": "BANK OF CHINA (HONG KONG) LTD",
                "Shareholding": 24605890,
                "Percent": 0.47
            },
            {
                "id": 39,
                "AsOf": "2020/12/30",
                "ParticipantId": "B01451",
                "Name": "GOLDMAN SACHS (ASIA) SECURITIES LTD",
                "Shareholding": 17247067,
                "Percent": 0.33
            },
            {
                "id": 40,
                "AsOf": "2020/12/30",
                "ParticipantId": "B01161",
                "Name": "UBS SECURITIES HONG KONG LTD",
                "Shareholding": 15721426,
                "Percent": 0.3
            },
            {
                "id": 41,
                "AsOf": "2020/12/31",
                "ParticipantId": "C00100",
                "Name": "JPMORGAN CHASE BANK, NATIONAL",
                "Shareholding": 524708301,
                "Percent": 10.09
            },
            {
                "id": 42,
                "AsOf": "2020/12/31",
                "ParticipantId": "C00019",
                "Name": "THE HONGKONG AND SHANGHAI BANKING",
                "Shareholding": 451815533,
                "Percent": 8.69
            },
            {
                "id": 43,
                "AsOf": "2020/12/31",
                "ParticipantId": "C00010",
                "Name": "CITIBANK N.A.",
                "Shareholding": 107734456,
                "Percent": 2.07
            },
            {
                "id": 44,
                "AsOf": "2020/12/31",
                "ParticipantId": "C00039",
                "Name": "STANDARD CHARTERED BANK (HONG KONG) LTD",
                "Shareholding": 44238914,
                "Percent": 0.85
            },
            {
                "id": 45,
                "AsOf": "2020/12/31",
                "ParticipantId": "B01130",
                "Name": "BOCI SECURITIES LTD",
                "Shareholding": 31771283,
                "Percent": 0.61
            },
            {
                "id": 46,
                "AsOf": "2020/12/31",
                "ParticipantId": "A00003",
                "Name": "CHINA SECURITIES DEPOSITORY AND CLEARING",
                "Shareholding": 28470800,
                "Percent": 0.54
            },
            {
                "id": 47,
                "AsOf": "2020/12/31",
                "ParticipantId": "C00074",
                "Name": "DEUTSCHE BANK AG",
                "Shareholding": 26843336,
                "Percent": 0.51
            },
            {
                "id": 48,
                "AsOf": "2020/12/31",
                "ParticipantId": "C00033",
                "Name": "BANK OF CHINA (HONG KONG) LTD",
                "Shareholding": 24605890,
                "Percent": 0.47
            },
            {
                "id": 49,
                "AsOf": "2020/12/31",
                "ParticipantId": "B01451",
                "Name": "GOLDMAN SACHS (ASIA) SECURITIES LTD",
                "Shareholding": 17247067,
                "Percent": 0.33
            },
            {
                "id": 50,
                "AsOf": "2020/12/31",
                "ParticipantId": "B01161",
                "Name": "UBS SECURITIES HONG KONG LTD",
                "Shareholding": 15721426,
                "Percent": 0.3
            }
        ]
    },
    "Chart": [
        {
            "id": "UBS SECURITIES HONG KONG LTD",
            "data": [
                {
                    "x": "Dec 24",
                    "y": 16258378
                },
                {
                    "x": "Dec 28",
                    "y": 16436443
                },
                {
                    "x": "Dec 29",
                    "y": 16689043
                },
                {
                    "x": "Dec 30",
                    "y": 15721426
                },
                {
                    "x": "Dec 31",
                    "y": 15721426
                }
            ]
        },
        {
            "id": "GOLDMAN SACHS (ASIA) SECURITIES LTD",
            "data": [
                {
                    "x": "Dec 24",
                    "y": 17204568
                },
                {
                    "x": "Dec 28",
                    "y": 17208668
                },
                {
                    "x": "Dec 29",
                    "y": 16810968
                },
                {
                    "x": "Dec 30",
                    "y": 17247067
                },
                {
                    "x": "Dec 31",
                    "y": 17247067
                }
            ]
        },
        {
            "id": "BANK OF CHINA (HONG KONG) LTD",
            "data": [
                {
                    "x": "Dec 24",
                    "y": 24379890
                },
                {
                    "x": "Dec 28",
                    "y": 24485090
                },
                {
                    "x": "Dec 29",
                    "y": 24535890
                },
                {
                    "x": "Dec 30",
                    "y": 24605890
                },
                {
                    "x": "Dec 31",
                    "y": 24605890
                }
            ]
        },
        {
            "id": "DEUTSCHE BANK AG",
            "data": [
                {
                    "x": "Dec 24",
                    "y": 26241519
                },
                {
                    "x": "Dec 28",
                    "y": 26453166
                },
                {
                    "x": "Dec 29",
                    "y": 26875936
                },
                {
                    "x": "Dec 30",
                    "y": 26843336
                },
                {
                    "x": "Dec 31",
                    "y": 26843336
                }
            ]
        },
        {
            "id": "CHINA SECURITIES DEPOSITORY AND CLEARING",
            "data": [
                {
                    "x": "Dec 24",
                    "y": 28626800
                },
                {
                    "x": "Dec 28",
                    "y": 28625600
                },
                {
                    "x": "Dec 29",
                    "y": 28486400
                },
                {
                    "x": "Dec 30",
                    "y": 28470800
                },
                {
                    "x": "Dec 31",
                    "y": 28470800
                }
            ]
        },
        {
            "id": "BOCI SECURITIES LTD",
            "data": [
                {
                    "x": "Dec 24",
                    "y": 31314483
                },
                {
                    "x": "Dec 28",
                    "y": 31393683
                },
                {
                    "x": "Dec 29",
                    "y": 31273683
                },
                {
                    "x": "Dec 30",
                    "y": 31771283
                },
                {
                    "x": "Dec 31",
                    "y": 31771283
                }
            ]
        },
        {
            "id": "STANDARD CHARTERED BANK (HONG KONG) LTD",
            "data": [
                {
                    "x": "Dec 24",
                    "y": 44200990
                },
                {
                    "x": "Dec 28",
                    "y": 44248190
                },
                {
                    "x": "Dec 29",
                    "y": 44242014
                },
                {
                    "x": "Dec 30",
                    "y": 44238914
                },
                {
                    "x": "Dec 31",
                    "y": 44238914
                }
            ]
        },
        {
            "id": "CITIBANK N.A.",
            "data": [
                {
                    "x": "Dec 24",
                    "y": 107026096
                },
                {
                    "x": "Dec 28",
                    "y": 107581965
                },
                {
                    "x": "Dec 29",
                    "y": 108619126
                },
                {
                    "x": "Dec 30",
                    "y": 107734456
                },
                {
                    "x": "Dec 31",
                    "y": 107734456
                }
            ]
        },
        {
            "id": "THE HONGKONG AND SHANGHAI BANKING",
            "data": [
                {
                    "x": "Dec 24",
                    "y": 453028943
                },
                {
                    "x": "Dec 28",
                    "y": 453139579
                },
                {
                    "x": "Dec 29",
                    "y": 452710279
                },
                {
                    "x": "Dec 30",
                    "y": 451815533
                },
                {
                    "x": "Dec 31",
                    "y": 451815533
                }
            ]
        },
        {
            "id": "JPMORGAN CHASE BANK, NATIONAL",
            "data": [
                {
                    "x": "Dec 24",
                    "y": 525495528
                },
                {
                    "x": "Dec 28",
                    "y": 524233292
                },
                {
                    "x": "Dec 29",
                    "y": 524238008
                },
                {
                    "x": "Dec 30",
                    "y": 524708301
                },
                {
                    "x": "Dec 31",
                    "y": 524708301
                }
            ]
        }
    ]
};

const columns = [
    { field: 'id', headerName: 'ID', hide: true },
    { field: 'AsOf', headerName: 'As Of', width: 130 },
    { field: 'ParticipantId', headerName: 'Participant ID', width: 150 },
    { field: 'Name', headerName: 'Name', width: 550 },
    { field: 'Shareholding', headerName: 'Shareholding', width: 150, type: 'number' },
    { field: 'Percent', headerName: '%', width: 80, type: 'number' }
];

export default function HistoricalHoldings(props) {
    const today = new Date();
    const yesterday = addDays(today, -1);
    const oneWeekAgo = addDays(today, -5);
    const [stockCode, setStockCode] = useState('');
    const [startDate, setStartDate] = useState(oneWeekAgo);
    const [endDate, setEndDate] = useState(yesterday);
    const [isRequested, setIsRequested] = useState(false);
    const [topHoldersAsOf, setTopHoldersAsOf] = useState('');
    const [topHoldingsData, setTopHoldingsData] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [numberOfHolders, setNumberOfHolders] = useState(10);
    const [holderSelected, setHolderSelected] = useState('All');
    const [holdersData, setHoldersData] = useState([]);

    const handleStockCodeChange = (event) => {
        setStockCode(event.target.value);
        ClearData();
    };

    const handleNumberOfHolders = (event) => {
        setNumberOfHolders(event.target.value);
        ClearData();
    };

    const handleHolderSelected = (event) => {
        const selectedHolder = event.target.value;
        setHolderSelected(selectedHolder);
        if (selectedHolder === 'All') {
            setChartData(ChartData);
            setTopHoldingsData(GridData);
        } else {
            setChartData(ChartData.filter(d => d['id'] === selectedHolder));
            setTopHoldingsData(GridData.filter(d => d['Name'] === selectedHolder));
        }
    };

    const handleStartDateChange = (date) => {
        setStartDate(date);
        ClearData();
    };

    const handleEndDateChange = (date) => {
        setEndDate(date);
        ClearData();
    };

    const ClearData = () => {
        setTopHoldersAsOf('');
        setTopHoldingsData([]);
        setChartData([]);
        setHolderSelected('All');
        ChartData = [];
        GridData = [];
    };

    const clickRefreshButton = () => {
        const errMsg = validateInput(stockCode, numberOfHolders);
        if (errMsg) {
            alert(errMsg);
            return;
        }

        setIsRequested(true);
        getAsyncHistoricalHoldings(numberOfHolders, stockCode, formatDate(startDate), formatDate(endDate), props.isMulti).then(result => {
            GridData = result['Result']['Holdings'];
            ChartData = result['Chart'];
            setTopHoldersAsOf(result['Result']['TopHoldersAsOf']);
            setTopHoldingsData(GridData);
            setChartData(ChartData);
            setHoldersData(result['Result']['Holders']);
            setIsRequested(false);
        }).catch(rejected => {
            setIsRequested(false);
            console.log(rejected);
        });
    }

    return (
        <div className="App-main">
            <Container>
                <Box mt={3}>
                    <h1>Trend Plot <IconButton onClick={clickRefreshButton}><RefreshIcon></RefreshIcon></IconButton>
                        {isRequested ? <CircularProgress></CircularProgress> : <p></p>}
                    </h1>
                </Box>
                <p>It plots the "Shareholding" of the top participants as of the end date - Enter fields below and click Refresh to get data</p>
                <Box style={{ display: 'flex' }} mt={4}>
                    <Box mt={2.38}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                                disableToolbar
                                variant="inline"
                                format="yyyy-MM-dd"
                                id="start-date"
                                lable="Start Date"
                                value={startDate}
                                onChange={handleStartDateChange}
                                KeyboardButtonProps={{
                                    'aria-label': 'change date'
                                }}
                                size='small'
                                style={{ width: 150 }}
                            />
                            <KeyboardDatePicker
                                disableToolbar
                                variant="inline"
                                format="yyyy-MM-dd"
                                id="end-date"
                                lable="End Date"
                                value={endDate}
                                onChange={handleEndDateChange}
                                KeyboardButtonProps={{
                                    'aria-label': 'change date'
                                }}
                                size='small'
                                style={{ width: 150 }}
                            />
                        </MuiPickersUtilsProvider>
                    </Box>
                    <Tooltip title={<span>HKEX Stock Codes - ex. 00001, 00002 etc</span>}>
                        <TextField
                            id="stockCode"
                            label="Stock Code"
                            style={{ width: 100 }}
                            value={stockCode}
                            onChange={handleStockCodeChange}>
                        </TextField>
                    </Tooltip>
                    <Tooltip title={<span>Number Of Top Holders</span>}>
                        <TextField
                            id="topHolders"
                            label="Top Holders"
                            style={{ width: 100 }}
                            value={numberOfHolders}
                            onChange={handleNumberOfHolders}>
                        </TextField>
                    </Tooltip>
                </Box>
                <Box mt={6}>
                    <b>Top {numberOfHolders} Participants As Of - {topHoldersAsOf}</b>
                </Box>
                <Tooltip title={<span>Select Holder To Update Chart</span>}>
                    <TextField
                        id="holder"
                        label="Holder"
                        style={{ width: 300 }}
                        value={holderSelected}
                        onChange={handleHolderSelected} select>
                        <MenuItem key="All" value="All">All</MenuItem>
                        {holdersData.map(k => <MenuItem key={k['Name']} value={k['Name']}>{k['Name']}</MenuItem>)}
                    </TextField>
                </Tooltip>
                <Box style={{ height: 500 }}>
                    <ResponsiveLine
                        data={chartData}
                        colors={{ 'scheme': 'category10' }}
                        margin={{ top: 20, right: 40, bottom: 50, left: 110 }}
                        xScale={{ type: 'point' }}
                        yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
                        yFormat=" >-,.0f"
                        theme={{
                            grid: {
                                line: {
                                    stroke: "grey",
                                    strokeWidth: 0.3,
                                    strokeDasharray: "2 2"
                                }
                            },
                            tooltip: {
                                container: {
                                    fontSize: '10px'
                                  },
                              }
                        }}
                        enableSlices='x'
                        animate={true}
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                            orient: 'bottom',
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: 'as of',
                            legendOffset: 36,
                            legendPosition: 'middle'
                        }}
                        axisLeft={{
                            orient: 'left',
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: 'shares',
                            legendOffset: -100,
                            legendPosition: 'middle',
                            format: ',.0f'
                        }}
                        pointSize={3}
                        pointColor={{ theme: 'background' }}
                        pointBorderWidth={2}
                        pointBorderColor={{ from: 'serieColor' }}
                        pointLabelYOffset={-12}
                        useMesh={true}
                        legends={[
                            {
                                anchor: 'top-right',
                                direction: 'column',
                                justify: false,
                                translateX: 0,
                                translateY: 0,
                                itemsSpacing: 0,
                                itemDirection: 'right-to-left',
                                itemWidth: 50,
                                itemHeight: 18,
                                itemOpacity: 0.4,
                                symbolSize: 10,
                                symbolShape: 'square',
                                symbolBorderColor: 'rgba(0, 0, 0, .5)',
                                effects: [
                                    {
                                        on: 'hover',
                                        style: {
                                            itemBackground: 'rgba(0, 0, 0, .03)',
                                            itemOpacity: 1
                                        }
                                    }
                                ]
                            }
                        ]}
                    />
                </Box>
                <br></br><br></br>
                <div style={{ height: 600, width: '100%' }}>
                    <DataGrid rows={topHoldingsData} columns={columns} pageSize={20} />
                </div>
            </Container>
        </div>
    );
};