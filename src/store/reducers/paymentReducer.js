import { PAYMENT_ACTIONS } from '../actions/paymentActions';
import actionTypes from '../actions/actionTypes';

const initialState = {
  orders: [],
  subscriptions: [],
  currentOrder: null,
  currentPayment: null,
  paymentStatus: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0
};

const paymentReducer = (state = initialState, action) => {
  switch (action.type) {
    case PAYMENT_ACTIONS.SET_ORDERS:
      return {
        ...state,
        orders: action.payload.orders,
        total: action.payload.total,
        page: action.payload.page,
        limit: action.payload.limit,
        totalPages: action.payload.totalPages
      };

    case PAYMENT_ACTIONS.SET_SUBSCRIPTIONS:
      return {
        ...state,
        subscriptions: action.payload
      };

    case PAYMENT_ACTIONS.SET_CURRENT_ORDER:
      return {
        ...state,
        currentOrder: action.payload
      };

    case PAYMENT_ACTIONS.SET_CURRENT_PAYMENT:
      return {
        ...state,
        currentPayment: action.payload
      };

    case PAYMENT_ACTIONS.SET_PAYMENT_STATUS:
      return {
        ...state,
        paymentStatus: action.payload
      };

    case PAYMENT_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case PAYMENT_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload
      };

    case PAYMENT_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case actionTypes.PROCESS_LOGOUT:
      return initialState;

    default:
      return state;
  }
};

export default paymentReducer;
