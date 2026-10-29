# ASSIGNMENT 3: USER AUTHENTICATION & AUTHORIZATION

## 1. CÁC TÀI KHOẢN MẪU ĐÃ SEED
- **Admin**: `username`: `admin` | `password`: `admin123` (admin: `true`)
- **Tác giả 1**: `username`: `author1` | `password`: `author123` (admin: `false`)
- **Tác giả 2**: `username`: `author2` | `password`: `author123` (admin: `false`)

## 2. QUY TRÌNH TEST TRÊN POSTMAN

### Bước 1: Đăng nhập lấy Token
- **POST** `http://localhost:3000/users/login` (hoặc port của server)
- Body (JSON):
  ```json
  { "username": "admin", "password": "admin123" }
  ```
- Copy giá trị `token` từ phản hồi JSON.

### Bước 2: Test Task 3 - GET /users
- Gắn Header: `Authorization: Bearer <TOKEN>`
- Nếu dùng token của `author1` -> Nhận mã **403**: `"You are not authorized to perform this operation!"`
- Nếu dùng token của `admin` -> Nhận mã **200 OK** và danh sách người dùng.

### Bước 3: Test Task 2 - POST /quizzes
- Thử gửi POST với token `author1` -> Bị cấm **403**
- Gửi POST với token `admin` -> Tạo thành công **201 Created**

### Bước 4: Test Task 4 - Quyền Tác giả trên Câu hỏi (/questions)
- Đăng nhập bằng `author1`, tạo câu hỏi mới qua `POST /questions` -> Hệ thống tự động gán `author = author1._id`.
- Dùng token `author2` hoặc `admin` để gửi `PUT` hoặc `DELETE` tới câu hỏi đó -> Nhận mã **403**: `"You are not the author of this question"`.
- Dùng token `author1` gửi `PUT` hoặc `DELETE` -> Thành công **200 OK**.
