import React, { useState, useCallback } from 'react';
import './CardInput.css';

/**
 * Credit Card Input Component
 */
const CardInput = ({ onSubmit, loading }) => {
    const [cardData, setCardData] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardHolder: ''
    });

    const [errors, setErrors] = useState({});

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        let formatted = value;

        // Format card number with spaces (every 4 digits)
        if (name === 'cardNumber') {
            formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
        }

        // Format expiry date (MM/YY)
        if (name === 'expiryDate') {
            formatted = value.replace(/\D/g, '');
            if (formatted.length >= 2) {
                formatted = formatted.slice(0, 2) + '/' + formatted.slice(2, 4);
            }
        }

        // Format CVV (only digits)
        if (name === 'cvv') {
            formatted = value.replace(/\D/g, '').slice(0, 4);
        }

        setCardData(prev => ({
            ...prev,
            [name]: formatted
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    }, [errors]);

    const validateForm = () => {
        const newErrors = {};

        // Validate card number
        const cardNum = cardData.cardNumber.replace(/\s/g, '');
        if (!cardNum || cardNum.length < 13) {
            newErrors.cardNumber = 'Số thẻ phải có ít nhất 13 chữ số';
        }

        // Validate expiry
        if (!cardData.expiryDate || cardData.expiryDate.length < 5) {
            newErrors.expiryDate = 'Ngày hết hạn không hợp lệ (MM/YY)';
        }

        // Validate CVV
        if (!cardData.cvv || cardData.cvv.length < 3) {
            newErrors.cvv = 'CVV phải có ít nhất 3 chữ số';
        }

        // Validate cardholder
        if (!cardData.cardHolder || cardData.cardHolder.trim().length < 3) {
            newErrors.cardHolder = 'Tên chủ thẻ không hợp lệ';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = useCallback((e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        onSubmit({
            cardNumber: cardData.cardNumber.replace(/\s/g, ''),
            expiryDate: cardData.expiryDate,
            cvv: cardData.cvv,
            cardHolder: cardData.cardHolder.toUpperCase()
        });
    }, [cardData, onSubmit]);

    return (
        <form className="card-input-form" onSubmit={handleSubmit}>
            <div className="card-preview">
                <div className="card-number">
                    {cardData.cardNumber || '•••• •••• •••• ••••'}
                </div>
                <div className="card-details">
                    <div className="card-holder">
                        {cardData.cardHolder || 'CARDHOLDER NAME'}
                    </div>
                    <div className="card-expiry">
                        {cardData.expiryDate || 'MM/YY'}
                    </div>
                </div>
            </div>

            <div className="form-group">
                <label>Số thẻ</label>
                <input
                    type="text"
                    name="cardNumber"
                    value={cardData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    disabled={loading}
                    maxLength="19"
                />
                {errors.cardNumber && <span className="error">{errors.cardNumber}</span>}
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Hạn sử dụng</label>
                    <input
                        type="text"
                        name="expiryDate"
                        value={cardData.expiryDate}
                        onChange={handleInputChange}
                        placeholder="12/25"
                        disabled={loading}
                        maxLength="5"
                    />
                    {errors.expiryDate && <span className="error">{errors.expiryDate}</span>}
                </div>

                <div className="form-group">
                    <label>CVV</label>
                    <input
                        type="text"
                        name="cvv"
                        value={cardData.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        disabled={loading}
                        maxLength="4"
                    />
                    {errors.cvv && <span className="error">{errors.cvv}</span>}
                </div>
            </div>

            <div className="form-group">
                <label>Tên chủ thẻ</label>
                <input
                    type="text"
                    name="cardHolder"
                    value={cardData.cardHolder}
                    onChange={handleInputChange}
                    placeholder="NGUYEN PHUNG THANG"
                    disabled={loading}
                />
                {errors.cardHolder && <span className="error">{errors.cardHolder}</span>}
            </div>

            <button 
                type="submit" 
                className="submit-button"
                disabled={loading}
            >
                {loading ? (
                    <>
                        <span className="spinner"></span>
                        Đang xử lý...
                    </>
                ) : (
                    <>
                        <i className="fas fa-lock"></i>
                        Thanh toán
                    </>
                )}
            </button>

            <div className="security-info">
                <i className="fas fa-shield-alt"></i>
                <p>Giao dịch của bạn được bảo mật bằng SSL 256-bit</p>
            </div>

            <div className="test-cards">
                <p><strong>Test Cards:</strong></p>
                <ul>
                    <li>✅ 4111111111111111 - Success</li>
                    <li>❌ 4000000000000002 - Insufficient funds</li>
                    <li>❌ 4000002500003155 - Expired card</li>
                </ul>
            </div>
        </form>
    );
};

export default CardInput;
