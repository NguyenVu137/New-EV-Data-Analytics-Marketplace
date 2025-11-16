import axios from '../../axios';

export const PAYMENT_ACTIONS = {
  SET_ORDERS: 'SET_ORDERS',
  SET_SUBSCRIPTIONS: 'SET_SUBSCRIPTIONS',
  SET_CURRENT_ORDER: 'SET_CURRENT_ORDER',
  SET_CURRENT_PAYMENT: 'SET_CURRENT_PAYMENT',
  SET_PAYMENT_STATUS: 'SET_PAYMENT_STATUS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

/**
 * Tạo đơn hàng
 */
export const createOrder = (datasetId, packageType) => async (dispatch, getState) => {
  try {
    dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: true });
    
    const userId = getState().user?.userInfo?.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const response = await axios.post('/api/orders', {
      datasetId,
      packageType,
      userId
    });

    if (response.success) {
      const order = response.order || response.data;
      dispatch({
        type: PAYMENT_ACTIONS.SET_CURRENT_ORDER,
        payload: order
      });
      return order;
    } else {
      throw new Error(response.message || 'Lỗi tạo đơn hàng');
    }
  } catch (error) {
    dispatch({
      type: PAYMENT_ACTIONS.SET_ERROR,
      payload: error.message
    });
    throw error;
  } finally {
    dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: false });
  }
};

/**
 * Khởi tạo thanh toán
 */
export const initiatePayment = (orderId, paymentMethod) => async (dispatch) => {
  try {
    dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: true });

    const response = await axios.post(`/api/payments/${orderId}`, {
      paymentMethod
    });

    if (response.success) {
      dispatch({
        type: PAYMENT_ACTIONS.SET_CURRENT_PAYMENT,
        payload: response.payment
      });
      return response.payment;
    } else {
      throw new Error(response.message || 'Lỗi khởi tạo thanh toán');
    }
  } catch (error) {
    dispatch({
      type: PAYMENT_ACTIONS.SET_ERROR,
      payload: error.message
    });
    throw error;
  } finally {
    dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: false });
  }
};

/**
 * Check trạng thái thanh toán
 */
export const checkPaymentStatus = (paymentId) => async (dispatch) => {
  try {
    dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: true });
    
    const response = await axios.get(`/api/payments/${paymentId}/status`);

    console.log('[checkPaymentStatus] Full response:', response);
    
    if (response && response.success) {
      const paymentData = response.data;
      console.log('[checkPaymentStatus] Setting payment status:', paymentData);
      
      dispatch({
        type: PAYMENT_ACTIONS.SET_PAYMENT_STATUS,
        payload: paymentData
      });
      return paymentData;
    } else {
      console.error('[checkPaymentStatus] Response not successful:', response);
      throw new Error(response?.message || 'Lỗi kiểm tra trạng thái');
    }
  } catch (error) {
    console.error('[checkPaymentStatus] Error:', error);
    dispatch({
      type: PAYMENT_ACTIONS.SET_ERROR,
      payload: error.message
    });
    throw error;
  } finally {
    dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: false });
  }
};

/**
 * Xử lý thanh toán bằng thẻ tín dụng
 */
export const processCreditCardPayment = (transactionId, cardDetails) => async (dispatch) => {
  try {
    dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: true });

    const response = await axios.post('/api/payments/creditcard', {
      transactionId,
      cardNumber: cardDetails.cardNumber,
      expiryDate: cardDetails.expiryDate,
      cvv: cardDetails.cvv,
      cardHolder: cardDetails.cardHolder
    });

    if (response.data.success) {
      dispatch({
        type: PAYMENT_ACTIONS.SET_PAYMENT_STATUS,
        payload: { status: 'success', transactionId }
      });
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Thanh toán thất bại');
    }
  } catch (error) {
    dispatch({
      type: PAYMENT_ACTIONS.SET_ERROR,
      payload: error.message
    });
    throw error;
  } finally {
    dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: false });
  }
};

/**
 * Lấy danh sách đơn hàng
 */
export const fetchUserOrders = (page = 1, limit = 10) => async (dispatch, getState) => {
  try {
    dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: true });
    
    const userId = getState().user?.userInfo?.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await axios.get('/api/orders', {
      params: { page, limit, userId }
    });

    if (response.success) {
      dispatch({
        type: PAYMENT_ACTIONS.SET_ORDERS,
        payload: response.data
      });
    }
  } catch (error) {
    dispatch({
      type: PAYMENT_ACTIONS.SET_ERROR,
      payload: error.message
    });
  } finally {
    dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: false });
  }
};

/**
 * Lấy danh sách subscription
 */
export const fetchUserSubscriptions = () => async (dispatch, getState) => {
  try {
    dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: true });
    
    const userId = getState().user?.userInfo?.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await axios.get('/api/subscriptions', {
      params: { userId }
    });

    if (response.success) {
      dispatch({
        type: PAYMENT_ACTIONS.SET_SUBSCRIPTIONS,
        payload: response.data
      });
    }
  } catch (error) {
    dispatch({
      type: PAYMENT_ACTIONS.SET_ERROR,
      payload: error.message
    });
  } finally {
    dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: false });
  }
};

/**
 * Hủy subscription
 */
export const cancelSubscription = (subscriptionId) => async (dispatch, getState) => {
  try {
    dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: true });
    
    const userId = getState().user?.userInfo?.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await axios.delete(`/api/subscriptions/${subscriptionId}`, {
      params: { userId }
    });

    if (response.data.success) {
      // Refresh subscriptions list
      await dispatch(fetchUserSubscriptions());
    }
  } catch (error) {
    dispatch({
      type: PAYMENT_ACTIONS.SET_ERROR,
      payload: error.message
    });
  } finally {
    dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: false });
  }
};

export const clearError = () => ({
  type: PAYMENT_ACTIONS.CLEAR_ERROR
});
