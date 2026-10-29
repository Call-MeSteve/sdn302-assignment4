# Assignment 1 - SimpleQuiz REST API
**Môn học:** Node Modules, Express, MongoDB and REST API (SDN302)

Dự án backend quản lý ứng dụng trắc nghiệm (**SimpleQuiz**) theo kiến trúc **MVC**, kết nối cơ sở dữ liệu MongoDB có tên `SimpleQuiz`.

---

## 1. Cấu trúc thư mục (MVC Architecture)

```
assigment_1/
├── bin/
│   └── www                   # Script khởi chạy HTTP Server (chuẩn express-generator)
├── config/
│   └── db.js                 # Kết nối MongoDB (database: SimpleQuiz)
├── models/
│   ├── Quiz.js               # Mongoose Schema cho Quiz
│   └── Question.js           # Mongoose Schema cho Question
├── controllers/
│   ├── quizController.js     # Xử lý business logic cho Quizzes
│   └── questionController.js # Xử lý business logic cho Questions
├── routes/
│   ├── index.js              # Route mặc định (express-generator)
│   ├── users.js              # Route users (express-generator)
│   ├── quizRouter.js         # Khai báo Express Router cho /quizzes
│   └── questionRouter.js     # Khai báo Express Router cho /questions
├── public/
│   └── stylesheets/style.css # Static assets (express-generator)
├── app.js                    # Cấu hình Express app, middlewares & error handling
├── index.js                  # Entry point gọi tới bin/www
├── seed.js                   # Script tạo dữ liệu mẫu giống đề bài
├── package.json              # Chứa scripts: "start": "node ./bin/www", "dev": "nodemon ./bin/www"
├── .env / .env.example
└── SimpleQuiz_Assignment1.postman_collection.json # File import Postman
```

---

## 2. Cấu trúc Database Schemas

### Question Schema (`models/Question.js`)
- `text` (String, required): Nội dung câu hỏi.
- `options` (Array of Strings, required): Danh sách các phương án trả lời.
- `keywords` (Array of Strings): Danh sách từ khóa liên quan.
- `correctAnswerIndex` (Number, required): Chỉ số của đáp án đúng trong mảng `options`.

### Quiz Schema (`models/Quiz.js`)
- `title` (String, required): Tiêu đề của bài trắc nghiệm.
- `description` (String, required): Mô tả hoặc hướng dẫn.
- `questions` (Array of ObjectIds, ref: 'Question'): Danh sách các ObjectId liên kết tới model `Question`.

---

## 3. Danh sách Endpoints & Hướng dẫn Test từng Task

### Task 1 & 2: RESTful API cơ bản (CRUD)
| Method | Endpoint | Mô tả | Chi tiết phản hồi |
|---|---|---|---|
| `GET` | `/quizzes` | Lấy tất cả bài quiz | Sử dụng `.populate('questions')` hiển thị chi tiết câu hỏi (Status 200) |
| `POST` | `/quizzes` | Tạo mới bài quiz | Body `{ "title": "...", "description": "..." }`<br>Trả về JSON `{ message: "Added quiz with id: <id> successfully.", quiz: { ... } }` (Status 201) |
| `GET` | `/quizzes/:quizId` | Xem chi tiết quiz theo ID | Kèm `.populate('questions')` (Status 200, trả về `null` nếu không tìm thấy) |
| `PUT` | `/quizzes/:quizId` | Cập nhật bài quiz | Cập nhật thông tin quiz (Status 200) |
| `DELETE` | `/quizzes/:quizId` | Xóa bài quiz theo ID | Xóa bài quiz khỏi database (Status 200) |
| `GET` | `/questions` | Lấy danh sách câu hỏi | Trả về mảng tất cả questions (Status 200) |
| `POST` | `/questions` | Tạo mới câu hỏi | Body câu hỏi -> Trả về câu hỏi vừa tạo (Status 201) |
| `GET` | `/questions/:questionId` | Chi tiết câu hỏi theo ID | Trả về thông tin câu hỏi (Status 200) |
| `PUT` | `/questions/:questionId` | Cập nhật câu hỏi theo ID | Trả về câu hỏi đã cập nhật (Status 200) |
| `DELETE` | `/questions/:questionId` | Xóa câu hỏi theo ID | Xóa câu hỏi và tự động gỡ `_id` khỏi các Quiz (Status 200) |

> **Lưu ý:** Cả 2 đường dẫn `/questions` và `/question` đều được hỗ trợ đầy đủ.

---

### Task 3: Lọc câu hỏi có từ "capital" với populate match
- **Method:** `GET`
- **Endpoint:** `/quizzes/:quizId/populate`
- **Mô tả:** Sử dụng Mongoose `.populate({ path: 'questions', match: { text: { $regex: 'capital', $options: 'i' } } })`. Chỉ các câu hỏi trong mảng `questions` có nội dung chứa từ `"capital"` mới được hiển thị.
- **Status:** `200 OK`

---

### Task 4: Thêm 1 câu hỏi vào Quiz
- **Method:** `POST`
- **Endpoint:** `/quizzes/:quizId/question`
- **Mô tả:** Tạo 1 câu hỏi mới từ `req.body`, lưu vào collection `questions`, lấy `_id` thêm vào mảng `questions` của Quiz tương ứng.
- **Request Body:**
  ```json
  {
    "text": "What is the capital of France?",
    "options": ["Paris", "London", "Berlin", "Madrid"],
    "correctAnswerIndex": 0
  }
  ```
- **Response:** Trả về đối tượng câu hỏi vừa tạo (`Status: 201 Created`).

---

### Task 5: Thêm nhiều câu hỏi vào Quiz
- **Method:** `POST`
- **Endpoint:** `/quizzes/:quizId/questions`
- **Mô tả:** Nhận mảng nhiều câu hỏi từ `req.body`, lưu đồng loạt vào DB (`Question.insertMany()`), đẩy danh sách `_id` vào Quiz.
- **Request Body:**
  ```json
  [
    {
      "text": "What is the capital of Germany?",
      "options": ["Paris", "London", "Berlin", "Madrid"],
      "correctAnswerIndex": 2
    },
    {
      "text": "What is the capital of England?",
      "options": ["Paris", "London", "Berlin", "Madrid"],
      "correctAnswerIndex": 1
    }
  ]
  ```
- **Response:**
  ```json
  {
    "message": "Questions added successfully."
  }
  ```
- **Status:** `200 OK`

---

### Xóa/Gỡ 1 câu hỏi ra khỏi Quiz
- **Method:** `DELETE`
- **Endpoint:** `/quizzes/:quizId/questions/:questionId`
- **Mô tả:** Gỡ bỏ liên kết của câu hỏi khỏi mảng `questions` của Quiz đó (không xóa mất câu hỏi trong collection `questions`).
- **Response:**
  ```text
  Đã xóa câu hỏi với id: <questionId>
  ```
- **Status:** `200 OK`

---

## 4. Hướng dẫn Cài đặt & Chạy ứng dụng

### Bước 1: Cài đặt thư viện
```bash
npm install
```

### Bước 2: Cấu hình biến môi trường
File `.env` mặc định:
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/SimpleQuiz
```
*(Nếu dùng MongoDB Atlas, bạn chỉ cần thay đường dẫn `MONGODB_URI` vào file `.env`)*.

### Bước 3: Tạo dữ liệu mẫu (Tùy chọn)
Chạy script seed để tạo sẵn Quiz và Question mẫu khớp với hình ảnh trong đề bài:
```bash
npm run seed
```

### Bước 4: Khởi chạy Server
- Chế độ thông thường:
  ```bash
  npm start
  ```
- Chế độ tự reload khi sửa code (Nodemon):
  ```bash
  npm run dev
  ```
Server sẽ chạy tại: `http://localhost:3000`.

### Bước 5: Kiểm thử bằng Postman
1. Mở Postman, chọn **Import**.
2. Chọn file `SimpleQuiz_Assignment1.postman_collection.json` trong thư mục dự án.
3. Collection đã cấu hình sẵn đầy đủ 5 tasks và các requests tương ứng.
