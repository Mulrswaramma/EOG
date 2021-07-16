import { createSlice, PayloadAction } from 'redux-starter-kit';

export type ApiErrorAction = {
  error: string;
};

const initialState = {
  metricsData: [''],
  selectedMetrics: [''],
};

const slice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    getMetricsReceived: (state, action: PayloadAction<[string]>) => {
      state.metricsData = action.payload;
    },
    getMetricsApiErrorReceived: (state, action: PayloadAction<ApiErrorAction>) => state,
    saveMetricsSelected: (state, action: PayloadAction<[string]>) => {
      state.selectedMetrics = action.payload;
    },
  },
});

export const reducer = slice.reducer;
export const actions = slice.actions;
