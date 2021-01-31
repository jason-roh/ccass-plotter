import React, { useState } from 'react'
import { Container, TextField, Box, CircularProgress, IconButton } from '@material-ui/core';
import { DataGrid } from '@material-ui/data-grid';
import { formatDate, validateInput, createString } from "../common/Utils"
import Tooltip from '@material-ui/core/Tooltip'
import { KeyboardDatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import RefreshIcon from '@material-ui/icons/Refresh';
import { getAsyncFindTransactions } from '../common/CcassPlotService';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { transactionSampleData } from '../test/SampleData';


const useStyles = makeStyles({
    root: {
        '& .super-app.negative': {
            backgroundColor: '#5c6bc0',
            color: '#000000'
        },
        '& .super-app.positive': {
            backgroundColor: '#ef5350',
            color: '#000000'
        },
    },
});

const columns = [
    { field: 'id', headerName: 'ID', hide: true },
    { field: 'AsOf', headerName: 'As Of', width: 130 },
    { field: 'ParticipantId', headerName: 'Participant ID', width: 150 },
    { field: 'Name', headerName: 'Name', width: 450 },
    { field: 'Shareholding', headerName: 'Shareholding', width: 150, type: 'number' },
    { field: 'Percent', headerName: '%', width: 80, type: 'number' },
    { field: 'ShareholdingChange', headerName: 'Change', width: 130, type: 'number' },
    {
        field: 'ShareholdingChangeInPercent', type: 'number', headerName: 'Change %', width: 130,
        cellClassName: (params) =>
            clsx('super-app', {
                negative: params.value < 0,
                positive: params.value > 0,
            }),
    }
];

const columns2 = [
    { field: 'id', headerName: 'ID', hide: true },
    { field: 'AsOf', headerName: 'As Of', width: 130 },
    { field: 'ParticipantId', headerName: 'Participant ID', width: 150 },
    { field: 'Name', headerName: 'Name', width: 450 },
    {
        field: 'Side', headerName: 'Side', width: 150,
        cellClassName: (params) =>
            clsx('super-app', {
                negative: params.value === 'SELL',
                positive: params.value === 'BUY',
            }),
    },
];

export default function Transactions(props) {
    const classes = useStyles();
    const [isRequested, setIsRequested] = useState(false);
    const [stockCode, setStockCode] = useState('00005');
    const [startDate, setStartDate] = useState(new Date('2020/12/24'));
    const [endDate, setEndDate] = useState(new Date('2020/12/31'));
    const [threshold, setThreshold] = useState(1.0);
    const [allTransactionData, setAllTransactionData] = useState(transactionSampleData['HoldingChanges']);
    const [transactionData, setTransactionData] = useState(transactionSampleData['Transactions']);

    const handleStockCodeChange = (event) => {
        setStockCode(event.target.value);
        ClearData();
    };

    const handleStartDateChange = (date) => {
        setStartDate(date);
        ClearData();
    };

    const handleEndDateChange = (date) => {
        setEndDate(date);
        ClearData();
    };

    const handleThresholdChange = (event) => {
        setThreshold(event.target.value);
        ClearData();
    };

    const ClearData = () => {
        setTransactionData([]);
        setAllTransactionData([]);
    };

    const clickRefreshButton = () => {
        const errMsg = validateInput(stockCode, threshold);
        if (errMsg) {
            alert(errMsg);
            return;
        }

        setIsRequested(true);
        getAsyncFindTransactions(threshold, stockCode, formatDate(startDate), formatDate(endDate), props.isMulti).then(result => {
            if (result['Result'] === undefined) throw result;
            setTransactionData(result['Transactions']);
            setAllTransactionData(result['Result']);
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
                    <h1>Transaction Finder <IconButton onClick={clickRefreshButton}><RefreshIcon></RefreshIcon></IconButton>
                        {isRequested ? <CircularProgress></CircularProgress> : <p></p>}
                    </h1>
                </Box>
                <p>It identifies potential tranactions between two participants - Enter fields below and click Refresh to get data</p>
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
                    <Tooltip title={<span>The minimum % of the shares exchanged</span>}>
                        <TextField
                            id="threshold"
                            label="% Threshold"
                            style={{ width: 100 }}
                            value={threshold}
                            onChange={handleThresholdChange}>
                        </TextField>
                    </Tooltip>
                </Box>
                <Box mt={4}>
                    <b>Potential Transactions</b>
                    <br></br><br></br>
                    <div style={{ height: 400, width: '100%' }} className={classes.root}>
                        <DataGrid rows={transactionData} columns={columns2} pageSize={20} />
                    </div>
                </Box>
                <Box mt={4}>
                    <b>Participants who increase or decrease more than {threshold} % of the shares in a day</b>
                    <br></br><br></br>
                    <div style={{ height: 600, width: '100%' }} className={classes.root}>
                        <DataGrid rows={allTransactionData} columns={columns} pageSize={20} />
                    </div>
                </Box>
            </Container>
        </div>
    );
};