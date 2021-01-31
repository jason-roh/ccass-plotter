import './App.css';
import React, { useState } from 'react'
import { Container, TextField, Box, CircularProgress, IconButton, MenuItem } from '@material-ui/core';
import { DataGrid } from '@material-ui/data-grid';
import Tooltip from '@material-ui/core/Tooltip'
import { KeyboardDatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import RefreshIcon from '@material-ui/icons/Refresh';
import { ResponsiveLine } from '@nivo/line'
import NumberFormat from "react-number-format";
import { getAsyncHistoricalHoldings } from '../common/CcassPlotService';
import { formatDate, validateInput, createString } from "../common/Utils";
import { sampleHoldingData } from "../test/SampleData";

/**
 * Initial Sample Data
 */
let ChartData = sampleHoldingData['Chart'];
let minValue = sampleHoldingData['Chart']['Min'];
let maxValue = sampleHoldingData['Chart']['Max'];
let holdersList = sampleHoldingData['Result']['Holders'];
let TopHoldingsData = sampleHoldingData['Result']['Holdings'];

const findMinMax = (positions) => {
    const buffer = 100000;
    var merged = [].concat.apply([], positions).map(x => x['y']);
    const max = Math.max(...merged);
    const min = Math.min(...merged);
    return {
        "Max": max + buffer,
        "Min": Math.max(0, min - buffer)
    }
}

function NumberFormatCustom(props) {
    const { inputRef, onChange, ...other } = props;

    return (
        <NumberFormat
            {...other}
            getInputRef={inputRef}
            onValueChange={values => {
                onChange({
                    target: {
                        name: props.name,
                        value: values.value
                    }
                });
            }}
            thousandSeparator
        />
    );
}

const columns = [
    { field: 'id', headerName: 'ID', hide: true },
    { field: 'AsOf', headerName: 'As Of', width: 130 },
    { field: 'ParticipantId', headerName: 'Participant ID', width: 150 },
    { field: 'Name', headerName: 'Name', width: 450 },
    { field: 'Shareholding', headerName: 'Shareholding', width: 150, type: 'number' },
    { field: 'Percent', headerName: '%', width: 80, type: 'number' }
];

export default function HistoricalHoldings(props) {
    const [stockCode, setStockCode] = useState('01128');
    const [startDate, setStartDate] = useState(new Date('2020/12/24'));
    const [endDate, setEndDate] = useState(new Date('2020/12/31'));
    const [isRequested, setIsRequested] = useState(false);
    const [topHoldersAsOf, setTopHoldersAsOf] = useState('2020/12/31');
    const [topHoldingsData, setTopHoldingsData] = useState(TopHoldingsData);
    const [numberOfHolders, setNumberOfHolders] = useState(10);
    const [holderSelected, setHolderSelected] = useState('All');
    const [chartData, setChartData] = useState(ChartData);
    const [min, setMin] = useState(minValue);
    const [max, setMax] = useState(maxValue);
    const [scale, setScale] = useState('log');
    const [holdersData, setHoldersData] = useState(holdersList);

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
            setMin(ChartData['Min']);
            setMax(ChartData['Max']);
            setScale('log');
            setTopHoldingsData(TopHoldingsData);
        } else {
            const selectedData = ChartData['Data'].filter(d => d['id'] === selectedHolder);
            const result = findMinMax(selectedData[0]['data']);
            setChartData({ "Data": selectedData });
            setMin(result['Min']);
            setMax(result['Max']);
            setScale('linear');
            setTopHoldingsData(TopHoldingsData.filter(d => d['Name'] === selectedHolder));
        }
    };

    const handleMinChange = (event) => {
        setMin(parseInt(event.target.value));
    };

    const handleMaxChange = (event) => {
        setMax(parseInt(event.target.value));
    };

    const handleScaleChange = (event) => {
        setScale(event.target.value);
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
        setChartData({ 'Data': [] });
        setHolderSelected('All');
        setHoldersData([]);
        setMin(0);
        setMax(0);
        ChartData = {};
        TopHoldingsData = [];
    };

    const clickRefreshButton = () => {
        const errMsg = validateInput(stockCode, numberOfHolders);
        if (errMsg) {
            alert(errMsg);
            return;
        }

        setIsRequested(true);
        getAsyncHistoricalHoldings(numberOfHolders, stockCode, formatDate(startDate), formatDate(endDate), props.isMulti).then(result => {
            if (result['Result'] === undefined) throw result;

            TopHoldingsData = result['Result']['Holdings'];
            ChartData = result['Chart'];

            setTopHoldersAsOf(result['Result']['TopHoldersAsOf']);
            setHoldersData(result['Result']['Holders']);
            setTopHoldingsData(TopHoldingsData);
            setChartData(ChartData);
            setMin(ChartData['Min']);
            setMax(ChartData['Max']);
            setIsRequested(false);
        }).catch(rejected => {
            setIsRequested(false);
            console.log(rejected);
            const message = (typeof rejected === 'object' && rejected !== null) ? createString(rejected) : rejected;
            alert(message);
        });
    }

    return (
        <Container>
            <br></br><br></br>
            <Box>
                <h1>Trend Plot <IconButton onClick={clickRefreshButton}><RefreshIcon></RefreshIcon></IconButton>
                    {isRequested ? <CircularProgress></CircularProgress> : <p></p>}
                </h1>
            </Box>
            <p>It plots the "Shareholding" of the top participants as of the end date - Enter fields below and click Refresh to get data</p>
            <Box style={{ display: 'flex' }} mt={4} mb={8}>
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
            <div className="App-main">
                <Box mt={4} mb={4}>
                    <b>Top {numberOfHolders} Participants As Of - {topHoldersAsOf}</b>
                </Box>
                <Box>
                    <p style={{fontSize: '12px'}}>*Modify Holder, Min, Max and Scale to adjust charts</p>
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
                    <Tooltip title={<span>Minimum value of Y Axis</span>}>
                        <TextField
                            id="min"
                            label="Min"
                            style={{ width: 150 }}
                            value={min}
                            onChange={handleMinChange}
                            InputProps={{
                                inputComponent: NumberFormatCustom
                            }}
                        >
                        </TextField>
                    </Tooltip>
                    <Tooltip title={<span>Maximum value of Y Axis</span>}>
                        <TextField
                            id="max"
                            label="Max"
                            style={{ width: 150 }}
                            value={max}
                            onChange={handleMaxChange}
                            InputProps={{
                                inputComponent: NumberFormatCustom
                            }}
                        >
                        </TextField>
                    </Tooltip>
                    <Tooltip title={<span>Scale of Y Axis</span>}>
                        <TextField
                            id="scale"
                            label="Scale"
                            style={{ width: 100 }}
                            value={scale}
                            onChange={handleScaleChange} select>
                            <MenuItem key="linear" value="linear">Linear</MenuItem>
                            <MenuItem key="log" value="log">Log</MenuItem>
                        </TextField>
                    </Tooltip>
                </Box>
                <Box style={{ height: 500 }}>
                    <ResponsiveLine
                        data={chartData['Data']}
                        colors={{ 'scheme': 'category10' }}
                        margin={{ top: 50, right: 40, bottom: 50, left: 110 }}
                        xScale={{ type: 'point' }}
                        yScale={{ type: scale, min: min, max: max, stacked: false, reverse: false }}
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
                        pointSize={5}
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
            </div>
            <Box mt={8} mb={10}>
                <b>Shareholding Data</b>
                <br></br><br></br>
                <div style={{ height: 600, width: '100%', margin: 0 }}>
                    <DataGrid density="compact" rows={topHoldingsData} columns={columns} autoPageSize={true} />
                </div>
            </Box>
        </Container >
    );
};