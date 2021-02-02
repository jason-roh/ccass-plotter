import React, { useState, useEffect } from 'react'
import { AppBar, makeStyles, Tab, Toolbar, Typography, Box, Tabs, IconButton } from '@material-ui/core';
import CloudIcon from '@material-ui/icons/Cloud';
import Checkbox from '@material-ui/core/Checkbox';
import HistoricalHoldings from './views/HistoricalHoldings';
import Transactions from './views/Transactions';
import { getAsyncHealthCheck } from './common/CcassPlotService';
import {
  BLUE_COLOR, WHITE_COLOR, GREY_COLOR, TAB_NAME_TRANSCATIONS, TAB_NAME_HISTORICAL_HOLDINGS
} from './common/Constants';

const tabStyles = makeStyles({
  default_tab: {
    minWidth: 150,
    width: 150,
    fontWeight: 500,
    backgroundColor: WHITE_COLOR,
    color: BLUE_COLOR
  },
  active_tab: {
    minWidth: 150,
    width: 150,
    fontWeight: 500,
    backgroundColor: BLUE_COLOR,
    color: WHITE_COLOR
  }
});

const tabNames = [
  { name: TAB_NAME_HISTORICAL_HOLDINGS },
  { name: TAB_NAME_TRANSCATIONS }
];

export default function CcassPlotter(props) {
  const classes = tabStyles();
  const [tabIndex, setTabIndex] = useState(0);
  const [isMulti, setIsMulti] = useState(true);
  const [cloudColor, setCloudColor] = useState(GREY_COLOR);
  const handleIsMultiChehcked = (event) => {
    setIsMulti(event.target.checked);
  };
  const handleTabChange = (event, newTab) => {
    setTabIndex(newTab);
  };

  const getTabStyle = (isActive) => {
    return isActive ? classes.active_tab : classes.default_tab
  };

  const renderBody = () => {
    switch (tabNames[tabIndex].name) {
      case TAB_NAME_HISTORICAL_HOLDINGS:
        return (<HistoricalHoldings isMulti={isMulti}></HistoricalHoldings>);
      case TAB_NAME_TRANSCATIONS:
        return (<Transactions isMulti={isMulti}></Transactions>)
      default:
        throw "Unknown tab name";
    }
  };

  const clickCheckButton = () => {
    getAsyncHealthCheck().then(result => {
      console.log(result);
      setCloudColor(BLUE_COLOR);
    }).catch(rejected => {
      console.log(rejected);
      setCloudColor(GREY_COLOR);
    });
  };

  useEffect(() => {
    clickCheckButton();
  }, []);

  return (
    <div>
      <AppBar position="static">
        <Toolbar variant="dense" style={{ background: WHITE_COLOR }}>
          <Box style={{ width: '100%' }}>
            <Typography
              variant="h6"
              style={{ float: 'left', marginRight: '8px', marginTop: '8px', fontWeight: 600, color: BLUE_COLOR }}>
              <Checkbox
                checked={isMulti}
                onChange={handleIsMultiChehcked}
                name="isMulti"
                color="primary"
                size="small"
              />
              <IconButton onClick={clickCheckButton}><CloudIcon style={{ fontSize: 'small', fill: cloudColor }}></CloudIcon></IconButton>CCASS PLOTTER
            </Typography>
            <Tabs TabIndicatorProps={{ style: { background: BLUE_COLOR } }} value={tabIndex} onChange={handleTabChange}>
              {tabNames.map((tab, i) => <Tab
                key={i}
                classes={{ root: getTabStyle(tabIndex === i) }}
                label={tab.name}
              />)}
            </Tabs>
          </Box>
        </Toolbar>
      </AppBar>
      {renderBody()}
    </div>
  );
};