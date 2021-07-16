import { reducer as weatherReducer } from '../Features/Weather/reducer';
import { reducer as measurementReducer } from '../Features/Measurements/reducer';

export default {
  weather: weatherReducer,
  measurements: measurementReducer,
};
