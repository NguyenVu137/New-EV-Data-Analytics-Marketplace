import React, { useCallback } from 'react';
import './PaymentMethodSelection.css';

/**
 * Individual Method Card Component
 */
const MethodCard = ({ method, isSelected, onSelect, disabled }) => {
    const handleClick = useCallback(() => {
        if (!disabled) {
            onSelect();
        }
    }, [disabled, onSelect]);

    const isDisabled = disabled || method.status === 'maintenance';

    return (
        <div 
            className={`method-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
            onClick={handleClick}
            role="option"
            aria-selected={isSelected}
            tabIndex={isDisabled ? -1 : 0}
        >
            <div className="method-icon">
                <i className={`fa-brands fa-${method.icon}`}></i>
            </div>
            
            <div className="method-info">
                <h3>{method.name}</h3>
                {method.description && <p>{method.description}</p>}
                {method.processingTime && (
                    <p className="processing-time">
                        <i className="fas fa-clock"></i> {method.processingTime}
                    </p>
                )}
            </div>
            
            <div className="method-check">
                <div className="check-circle">
                    {isSelected && <span className="check-mark">✓</span>}
                </div>
            </div>
            
            {method.status === 'maintenance' && (
                <div className="method-status maintenance">
                    <i className="fas fa-wrench"></i>
                    <span>Đang bảo trì</span>
                </div>
            )}
            
            {method.fee > 0 && !isDisabled && (
                <div className="method-fee">
                    +{(method.fee * 100).toFixed(0)}% phí
                </div>
            )}
        </div>
    );
};

/**
 * Payment Method Selection Component
 * Displays available payment methods
 */
const PaymentMethodSelection = ({ methods, selected, onSelect }) => {
    return (
        <div className="payment-methods-section">
            <h2>
                <i className="fas fa-credit-card"></i> Chọn phương thức thanh toán
            </h2>
            <div className="methods-grid">
                {methods && methods.map(method => (
                    <MethodCard
                        key={method.id}
                        method={method}
                        isSelected={selected === method.id}
                        onSelect={() => onSelect(method.id)}
                        disabled={method.status === 'maintenance'}
                    />
                ))}
            </div>
        </div>
    );
};

export default PaymentMethodSelection;
