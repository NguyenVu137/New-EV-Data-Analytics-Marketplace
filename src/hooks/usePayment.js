import { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from '../axios';

/**
 * Custom Hook for Payment Handling
 * Manages purchase flow, validation, and error handling
 */
export const usePayment = (dataset) => {
    const [selectedPackage, setSelectedPackage] = useState('standard');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('creditcard');  // Default to creditcard
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get user info from Redux
    const { isLoggedIn, userInfo } = useSelector(state => ({
        isLoggedIn: state.user?.isLoggedIn,
        userInfo: state.user?.userInfo
    }));

    // Validate dataset on mount
    useEffect(() => {
        if (!dataset) {
            setError('Dữ liệu gói không hợp lệ');
        }
    }, [dataset]);

    /**
     * Handle purchase with validation and error handling
     * @param {Object} cardData - Credit card data (optional, only for card payments)
     */
    const handlePurchase = useCallback(async (cardData = null) => {
        // Check authentication first
        if (!isLoggedIn || !userInfo || !userInfo.user || !userInfo.user.id) {
            setError('Vui lòng đăng nhập để tiếp tục thanh toán');
            return;
        }

        // Validation
        if (!dataset || !dataset.id) {
            setError('Dữ liệu gói không hợp lệ');
            return;
        }

        if (!selectedPaymentMethod) {
            setError('Vui lòng chọn phương thức thanh toán');
            return;
        }

        if (!['creditcard', 'bank', 'momo', 'zalopay'].includes(selectedPaymentMethod)) {
            setError(`Phương thức thanh toán không hợp lệ: ${selectedPaymentMethod}`);
            return;
        }

        if (!selectedPackage) {
            setError('Vui lòng chọn gói dữ liệu');
            return;
        }

        // Validate card data for credit card payment
        if (selectedPaymentMethod === 'creditcard' && (!cardData || !cardData.cardNumber)) {
            setError('Vui lòng nhập thông tin thẻ tín dụng');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // API call with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const userId = userInfo.user.id;

            // Step 1: Create order
            const orderResponse = await axios.post(
                '/api/orders',
                {
                    datasetId: dataset.id,
                    packageType: selectedPackage,
                    userId: userId
                },
                {
                    signal: controller.signal,
                    headers: {
                        'Content-Type': 'application/json',
                        'x-user-id': userId
                    }
                }
            );

            clearTimeout(timeoutId);

            if (!orderResponse || !orderResponse.success) {
                throw new Error(orderResponse?.message || 'Không thể tạo đơn hàng');
            }

            const order = orderResponse.order;
            if (!order || !order.id) {
                throw new Error('Không thể tạo đơn hàng - phản hồi không hợp lệ');
            }

            const orderId = order.id;

            console.log('[usePayment] Order created:', { orderId, selectedPaymentMethod });

            // Step 2: Initiate payment
            console.log('[usePayment] Initiating payment with:', {
                orderId,
                paymentMethod: selectedPaymentMethod,
                userId
            });
            
            const paymentPayload = {
                paymentMethod: selectedPaymentMethod,
                userId: userId
            };
            
            console.log('[usePayment] Payment payload:', paymentPayload);
            console.log('[usePayment] Payment method type:', typeof selectedPaymentMethod);
            console.log('[usePayment] Payment method value:', JSON.stringify(selectedPaymentMethod));
            
            const paymentResponse = await axios.post(
                `/api/payments/${orderId}`,
                paymentPayload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-user-id': userId
                    }
                }
            );
            
            console.log('[usePayment] Payment response:', paymentResponse);

            if (!paymentResponse || !paymentResponse.success) {
                throw new Error(paymentResponse?.message || 'Không thể khởi tạo thanh toán');
            }

            const payment = paymentResponse.payment;
            if (!payment || !payment.id) {
                throw new Error('Không thể khởi tạo thanh toán - phản hồi không hợp lệ');
            }

            const paymentId = payment.id;
            const transactionId = payment.transactionId;

            // Step 3: Process payment based on method
            if (selectedPaymentMethod === 'creditcard') {
                // Process credit card payment
                const cardResponse = await axios.post(
                    '/api/payments/creditcard',
                    {
                        transactionId: transactionId,
                        cardNumber: cardData.cardNumber,
                        expiryDate: cardData.expiryDate,
                        cvv: cardData.cvv,
                        cardHolder: cardData.cardHolder,
                        userId: userId
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'x-user-id': userId
                        }
                    }
                );

                if (!cardResponse || !cardResponse.success) {
                    throw new Error(cardResponse?.message || 'Lỗi xử lý thẻ tín dụng');
                }
            }

            // Store payment info to session
            sessionStorage.setItem('pendingPayment', JSON.stringify({
                datasetId: dataset.id,
                packageType: selectedPackage,
                paymentId,
                transactionId,
                orderId,
                userId: userId
            }));

            // Redirect to payment confirmation
            setTimeout(() => {
                window.location.href = `/payment_confirmation/${paymentId}`;
            }, 300);
        } catch (err) {
            // Handle different error types
            let errorMessage = 'Có lỗi xảy ra khi xử lý thanh toán';

            if (err.name === 'AbortError') {
                errorMessage = 'Yêu cầu timeout - vui lòng thử lại';
            } else if (err.response) {
                const status = err.response.status;
                const data = err.response.data;

                if (status === 400) {
                    errorMessage = data.message || 'Dữ liệu không hợp lệ';
                } else if (status === 401) {
                    errorMessage = 'Phiên đăng nhập hết hạn - vui lòng đăng nhập lại';
                } else if (status === 402) {
                    errorMessage = 'Số dư tài khoản không đủ';
                } else if (status === 404) {
                    errorMessage = 'Gói dữ liệu không tồn tại';
                } else if (status === 500) {
                    errorMessage = 'Lỗi máy chủ - vui lòng thử lại sau';
                }
            } else if (err.message) {
                errorMessage = err.message;
            }

            console.error('Purchase error:', err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [dataset, selectedPackage, selectedPaymentMethod, isLoggedIn, userInfo]);

    /**
     * Clear error message
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        selectedPackage,
        setSelectedPackage,
        selectedPaymentMethod,
        setSelectedPaymentMethod,
        loading,
        error,
        clearError,
        handlePurchase,
        isLoggedIn
    };
};

