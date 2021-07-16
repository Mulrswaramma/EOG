import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { actions } from './reducer';
import { Provider, useQuery, defaultExchanges, subscriptionExchange, Client } from 'urql';
import LinearProgress from '@material-ui/core/LinearProgress';
import { IState } from '../../store';
import { FormControl, Input, InputLabel, MenuItem, Select } from '@material-ui/core';
import { SubscriptionClient } from 'subscriptions-transport-ws';

const subscriptionClient = new SubscriptionClient('ws://react.eogresources.com/graphql', { reconnect: true });

const client = new Client({
  url: 'https://react.eogresources.com/graphql',
  exchanges: [
    ...defaultExchanges,
    subscriptionExchange({
      forwardSubscription(operation) {
        return subscriptionClient.request(operation);
      },
    }),
  ],
});

const query = `
query {
  getMetrics
}
`;

const getMetricsList = (state: IState) => {
  const { metricsData } = state.measurements;
  return metricsData;
};

export default () => {
  return (
    <Provider value={client}>
      <Measurements />
    </Provider>
  );
};

const Measurements = () => {
  const dispatch = useDispatch();
  const metricsList = useSelector(getMetricsList);
  const [searchValue, setsearchValue] = useState([]);

  const [result] = useQuery({
    query,
  });
  const { fetching, data, error } = result;
  useEffect(() => {
    if (error) {
      dispatch(actions.getMetricsApiErrorReceived({ error: error.message }));
      return;
    }
    if (!data) return;
    const { getMetrics } = data;
    dispatch(actions.getMetricsReceived(getMetrics));
  }, [dispatch, data, error]);

  if (fetching) return <LinearProgress />;

  const handleChange = (event: any) => {
    dispatch(actions.saveMetricsSelected(event.target.value));
    setsearchValue(event.target.value);
  };

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;

  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  return (
    <FormControl>
      <InputLabel id="input-label">Choose Measurement</InputLabel>
      <Select
        labelId="demo-mutiple-name-label"
        id="demo-mutiple-name"
        multiple
        value={searchValue}
        style={{ width: '500px', float: 'right' }}
        onChange={handleChange}
        input={<Input />}
        MenuProps={MenuProps}
      >
        {(metricsList || []).map(name => (
          <MenuItem key={name} value={name}>
            {name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
