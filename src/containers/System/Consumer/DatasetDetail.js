import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDetailDataset } from '../../../store/actions';
import { useParams } from 'react-router-dom';
import './DatasetDetail.scss';

const DatasetDetail = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('overview');
    const [downloadingFileId, setDownloadingFileId] = useState(null);

    const detailDataset = useSelector(state => state.consumer.detailDataset);
    const loading = useSelector(state => state.consumer.loadingDetail);
    const error = useSelector(state => state.consumer.errorDetail);
    const userInfo = useSelector(state => state.user.userInfo);

    useEffect(() => {
        if (id) {
            dispatch(fetchDetailDataset(id));
        }
    }, [id, dispatch]);

    const handleDownload = async (file) => {
        setDownloadingFileId(file.id);

        try {
            const token = userInfo?.token;

            if (!token) {
                alert('Please login to download files');
                setDownloadingFileId(null);
                return;
            }

            const response = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}/api/datasets/download/${file.id}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Download failed');
            }

            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = file.file_name;
            document.body.appendChild(a);
            a.click();

            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setDownloadingFileId(null);
        } catch (error) {
            console.error('Download error:', error);
            alert(`Download failed: ${error.message}`);
            setDownloadingFileId(null);
        }
    };

    if (loading) return <p className="loading">Loading dataset...</p>;
    if (error) return <p className="error">Error: {error}</p>;
    if (!detailDataset || !detailDataset.id) return <p className="no-data">No dataset found</p>;

    return (
        <div className="dataset-detail-kaggle">
            <div className="dataset-hero">
                <div className="hero-content">
                    <h1 className="dataset-title">{detailDataset.title}</h1>
                    <p className="dataset-description">{detailDataset.description}</p>

                    <div className="hero-meta">
                        <div className="meta-item">
                            <span className="meta-label">Provider:</span>
                            <span className="meta-value">
                                {detailDataset.provider?.firstName} {detailDataset.provider?.lastName}
                            </span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Format:</span>
                            <span className="meta-value">{detailDataset.format?.valueVi}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Status:</span>
                            <span className={`meta-value status-badge ${detailDataset.status?.valueVi?.toLowerCase()}`}>
                                {detailDataset.status?.valueVi || 'APPROVED'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dataset-tabs">
                <div className="tabs-container">
                    <button
                        className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`tab ${activeTab === 'data' ? 'active' : ''}`}
                        onClick={() => setActiveTab('data')}
                    >
                        Data
                    </button>
                    <button
                        className={`tab ${activeTab === 'metadata' ? 'active' : ''}`}
                        onClick={() => setActiveTab('metadata')}
                    >
                        Metadata
                    </button>
                </div>
            </div>

            <div className="dataset-body">
                <div className="main-column">
                    {activeTab === 'overview' && (
                        <div className="overview-section">
                            <div className="section-card">
                                <h2>About this Dataset</h2>
                                <p>{detailDataset.description}</p>

                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Category</span>
                                        <span className="info-value">{detailDataset.category?.valueVi}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Format</span>
                                        <span className="info-value">{detailDataset.format?.valueVi}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Status</span>
                                        <span className="info-value">{detailDataset.status?.valueVi || 'APPROVED'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="section-card">
                                <h2>Provider Information</h2>
                                <div className="provider-info">
                                    <div className="provider-avatar">
                                        {detailDataset.provider?.firstName?.charAt(0)}{detailDataset.provider?.lastName?.charAt(0)}
                                    </div>
                                    <div className="provider-details">
                                        <h3>{detailDataset.provider?.firstName} {detailDataset.provider?.lastName}</h3>
                                        <p>{detailDataset.provider?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'data' && (
                        <div className="data-section">
                            <div className="section-card">
                                <h2>Data Files</h2>
                                {detailDataset.files?.length > 0 ? (
                                    <div className="files-list">
                                        {detailDataset.files.map(file => (
                                            <div key={file.id} className="file-item">
                                                <div className="file-icon">📄</div>
                                                <div className="file-info">
                                                    <span className="file-name">{file.file_name}</span>
                                                    <span className="file-version">Version: {file.version || '1.0'}</span>
                                                </div>
                                                <button
                                                    className="download-btn"
                                                    onClick={() => handleDownload(file)}
                                                    disabled={downloadingFileId === file.id}
                                                >
                                                    {downloadingFileId === file.id ? (
                                                        <>
                                                            <i className="fa fa-spinner fa-spin"></i> Downloading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fa fa-download"></i> Download
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-content">No files available</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'metadata' && (
                        <div className="metadata-section">
                            <div className="section-card">
                                <h2>Metadata</h2>
                                {detailDataset.metadata?.length > 0 ? (
                                    <div className="metadata-list">
                                        {detailDataset.metadata.map(meta => (
                                            <div key={meta.id} className="metadata-item">
                                                <span className="metadata-key">{meta.key}</span>
                                                <span className="metadata-value">{meta.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-content">No metadata available</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="side-column">
                    <div className="sidebar-card">
                        <h3>Pricing</h3>
                        <div className="pricing-list">
                            <div className="price-item">
                                <span className="price-tier">Basic</span>
                                <span className="price-value">{detailDataset.basicPrice} VND</span>
                            </div>
                            <div className="price-item">
                                <span className="price-tier">Standard</span>
                                <span className="price-value">{detailDataset.standardPrice} VND</span>
                            </div>
                            <div className="price-item">
                                <span className="price-tier">Premium</span>
                                <span className="price-value">{detailDataset.premiumPrice} VND</span>
                            </div>
                        </div>
                        <button className="purchase-btn">Purchase Dataset</button>
                    </div>

                    <div className="sidebar-card">
                        <h3>Quick Stats</h3>
                        <div className="stats-list">
                            <div className="stat-item">
                                <span className="stat-label">Files</span>
                                <span className="stat-value">{detailDataset.files?.length || 0}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Format</span>
                                <span className="stat-value">{detailDataset.format?.valueVi}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Category</span>
                                <span className="stat-value">{detailDataset.category?.valueVi}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DatasetDetail;