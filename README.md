# EXPensio - Expense Tracker Application

แอปพลิเคชันจัดการค่าใช้จ่ายแบบ Full-stack พร้อม Dashboard, หมวดหมู่, การกรองตามเวลา, และฟีเจอร์ครบครัน

## ✨ ฟีเจอร์หลัก

### 📊 Dashboard
- **Dark Theme UI** - ธีมมืดที่สวยงามและทันสมัย
- **Sidebar Navigation** - เมนูนำทางที่สะดวก พร้อมโปรไฟล์ผู้ใช้
- **Summary Cards** - แสดงสถิติค่าใช้จ่ายแบบ Real-time
- **Charts & Graphs** - กราฟแสดงค่าใช้จ่ายตามหมวดหมู่และรายวัน
- **Pending Tasks** - แสดงงานที่รอดำเนินการ

### 💰 การจัดการค่าใช้จ่าย
- เพิ่ม/แก้ไข/ลบค่าใช้จ่าย
- จัดหมวดหมู่ค่าใช้จ่าย
- กรองและค้นหาตามช่วงเวลา, หมวดหมู่, และคำค้นหา
- เรียงลำดับตามวันที่หรือจำนวนเงิน
- Export เป็นไฟล์ CSV พร้อมสรุปข้อมูล

### 📸 ใบเสร็จ
- อัพโหลดรูปภาพใบเสร็จ (รองรับ JPG, PNG, GIF สูงสุด 5MB)
- ดูใบเสร็จที่บันทึกไว้
- เชื่อมโยงใบเสร็จกับค่าใช้จ่าย

### ✈️ การเดินทาง (Trips)
- สร้างการเดินทางพร้อมบันทึกค่าใช้จ่าย
- แก้ไขและลบการเดินทาง
- เพิ่มค่าใช้จ่ายเข้าไปในการเดินทาง
- ดูสรุปค่าใช้จ่ายของแต่ละการเดินทาง

### 👤 โปรไฟล์
- แก้ไขชื่อ-นามสกุล
- เปลี่ยนรหัสผ่าน
- อัพโหลดรูปโปรไฟล์

## 🔄 CI/CD

โปรเจกต์นี้มี GitHub Actions CI pipeline ที่จะ:
- ✅ ตรวจสอบและ lint โค้ด frontend
- ✅ Build frontend เพื่อตรวจสอบว่าไม่มี errors
- ✅ Validate Prisma schema
- ✅ Generate Prisma Client
- ✅ ตรวจสอบ syntax errors ใน backend

CI จะทำงานอัตโนมัติเมื่อ push หรือสร้าง Pull Request

## 🛠️ เทคโนโลยีที่ใช้

### Frontend
- React 19
- React Router DOM
- Vite
- Recharts (สำหรับกราฟ)
- Lucide React (ไอคอน)
- Axios (HTTP Client)
- date-fns (จัดการวันที่)

### Backend
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcryptjs (Hash รหัสผ่าน)

## 📦 การติดตั้งและรัน

### Prerequisites
- Node.js (v18 หรือสูงกว่า)
- PostgreSQL Database
- npm หรือ yarn

### 1. Clone Repository
```bash
git clone <repository-url>
cd expense-tracker
```

### 2. ติดตั้ง Backend

```bash
cd backend
npm install
```

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์ `backend/`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/expense_tracker?schema=public"
JWT_SECRET="your-secret-key-here"
PORT=5000
```

### 4. ตั้งค่า Database

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# หรือ push schema โดยตรง (สำหรับ development)
npx prisma db push
```

### 5. รัน Backend Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Backend จะรันที่ `http://localhost:5000`

### 6. ติดตั้ง Frontend

```bash
cd ../frontend
npm install
```

### 7. ตั้งค่า Frontend Environment

สร้างไฟล์ `.env` ในโฟลเดอร์ `frontend/` (ถ้าต้องการ):

```env
VITE_API_URL=http://localhost:5000/api
```

### 8. รัน Frontend

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Frontend จะรันที่ `http://localhost:5173`

## 🚀 การ Deploy

### Backend Deployment

1. **ตั้งค่า Environment Variables บน Server:**
   ```env
   DATABASE_URL=<your-production-database-url>
   JWT_SECRET=<strong-secret-key>
   PORT=5000
   ```

2. **Deploy Database:**
   ```bash
   npx prisma migrate deploy
   ```

3. **รัน Server:**
   ```bash
   npm start
   ```

### Frontend Deployment

1. **Build Production:**
   ```bash
   npm run build
   ```

2. **ตั้งค่า VITE_API_URL:**
   - แก้ไขในไฟล์ `.env.production` หรือ
   - ตั้งค่า environment variable บน hosting platform

3. **Deploy `dist/` folder** ไปยัง:
   - Vercel
   - Netlify
   - GitHub Pages
   - หรือ static hosting อื่นๆ

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - สมัครสมาชิก
- `POST /api/auth/login` - เข้าสู่ระบบ
- `PUT /api/auth/profile` - อัพเดทโปรไฟล์

### Categories
- `GET /api/categories` - ดึงหมวดหมู่ทั้งหมด
- `POST /api/categories` - สร้างหมวดหมู่ใหม่
- `PUT /api/categories/:id` - แก้ไขหมวดหมู่
- `DELETE /api/categories/:id` - ลบหมวดหมู่

### Expenses
- `GET /api/expenses` - ดึงค่าใช้จ่าย (รองรับ query params: startDate, endDate, categoryId, sortBy, sortOrder)
- `POST /api/expenses` - สร้างค่าใช้จ่ายใหม่
- `PUT /api/expenses/:id` - แก้ไขค่าใช้จ่าย
- `DELETE /api/expenses/:id` - ลบค่าใช้จ่าย

### Dashboard
- `GET /api/dashboard/summary` - ดึงสรุปข้อมูล (รองรับ query params: startDate, endDate)

### Trips
- `GET /api/trips` - ดึงการเดินทางทั้งหมด
- `GET /api/trips/:id` - ดึงการเดินทางตาม ID
- `POST /api/trips` - สร้างการเดินทางใหม่
- `PUT /api/trips/:id` - แก้ไขการเดินทาง
- `DELETE /api/trips/:id` - ลบการเดินทาง

## 🔒 Security

- รหัสผ่านถูก hash ด้วย bcryptjs
- JWT token สำหรับ authentication
- CORS configured
- Environment variables สำหรับ sensitive data

## 📄 License

ISC

## 👨‍💻 Author

Created for internship evaluation

