import './App.css';
import React, { useState } from 'react'
import { Container, TextField, Box, CircularProgress, IconButton, MenuItem } from '@material-ui/core';
import { DataGrid } from '@material-ui/data-grid';
import Tooltip from '@material-ui/core/Tooltip'
import { KeyboardDatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import RefreshIcon from '@material-ui/icons/Refresh';
import { getAsyncHistoricalHoldings } from '../common/CcassPlotService';
import { formatDate, addDays, validateInput, createString } from "../common/Utils";
import { ResponsiveLine } from '@nivo/line'

let ChartData = [];
let GridData = [];

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
            if (result['Result'] === undefined) throw result;

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
            const message = (typeof rejected === 'object' && rejected !== null) ? createString(rejected) : rejected;
            alert(message);
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