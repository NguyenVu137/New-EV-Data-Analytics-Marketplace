import { useState, useCallback, useEffect } from 'react';
import axios from '../axios';

/**
 * Custom Hook for Payment Handling
 * Manages purchase flow, validation, and error handling
 */
export const usePayment = (dataset) => {
    const [selectedPackage, setSelectedPackage] = useState('standard');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Validate dataset on mount
    useEffect(() => {
        if (!dataset) {
            setError('Dữ liệu gói không hợp lệ');
        }
    }, [dataset]);

    /**
     * Handle purchase with validation and error handling
     */
    const handlePurchase = useCallback(async () => {
        // Validation
        if (!dataset || !dataset.id) {
            setError('Dữ liệu gói không hợp lệ');
            return;
        }

        if (!selectedPaymentMethod) {
            setError('Vui lòng chọn phương thức thanh toán');
            return;
        }

        if (!selectedPackage) {
            setError('Vui lòng chọn gói dữ liệu');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // API call with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await axios.post(
                `/api/datasets/${dataset.id}/purchase`,
                {
                    packageType: selectedPackage,
                    paymentMethod: selectedPaymentMethod,
                    timestamp: new Date().toISOString()
                },
                {
                    signal: controller.signal,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            clearTimeout(timeoutId);

            // Check response validity
            if (!response.data) {
                throw new Error('Phản hồi từ server không hợp lệ');
            }

            const { success, error: apiError, paymentId } = response.data;

            if (success && paymentId) {
                // Store payment info to session
                sessionStorage.setItem('pendingPayment', JSON.stringify({
                    datasetId: dataset.id,
                    packageType: selectedPackage,
                    paymentId
                }));

                // Redirect to payment confirmation
                setTimeout(() => {
                    window.location.href = `/payment/${paymentId}`;
                }, 300);
            } else {
                throw new Error(apiError || 'Không thể xử lý thanh toán');
            }
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
                    errorMessage = 'Vui lòng đăng nhập lại';
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
    }, [dataset, selectedPackage, selectedPaymentMethod]);

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
        handlePurchase
    };
};
