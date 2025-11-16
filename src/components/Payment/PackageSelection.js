import React, { useCallback } from 'react';
import './PackageSelection.css';

/**
 * Format currency to Vietnamese locale
 */
const formatCurrency = (value) => {
    if (!value) return '0';
    return new Intl.NumberFormat('vi-VN').format(Math.round(value));
};

/**
 * Individual Package Card Component
 */
const PackageCard = ({ pkg, isSelected, onSelect }) => {
    const handleClick = useCallback(() => {
        onSelect();
    }, [onSelect]);

    return (
        <div 
            className={`plan-card ${pkg.recommended ? 'recommended' : ''} ${isSelected ? 'selected' : ''}`}
            onClick={handleClick}
            role="option"
            aria-selected={isSelected}
        >
            {pkg.recommended && (
                <div className="recommended-badge">
                    <i className="fas fa-star"></i> PHỔ BIẾN
                </div>
            )}
            {pkg.bestFor && (
                <div className="best-for-badge">{pkg.bestFor}</div>
            )}
            
            <h2 className="plan-name">{pkg.name}</h2>
            
            <div className="plan-price">
                <span className="currency">₫</span>
                <span className="amount">{formatCurrency(pkg.price)}</span>
                <span className="period">{pkg.period}</span>
            </div>
            
            <p className="plan-description">{pkg.description}</p>
            
            <div className="feature-list">
                {pkg.features && pkg.features.map((feature, index) => (
                    <div key={index} className="feature-item">
                        <span className="feature-icon">
                            <i className="fas fa-check"></i>
                        </span>
                        <span className="feature-text">{feature}</span>
                    </div>
                ))}
            </div>
            
            <button 
                className={`plan-button ${isSelected ? 'current' : ''}`}
                onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                }}
                aria-label={`Chọn gói ${pkg.name}`}
            >
                {isSelected ? (
                    <>
                        <i className="fas fa-check"></i>
                        <span>Đã chọn</span>
                    </>
                ) : (
                    <>
                        <i className="fas fa-plus"></i>
                        <span>{pkg.buttonText}</span>
                    </>
                )}
            </button>
        </div>
    );
};

/**
 * Package Selection Component
 * Displays available packages for purchase
 */
const PackageSelection = ({ packages, selected, onSelect }) => {
    return (
        <div className="plans-section">
            <h2>
                <i className="fas fa-box"></i> Chọn gói dữ liệu phù hợp
            </h2>
            <div className="plans-grid">
                {packages && packages.map(pkg => (
                    <PackageCard
                        key={pkg.id}
                        pkg={pkg}
                        isSelected={selected === pkg.id}
                        onSelect={() => onSelect(pkg.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default PackageSelection;
