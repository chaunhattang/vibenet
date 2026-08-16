import { apiClient, unwrap } from './client';
import type { ExploreItemResponse, PageResponse } from './types';

export function getExploreGrid(category = 'all', page = 0, size = 30) {
  return unwrap<PageResponse<ExploreItemResponse>>(apiClient.get('/api/explore/grid', { params: { category, page, size } }));
}
