import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Provider, useQuery, useSubscription, Client, defaultExchanges, subscriptionExchange } from 'urql';
import LinearProgress from '@material-ui/core/LinearProgress';
import { IState } from '../../store';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
query($metricName: [MeasurementQuery]) {
    getMultipleMeasurements(input: $metricName) {
        metric
        measurements {
        metric
        value
        unit
        at
        }
    }
}
`;

const dataSubscription = `
subscription {
  newMeasurement {
    metric
    at
    value
    unit
  }
} 
`;

const getSelectedMetrics = (state: IState) => {
  const { selectedMetrics } = state.measurements;
  return selectedMetrics;
};

export default () => {
  return (
    <Provider value={client}>
      <MetricsMeasurements />
    </Provider>
  );
};

const MetricsMeasurements = () => {
  const dispatch = useDispatch();
  const metricSelected = useSelector(getSelectedMetrics);
  const [measureMentDetails, setMeasurementDetails] = useState([]);
  const [lastknownMeasurement, setLastKnownMeasurement] = useState({});

  const [result] = useQuery({
    query,
    variables: {
      metricName: metricSelected.map(x => {
        return {
          metricName: x,
        };
      }),
    },
  });
  const [subscriptionResult] = useSubscription({
    query: dataSubscription,
  });
  const { data: { newMeasurement } = {} } = subscriptionResult;
  const { fetching, data, error } = result;
  useEffect(() => {
    if (error) {
      return;
    }
    if (!data) return;
    const { getMultipleMeasurements } = data;
    setMeasurementDetails(getMultipleMeasurements);
  }, [dispatch, data, error]);

  useEffect(() => {
    if (newMeasurement) {
      setLastKnownMeasurement({
        ...lastknownMeasurement,
        [newMeasurement.metric]: newMeasurement.value,
      });
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMeasurement]);

  if (fetching) return <LinearProgress />;

  const convertData = (data: any) => {
    let arr: any = [];
    for (let i = 0; i < data.length; i++) {
      // loop throgh measurements
      for (let j = 0; j < data[i].measurements.length; j++) {
        if (j <= 20) {
          let obj: any = { metric: data[i].metric };
          let commodity = data[i].measurements[j];
          obj['value'] = commodity.value;
          obj['at'] = commodity.at;
          obj['strokeColor'] = '#ff84d' + i;
          arr.push(obj);
        }
      }
    }
    return arr;
  };

  const convertedData = convertData(measureMentDetails);

  return (
    <React.Fragment>
      {lastknownMeasurement &&
        metricSelected.map((metricName: any) => {
          if (Object.keys(lastknownMeasurement).indexOf(metricName) !== -1) {
            return (
              <React.Fragment key={metricName}>
                <div>{metricName}</div>
                <div>{lastknownMeasurement[metricName]}</div>;
              </React.Fragment>
            );
          }
          return null;
        })}
      {!fetching && convertedData && Object.keys(convertedData).length && (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            width={500}
            height={300}
            data={convertedData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <XAxis dataKey="at" />
            <YAxis dataKey="value" />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={'at'} stroke={'red'} />
            <Line type="monotone" dataKey={'value'} stroke="red" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </React.Fragment>
  );
};
