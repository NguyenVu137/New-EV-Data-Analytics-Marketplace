import React from 'react';
import { List, Card, Tag, Space, Rate, Spin } from 'antd';
import { formatCurrency, formatDate } from '../../utils/format';
import InfiniteScroll from 'react-infinite-scroll-component';

const SearchResults = ({ 
  initialData,
  onLoadMore,
  loading,
  hasMore 
}) => {
  const renderItem = (item) => (
    <List.Item key={item.id}>
      <Card hoverable>
        <div className="dataset-card">
          <div className="thumbnail">
            {item.thumbnailUrl ? (
              <img src={item.thumbnailUrl} alt={item.title} />
            ) : (
              <div className="placeholder">No Image</div>
            )}
          </div>

          <div className="content">
            <h3 style={{ cursor: 'pointer', color: '#1890ff' }} onClick={() => window.location.href = `/home/${item.id}`}>
              {item.title}
            </h3>

            <p>{item.shortDescription}</p>

            <Space size={[0, 8]} wrap>
              {item.Categories?.map(cat => (
                <Tag color="blue" key={cat.id}>{cat.name}</Tag>
              ))}
              {item.GeoRegions?.map(region => (
                <Tag key={region.id}>{region.name}</Tag>
              ))}
            </Space>

            <div className="stats">
              <Space split={"|"}>
                <span>
                  <Rate disabled defaultValue={item.avgRating} /> 
                  ({item.ratingCount})
                </span>
                <span>{item.viewCount} lượt xem</span>
                <span>{item.downloadCount} lượt tải</span>
              </Space>
            </div>

            <div className="footer">
              <div className="time-range">
                {formatDate(item.timeRangeStart)} - {formatDate(item.timeRangeEnd)}
              </div>
              <div className="price">
                {item.priceModel === 'FREE' ? (
                  <Tag color="green">Miễn phí</Tag>
                ) : (
                  <strong>{formatCurrency(item.priceAmount)}</strong>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </List.Item>
  );

  return (
    <div 
      id="scrollableDiv"
      style={{
        height: 'calc(100vh - 200px)',
        overflow: 'auto',
        padding: '0 16px',
      }}
    >
      <InfiniteScroll
        dataLength={initialData.length}
        next={onLoadMore}
        hasMore={hasMore}
        loader={<Spin />}
        endMessage={<p style={{ textAlign: 'center' }}>Đã hiển thị tất cả kết quả</p>}
        scrollableTarget="scrollableDiv"
      >
        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 1,
            md: 2,
            lg: 2,
            xl: 3,
            xxl: 3,
          }}
          dataSource={initialData}
          renderItem={renderItem}
          loading={loading}
        />
      </InfiniteScroll>

      <style>{`
        .dataset-card {
          display: flex;
          gap: 16px;
        }
        .thumbnail {
          width: 120px;
          height: 120px;
          background: #f0f2f5;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .placeholder {
          color: #999;
          text-align: center;
        }
        .content {
          flex: 1;
        }
        h3 {
          margin: 0 0 8px;
          color: #1890ff;
        }
        p {
          color: #666;
          margin-bottom: 8px;
        }
        .stats {
          margin: 8px 0;
          color: #666;
        }
        .footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
        }
        .time-range {
          color: #666;
          font-size: 12px;
        }
        .price {
          font-size: 16px;
        }
      `}</style>
    </div>
  );
};

export default SearchResults;
