# frontend_unimplemented & Trạng thái Triển khai

Tài liệu rà soát và đánh giá chi tiết hiện trạng các tính năng Real-time, Chat và Giao diện trên toàn bộ source code **Frontend (`vibenet`)** đối chiếu với **Backend**.

---

## 1. Các tính năng ĐÃ ĐƯỢC TRIỂN KHAI HOÀN CHỈNH (Implemented)

### ✅ 1. Typing Indicator (Đang soạn tin nhắn)
* **WebSocket Service (`src/services/websocket.ts`)**: `sendTyping(chatId, isTyping)` & `onTyping(chatId, callback)`.
* **Màn hình Chat (`src/app/chat/[id].tsx`)**: Tự động gửi trạng thái gõ khi nhập `TextInput` (debounce 2s); Header hiển thị `Typing…` và danh sách hiện bong bóng động `…`.
* **Màn hình Danh sách Inbox (`src/app/(tabs)/messages.tsx`)**: Đăng ký `onTyping` cho tất cả phòng chat; hiển thị dòng trạng thái *Typing…* màu xanh lá nổi bật khi bạn bè đang soạn tin.

### ✅ 2. Seen / Read Receipt bền vững (Persistent Read Receipts)
* **Backend**:
  * Entity `ChatMessage`: Thêm cột `is_read` và `read_at`.
  * Repository `ChatMessageRepository`: Query `markChatMessagesAsRead(chatId, readerId)`.
  * Controller: Endpoint REST `PUT /api/chat/rooms/{chatId}/read` và WebSocket event `@MessageMapping("/chat.read")`.
* **Frontend (`src/app/chat/[id].tsx`)**:
  * Tự động gọi `markChatRoomAsRead` và `sendRead` khi mở chat.
  * Hiển thị nhãn `Seen` dựa trên trạng thái bền vững từ database (`msg.isRead === true`) hoặc sự kiện real-time `onRead`.

### ✅ 3. Nhận Thông báo Real-time qua WebSocket (Real-time Notifications)
* **WebSocket Service (`src/services/websocket.ts`)**: Đăng ký lắng nghe `/user/queue/notifications` và xuất hàm `onNotification`.
* **Màn hình Thông báo (`src/app/(tabs)/notifications.tsx`)**: Tự động cập nhật danh sách thông báo tức thời khi nhận sự kiện từ backend.
* **Thanh điều hướng (`src/components/navigation/FloatingTabBar.tsx`)**: Hiển thị chấm đỏ thông báo chưa đọc (`notiBadgeDot`) khi có thông báo mới và tự động tắt khi người dùng mở tab Notifications.

### ✅ 4. Dọn dẹp Đăng nhập / Đăng ký Mạng xã hội không hỗ trợ
* **Màn hình Login & Register (`login.tsx`, `register.tsx`)**: Đã loại bỏ thanh ngăn "OR" và các nút "Continue with Apple", "Continue with Google" mockup không tồn tại trong backend.

### ✅ 5. Phản hồi Tương tác Cuộc gọi Thoại & Video
* **Màn hình Chat (`src/app/chat/[id].tsx`)**: Khi bấm vào nút `call-outline` hoặc `videocam-outline`, hệ thống hiển thị hộp thoại thông báo tính năng đang trong lộ trình phát triển thay vì nút bấm không phản hồi.

---

## 2. Tính năng chưa triển khai

### 🔴 1. Chat Nhóm (Group Chat)
* **Hiện trạng**: Theo quyết định thiết kế hiện tại, hệ thống tập trung hoàn thiện module Chat 1-1 (Direct Message) và tạm thời chưa triển khai Chat Nhóm.
