# 🚀 คู่มือการ Deploy - EXPensio

คู่มือฉบับสมบูรณ์สำหรับการ deploy EXPensio Expense Tracker Application

## 📋 สารบัญ

- [Checklist ก่อน Deploy](#-checklist-ก่อน-deploy)
- [การเตรียม Environment](#-การเตรียม-environment)
- [Backend Deployment](#-backend-deployment)
- [Frontend Deployment](#-frontend-deployment)
- [แพลตฟอร์มที่แนะนำ](#-แพลตฟอร์มที่แนะนำ)
- [การ Deploy แบบ Step-by-Step](#-การ-deploy-แบบ-step-by-step)
- [ข้อควรระวัง](#-ข้อควรระวัง)
- [Performance Tips](#-performance-tips)
- [การตรวจสอบหลัง Deploy](#-การตรวจสอบหลัง-deploy)
- [Troubleshooting](#-troubleshooting)

---

## ✅ Checklist ก่อน Deploy

### Backend
- [x] Environment variables ตั้งค่าเรียบร้อย
- [x] Database schema ถูก migrate แล้ว
- [x] Prisma Client generated แล้ว
- [x] Error handling ครบถ้วน
- [x] CORS configured
- [x] JSON payload limit เพิ่มเป็น 50MB สำหรับรูปภาพ
- [x] JWT_SECRET มีความแข็งแกร่งเพียงพอ
- [x] Database connection string ถูกต้อง

### Frontend
- [x] Build script ทำงานได้
- [x] Environment variables สำหรับ API URL
- [x] Error handling ครบถ้วน
- [x] Responsive design
- [x] Production build สร้างสำเร็จ
- [x] ไม่มี console errors

---

## 🔐 การเตรียม Environment

### Backend Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์ `backend/` หรือตั้งค่าบน hosting platform:

```env
# Database Connection (Required)
DATABASE_URL=postgresql://user:password@host:port/database?schema=public

# JWT Secret Key (Required)
# สร้างด้วย: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-characters-random

# Server Port (Optional, default: 5000)
PORT=5000
```

**คำแนะนำ**:
- `DATABASE_URL`: ใช้ connection string จาก cloud database provider (Neon, Supabase, Railway, etc.)
- `JWT_SECRET`: ใช้คีย์ที่สร้างจาก random bytes (32+ characters)
- `PORT`: Hosting platform มักจะกำหนด PORT ให้อัตโนมัติ (เช่น Heroku, Railway)

### Frontend Environment Variables

สร้างไฟล์ `.env.production` ในโฟลเดอร์ `frontend/` หรือตั้งค่าบน hosting platform:

```env
# Backend API URL (Required)
VITE_API_URL=https://your-backend-url.com/api
```

**คำแนะนำ**:
- ใช้ HTTPS URL สำหรับ production
- ไม่มี trailing slash (`/`) ที่ท้าย URL

---

## 🖥️ Backend Deployment

### Prerequisites
- Node.js v18 หรือสูงกว่า
- PostgreSQL database (cloud หรือ local)
- npm หรือ yarn

### Step 1: Prepare Repository

```bash
cd backend
npm install --production=false  # หรือ npm ci
```

### Step 2: Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (สำหรับ production)
npx prisma migrate deploy

# หรือ push schema โดยตรง (สำหรับ testing/dev)
# npx prisma db push
```

### Step 3: Test Build

```bash
# ทดสอบว่า server เริ่มได้
npm start
```

### Step 4: Deploy to Platform

เลือกแพลตฟอร์มและทำตามคำแนะนำด้านล่าง

---

## 🎨 Frontend Deployment

### Step 1: Prepare Repository

```bash
cd frontend
npm install  # หรือ npm ci
```

### Step 2: Set Environment Variables

สร้างไฟล์ `.env.production`:

```env
VITE_API_URL=https://your-backend-url.com/api
```

**หรือ** ตั้งค่าบน hosting platform (Vercel, Netlify, etc.)

### Step 3: Build

```bash
npm run build
```

จะได้โฟลเดอร์ `dist/` ที่พร้อม deploy

### Step 4: Test Production Build

```bash
npm run preview
```

### Step 5: Deploy

Deploy โฟลเดอร์ `dist/` ไปยัง hosting platform

---

## 🔧 แพลตฟอร์มที่แนะนำ

### Backend Hosting

#### 1. Railway
- ✅ รองรับ Prisma และ PostgreSQL อัตโนมัติ
- ✅ Free tier มีให้
- ✅ Environment variables ตั้งค่าสะดวก
- ✅ Auto-deploy from GitHub

**วิธี Deploy:**
1. สมัคร Railway
2. New Project → Deploy from GitHub repo
3. เพิ่ม PostgreSQL service
4. ตั้งค่า environment variables
5. Deploy!

#### 2. Render
- ✅ Free tier สำหรับ PostgreSQL
- ✅ Auto-deploy from GitHub
- ✅ Easy setup

**วิธี Deploy:**
1. สมัคร Render
2. New Web Service → Connect GitHub repo
3. Build command: `cd backend && npm install && npx prisma generate`
4. Start command: `cd backend && npm start`
5. ตั้งค่า environment variables
6. Add PostgreSQL database

#### 3. Heroku
- ✅ Free tier (จำกัด)
- ✅ PostgreSQL add-on
- ✅ Environment variables

**วิธี Deploy:**
1. ติดตั้ง Heroku CLI
2. `heroku create your-app-name`
3. `heroku addons:create heroku-postgresql`
4. `heroku config:set JWT_SECRET=your-secret`
5. `git push heroku main`

#### 4. DigitalOcean App Platform
- ✅ Auto-scaling
- ✅ Managed PostgreSQL
- ✅ GitHub integration

### Frontend Hosting

#### 1. Vercel (แนะนำ)
- ✅ Free tier
- ✅ Auto-deploy from GitHub
- ✅ Environment variables
- ✅ Fast CDN

**วิธี Deploy:**
1. สมัคร Vercel
2. Import Project จาก GitHub
3. Root Directory: `frontend`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. ตั้งค่า `VITE_API_URL` ใน Environment Variables

#### 2. Netlify
- ✅ Free tier
- ✅ Auto-deploy from GitHub
- ✅ Environment variables

**วิธี Deploy:**
1. สมัคร Netlify
2. New site from Git
3. Base directory: `frontend`
4. Build command: `npm run build`
5. Publish directory: `dist`
6. ตั้งค่า Environment variables

#### 3. Cloudflare Pages
- ✅ Free tier
- ✅ Fast CDN
- ✅ GitHub integration

---

## 📝 การ Deploy แบบ Step-by-Step

### ตัวอย่าง: Deploy ทั้ง Backend และ Frontend บน Railway + Vercel

#### Backend (Railway)

1. **เตรียม Database:**
   - สมัคร Railway
   - Create New Project
   - Add PostgreSQL service
   - Copy DATABASE_URL

2. **Deploy Backend:**
   - Add Service → Deploy from GitHub repo
   - Root Directory: `backend`
   - Build Command: `npm install && npx prisma generate`
   - Start Command: `npm start`
   - Environment Variables:
     ```
     DATABASE_URL=<from-postgres-service>
     JWT_SECRET=<generate-random-key>
     PORT=5000
     ```
   - Deploy

3. **Run Migrations:**
   ```bash
   railway run --service backend npx prisma migrate deploy
   ```

4. **Copy Backend URL:**
   - เช่น: `https://expensio-backend.railway.app`

#### Frontend (Vercel)

1. **Deploy Frontend:**
   - Import Project จาก GitHub
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables:
     ```
     VITE_API_URL=https://expensio-backend.railway.app/api
     ```
   - Deploy

2. **Copy Frontend URL:**
   - เช่น: `https://expensio.vercel.app`

#### Update CORS (ถ้าจำเป็น)

ใน `backend/src/index.js` เพิ่ม frontend URL:

```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://expensio.vercel.app']
}))
```

---

## ⚠️ ข้อควรระวัง

### 1. Database
- ✅ ต้องใช้ PostgreSQL (ไม่ใช่ SQLite หรือ MySQL)
- ✅ ตรวจสอบ connection string ให้ถูกต้อง
- ✅ ใช้ SSL connection ใน production (`?sslmode=require`)
- ✅ สำรองข้อมูลเป็นประจำ

### 2. JWT_SECRET
- ✅ ต้องใช้ secret key ที่แข็งแกร่ง (32+ characters)
- ✅ อย่า commit secret key ลง repository
- ✅ ใช้ environment variables เสมอ
- ✅ สร้างด้วย: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 3. CORS
- ✅ ตั้งค่า CORS ให้อนุญาตเฉพาะ frontend domain ของคุณ
- ✅ อย่าใช้ `origin: '*'` ใน production
- ✅ ตรวจสอบว่า frontend URL ถูกต้อง

### 4. File Upload
- ⚠️ ระบบปัจจุบันเก็บรูปเป็น base64 ใน database
- ⚠️ ทำให้ database ใหญ่และอาจช้า
- 💡 แนะนำ: ใช้ cloud storage (S3, Cloudinary, Cloudflare R2) ในอนาคต

### 5. Environment Variables
- ✅ อย่า commit `.env` files
- ✅ ใช้ `.env.example` เป็น template
- ✅ ตั้งค่าบน hosting platform ให้ถูกต้อง

### 6. Error Logging
- 💡 แนะนำ: เพิ่ม error logging service (Sentry, LogRocket)
- 💡 แนะนำ: เพิ่ม monitoring (Uptime Robot, Pingdom)

---

## 📊 Performance Tips

### Backend
1. **Database Indexing**: มี indexes อยู่แล้วสำหรับ `userId` และ `date`
2. **Connection Pooling**: Prisma จัดการ connection pooling อัตโนมัติ
3. **Query Optimization**: ใช้ Prisma includes เพื่อลด queries

### Frontend
1. **Image Optimization**: ควร compress รูปภาพก่อนอัพโหลด
2. **Code Splitting**: Vite ทำ code splitting อัตโนมัติ
3. **Lazy Loading**: ใช้ React.lazy() สำหรับ routes ที่ไม่ได้ใช้บ่อย

### Database
1. **Pagination**: สำหรับ production ควรเพิ่ม pagination สำหรับ expenses list
2. **Caching**: พิจารณาใช้ Redis สำหรับ caching
3. **Backup**: สำรองข้อมูลเป็นประจำ

---

## 🔍 การตรวจสอบหลัง Deploy

### 1. Backend Health Check

```bash
curl https://your-backend-url.com/
```

ควรได้ response:
```json
{"message":"Expense Tracker API is running!"}
```

### 2. Database Connection

ตรวจสอบใน logs ว่าเชื่อมต่อ database สำเร็จ

### 3. Frontend Build

ตรวจสอบว่า frontend build สำเร็จและไม่มี errors

### 4. API Endpoints

ทดสอบ endpoints หลัก:
- `POST /api/auth/register` - สมัครสมาชิก
- `POST /api/auth/login` - เข้าสู่ระบบ
- `GET /api/expenses` - ดึงค่าใช้จ่าย (ต้องมี auth token)

### 5. Frontend-Backend Connection

เปิด frontend และตรวจสอบว่า:
- Login/Register ทำงานได้
- API calls ทำงานได้
- ไม่มี CORS errors

### 6. Full Flow Test

ทดสอบ workflow ครบถ้วน:
1. ✅ Register account
2. ✅ Login
3. ✅ Add expense
4. ✅ Upload receipt
5. ✅ Create trip
6. ✅ Export CSV
7. ✅ Update profile

---

## 🐛 Troubleshooting

### Backend ไม่เชื่อมต่อ Database

**อาการ**: Error `Can't reach database server`

**วิธีแก้**:
1. ตรวจสอบ `DATABASE_URL` ให้ถูกต้อง
2. ตรวจสอบ network/firewall settings
3. ตรวจสอบว่า database server รันอยู่
4. ลองเพิ่ม `?sslmode=require` ที่ท้าย connection string

### Frontend ไม่เชื่อมต่อ Backend

**อาการ**: CORS error หรือ Network error

**วิธีแก้**:
1. ตรวจสอบ `VITE_API_URL` ให้ถูกต้อง
2. ตรวจสอบ CORS settings ใน backend
3. ตรวจสอบ network tab ใน browser DevTools
4. ตรวจสอบว่า backend URL ถูกต้องและรันอยู่

### รูปภาพไม่แสดง

**อาการ**: รูปภาพไม่แสดงใน frontend

**วิธีแก้**:
1. ตรวจสอบว่า base64 string ถูกเก็บครบถ้วนใน database
2. ตรวจสอบว่า blob size ไม่เกิน limit (50MB)
3. ตรวจสอบ browser console สำหรับ errors
4. ตรวจสอบว่า `receiptUrl` มีค่าและถูก format ถูกต้อง

### Build Fails

**อาการ**: Frontend build ล้มเหลว

**วิธีแก้**:
1. ตรวจสอบ linting errors: `npm run lint`
2. ตรวจสอบ dependencies: `npm install`
3. ตรวจสอบ Node.js version (ต้อง v18+)
4. ลบ `node_modules` และ `package-lock.json` แล้ว `npm install` ใหม่

### Migration Fails

**อาการ**: `prisma migrate deploy` ล้มเหลว

**วิธีแก้**:
1. ตรวจสอบ `DATABASE_URL` ให้ถูกต้อง
2. ตรวจสอบว่า database มีสิทธิ์สร้าง tables
3. ลองใช้ `prisma db push` แทน (สำหรับ development)
4. ตรวจสอบ Prisma schema ให้ถูกต้อง: `npx prisma validate`

### Environment Variables ไม่ทำงาน

**อาการ**: Environment variables ไม่ถูกอ่าน

**วิธีแก้**:
1. ตรวจสอบว่าไฟล์ `.env` อยู่ในตำแหน่งที่ถูกต้อง
2. ตรวจสอบชื่อตัวแปรให้ถูกต้อง (พิมพ์ใหญ่-เล็ก)
3. Restart server หลังเปลี่ยน environment variables
4. บน hosting platform: ตรวจสอบว่า environment variables ตั้งค่าแล้ว

---

## 📞 สนับสนุน

หากมีปัญหาหรือคำถามเพิ่มเติม:
- ตรวจสอบ [README.md](./README.md)
- ตรวจสอบ GitHub Issues
- ตรวจสอบ logs บน hosting platform

---

**พร้อม Deploy แล้ว!** 🎉

---

**Last Updated**: 2024  
**Version**: 1.0.0
