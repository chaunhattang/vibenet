// Mock discovery grid — sau này có be thì thay bằng GET /api/explore (bài từ người lạ,
// xếp theo độ phổ biến). `tag` để search lọc lưới ngay tại client.

export type ExploreItem = {
  id: string;
  imageUri: string;
  likeCount: number;
  tag: string;
};

const img = (photoId: string) =>
  `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=400&q=80`;

export const MOCK_EXPLORE: ExploreItem[] = [
  { id: 'e1', imageUri: img('1469474968028-56623f02e42e'), likeCount: 3200, tag: 'nature' },
  { id: 'e2', imageUri: img('1519681393784-d120267933ba'), likeCount: 1800, tag: 'mountains' },
  { id: 'e3', imageUri: img('1506744038136-46273834b3fb'), likeCount: 5400, tag: 'nature' },
  { id: 'e4', imageUri: img('1493246507139-91e8fad9978e'), likeCount: 980, tag: 'travel' },
  { id: 'e5', imageUri: img('1441974231531-c6227db76b6e'), likeCount: 2100, tag: 'forest' },
  { id: 'e6', imageUri: img('1470071459604-3b5ec3a7fe05'), likeCount: 4300, tag: 'mountains' },
  { id: 'e7', imageUri: img('1447752875215-b2761acb3c5d'), likeCount: 760, tag: 'forest' },
  { id: 'e8', imageUri: img('1500534623283-312aade485b7'), likeCount: 3900, tag: 'travel' },
  { id: 'e9', imageUri: img('1426604966848-d7adac402bff'), likeCount: 6100, tag: 'nature' },
  { id: 'e10', imageUri: img('1476514525535-07fb3b4ae5f1'), likeCount: 1500, tag: 'travel' },
  { id: 'e11', imageUri: img('1454372182658-c712e4c5a1db'), likeCount: 880, tag: 'city' },
  { id: 'e12', imageUri: img('1501785888041-af3ef285b470'), likeCount: 7200, tag: 'mountains' },
];
