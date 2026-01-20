# 🚀 คู่มือการ Deploy - EXPensio

## ✅ Checklist ก่อน Deploy

### Backend
- [x] Environment variables ตั้งค่าเรียบร้อย
- [x] Database schema ถูก migrate แล้ว
- [x] Prisma Client generated แล้ว
- [x] Error handling ครบถ้วน
- [x] CORS configured
- [x] JSON payload limit เพิ่มเป็น 50MB สำหรับรูปภาพ

### Frontend
- [x] Build script ทำงานได้
- [x] Environment variables สำหรับ API URL
- [x] Error handling ครบถ้วน
- [x] Responsive design

## 📋 ขั้นตอนการ Deploy

### 1. Backend Deployment

#### Environment Variables ที่ต้องตั้งค่า:
```env
DATABASE_URL=postgresql://user:password@host:port/database?schema=public
JWT_SECRET=your-strong-secret-key-here-minimum-32-characters
PORT=5000
```

#### Commands:
```bash
cd backend

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Start server
npm start
```

### 2. Frontend Deployment

#### Environment Variables:
สร้างไฟล์ `.env.production` หรือตั้งค่าบน hosting platform:
```env
VITE_API_URL=https://your-backend-url.com/api
```

#### Commands:
```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Deploy dist/ folder
```

## 🔧 แพลตฟอร์มที่แนะนำ

### Backend
- **Heroku** - ง่ายและมี PostgreSQL add-on
- **Railway** - รองรับ Prisma และ PostgreSQL
- **Render** - Free tier และรองรับ PostgreSQL
- **DigitalOcean App Platform**
- **AWS/Google Cloud/Azure**

### Frontend
- **Vercel** - เหมาะสำหรับ React + Vite
- **Netlify** - ง่ายและเร็ว
- **GitHub Pages**
- **Cloudflare Pages**

## ⚠️ ข้อควรระวัง

1. **Database**: ต้องใช้ PostgreSQL (ไม่ใช่ SQLite หรือ MySQL)
2. **JWT_SECRET**: ต้องใช้ secret key ที่แข็งแกร่งใน production
3. **CORS**: ตรวจสอบว่า CORS อนุญาตให้ frontend domain เข้าถึงได้
4. **File Upload**: ระบบเก็บรูปเป็น base64 ใน database ซึ่งอาจทำให้ database ใหญ่ ควรพิจารณาใช้ cloud storage (S3, Cloudinary) ในอนาคต
5. **Error Logging**: ควรเพิ่ม error logging service (Sentry, LogRocket)

## 📊 Performance Tips

1. **Image Optimization**: ควร compress รูปภาพก่อนอัพโหลด
2. **Database Indexing**: มี indexes อยู่แล้วสำหรับ userId และ date
3. **Pagination**: สำหรับ production ควรเพิ่ม pagination สำหรับ expenses list

## 🔍 การตรวจสอบหลัง Deploy

1. ✅ ตรวจสอบว่า backend รันได้และเชื่อมต่อ database ได้
2. ✅ ตรวจสอบว่า frontend เชื่อมต่อกับ backend API ได้
3. ✅ ทดสอบการ login/register
4. ✅ ทดสอบการ CRUD operations
5. ✅ ทดสอบการอัพโหลดรูปภาพ
6. ✅ ตรวจสอบ error logs

## 🐛 Troubleshooting

### Backend ไม่เชื่อมต่อ Database
- ตรวจสอบ DATABASE_URL
- ตรวจสอบ network/firewall
- ตรวจสอบว่า database server รันอยู่

### Frontend ไม่เชื่อมต่อ Backend
- ตรวจสอบ VITE_API_URL
- ตรวจสอบ CORS settings
- ตรวจสอบ network tab ใน browser

### รูปภาพไม่แสดง
- ตรวจสอบว่า base64 string ถูกเก็บครบถ้วน
- ตรวจสอบว่า blob size ไม่เกิน limit

---

**พร้อม Deploy แล้ว!** 🎉
