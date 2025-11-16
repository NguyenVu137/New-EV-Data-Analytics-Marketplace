import React, { useState, useEffect } from 'react';
import DatasetService from '../../services/DatasetService';
import SearchResults from './SearchResults';

export default function SearchPage(){
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const load = async (nextPage = 1) => {
    setLoading(true);
    try {
      const data = await DatasetService.searchDatasets({ page: nextPage, perPage: 12 });
      // adapt to possible response shapes
      const newItems = data.items || data.results || data.rows || [];
      const total = data.total || data.count || 0;
      const perPage = data.perPage || data.limit || 12;

      setItems(prev => nextPage === 1 ? newItems : prev.concat(newItems));
      setHasMore(total > nextPage * perPage);
      setPage(nextPage);
    } catch (err) {
      console.error('search load error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, []);

  const onLoadMore = () => { if (!loading && hasMore) load(page + 1); };

  return (
    <div className="search-page">
      <SearchResults
        initialData={items}
        onLoadMore={onLoadMore}
        loading={loading}
        hasMore={hasMore}
      />
    </div>
  );
}
