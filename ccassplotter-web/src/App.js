import React, { useState } from 'react'
import { AppBar, makeStyles, Tab, Toolbar, Typography, Box, Tabs } from '@material-ui/core';
import HistoricalHoldings from './views/HistoricalHoldings';
import Transactions from './views/Transactions';
import { BLUE_COLOR, WHITE_COLOR, TAB_NAME_TRANSCATIONS, TAB_NAME_HISTORICAL_HOLDINGS } from './common/Constants';

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

  const handleTabChange = (event, newTab) => {
    setTabIndex(newTab);
  };

  const getTabStyle = (isActive) => {
    return isActive ? classes.active_tab : classes.default_tab
  };

  const renderBody = () => {
    switch (tabNames[tabIndex].name) {
      case TAB_NAME_HISTORICAL_HOLDINGS:
        return (<HistoricalHoldings></HistoricalHoldings>);
      case TAB_NAME_TRANSCATIONS:
        return (<Transactions></Transactions>)
      default:
        throw "Unknown tab name";
    }
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar variant="dense" style={{ background: WHITE_COLOR }}>
          <Box style={{ width: '100%' }}>
            <Typography variant="h6" style={{ float: 'left', margin: '8px', fontWeight: 600, color: BLUE_COLOR }}>
              CCASS PLOTTER
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