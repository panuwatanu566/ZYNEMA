# 🎬 ZYNEMA - Movies & Series Streaming Platform

**ZYNEMA** คือเว็บแอปพลิเคชันสตรีมมิ่งภาพยนตร์และซีรีส์ พัฒนาด้วย **React 18 + TypeScript + Vite + TVMaze REST API** พร้อมระบบ **Authentication** แบบครบวงจร และระบบ **Authorization (Free vs 👑 VIP Premium)**

---

## 🚀 ฟีเจอร์หลัก (Key Features)

### 1. 🌐 การเชื่อมต่อ TVMaze API
- ดึงข้อมูลภาพยนตร์และซีรีส์แบบ Real-time จาก **TVMaze Open API** (`https://api.tvmaze.com`)
- **Live Search Modal**: ค้นหาซีรีส์/หนังได้ทันที พร้อมระบบ Debounce ป้องกันการยิง API ถี่เกินไป
- **Movie Catalog & Filtering**: กรองตามประเภท (Drama, Action, Sci-Fi, Comedy, Crime, Thriller, Fantasy) หรือกรองเฉพาะคอนเทนต์ VIP
- **Details & Cast**: แสดงเรื่องย่อ, เรตติ้ง, เครือข่าย (HBO, Netflix, AMC), รายชื่อนักแสดง และตัวละครจาก API
- **Fallbacks & Cache**: มีระบบ In-memory Cache และ Fallback Data พร้อมใช้งานตลอดเวลาแม้เครือข่ายช้า

### 2. 🔐 ระบบ Authentication
- **Register (สมัครสมาชิก)**:
  - ช่องกรอก: ชื่อ-นามสกุล, อีเมล, รหัสผ่าน, ยืนยันรหัสผ่าน
  - **Password Validation System**:
    - ตรวจสอบความยาวอย่างน้อย 8 ตัวอักษร
    - ต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว (A-Z)
    - ต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว (a-z)
    - ต้องมีตัวเลขอย่างน้อย 1 ตัว (0-9)
    - ต้องมีอักขระพิเศษอย่างน้อย 1 ตัว (`!@#$%^&*`)
    - แถบวัดความปลอดภัยรหัสผ่าน (Password Strength Meter: Weak / Medium / Strong)
    - Checklist แสดงเครื่องหมายถูกสีเขียวแบบเรียลไทม์
  - **Confirm Password**: ตรวจสอบการพิมพ์รหัสผ่านซ้ำแบบ Real-time
  - เลือกแพ็กเกจเริ่มต้นได้ (Free หรือ VIP)
- **Login (เข้าสู่ระบบ)**:
  - รองรับระบบ **Remember Me** (จำอีเมลไว้ในระบบ)
  - ปุ่ม Show/Hide สลับดูรหัสผ่าน
  - ปุ่ม 1-Click Demo Accounts สำหรับทดสอบได้ทันที:
    - Free Member: `free@zynema.com` (รหัส: `Demo1234!`)
    - VIP Premium: `premium@zynema.com` (รหัส: `Demo1234!`)
- **Logout (ออกจากระบบ)**: ล้างเซสชันอย่างปลอดภัยและอัปเดตหน้าจอทันที
- **Forgot Password (กู้คืนรหัสผ่าน)**:
  - ขั้นตอนที่ 1: ตรวจสอบอีเมลในระบบ
  - ขั้นตอนที่ 2: ตั้งรหัสผ่านใหม่ โดยผ่านเกณฑ์ Password Validation เดียวกัน
  - ขั้นตอนที่ 3: บันทึกรหัสผ่านใหม่ลงระบบพร้อมเข้าสู่ระบบได้ทันที

### 3. 👑 ระบบ Authorization (การจำกัดสิทธิ์ Free vs Premium)
- **สิทธิ์ผู้ใช้ทั่วไป (Free Member)**:
  - เข้าชมและค้นหาภาพยนตร์/ซีรีส์ได้ทั้งหมด
  - **รับชมฟรีเฉพาะ Episode 1 และ Episode 2** (ความละเอียด 720p HD)
  - มีแถบแจ้งเตือนเมื่อต้องการดูตอนที่ 3 เป็นต้นไป หรือดูเรื่องที่เป็น 4K Exclusive
- **สิทธิ์สมาชิกพิเศษ (👑 VIP Premium Member)**:
  - **ปลดล็อกทุกตอน (Episode 3+ เป็นต้นไป)**
  - รับชมด้วยความละเอียดสูงสุด **4K Ultra HD & HDR**
  - เครื่องหมายมงกุฎทอง (VIP Crown Badge) ในแถบนำทางและทุกคอมเมนต์
  - สตรีมมิ่งลื่นไหล ไม่มีโฆษณา
- **ระบบ Content Gating & Instant Upgrade**:
  - หากผู้ใช้ Free พยายามกดเล่น Episode 3 หรือภาพยนตร์ VIP หน้าจอจะแสดงหน้าต่าง **Lock Screen** พร้อมปุ่ม **"Unlock All Episodes"**
  - มีปุ่มสลับบทบาท Free ↔ Premium ได้ทันทีที่แถบด้านบนของหน้า Player และหน้า Profile เพื่อความสะดวกในการทดสอบฟังก์ชันสิทธิ์

---

## 📁 โครงสร้างโปรเจกต์ (Project Directory)

```
anime-react-ts/
├── public/                 # สื่อและสไตล์เดิม (css, fonts, img, videos)
├── src/
│   ├── components/         # คอมโพเนนต์ส่วนกลาง
│   │   ├── Breadcrumb.tsx      # แถบเส้นทาง Breadcrumb
│   │   ├── Footer.tsx          # ส่วนท้ายเว็บ ZYNEMA
│   │   ├── Header.tsx          # แถบนำทาง, สถานะผู้ใช้, ป้าย VIP/FREE, ปุ่ม Logout
│   │   ├── HeroSlider.tsx      # แบนเนอร์ภาพยนตร์ไฮไลท์ มีป้าย 4K VIP / Free HD
│   │   ├── MovieCard.tsx       # การ์ดภาพยนตร์จาก TVMaze พร้อมป้ายเรตติ้งและสถานะสิทธิ์
│   │   ├── PremiumModal.tsx    # โมดอลอัปเกรดเป็นสมาชิก VIP Premium
│   │   ├── SearchModal.tsx     # โมดอลค้นหา TVMaze API แบบเรียลไทม์
│   │   ├── SidebarNewComment.tsx # แถบข้างรีวิวหนังล่าสุด
│   │   └── SidebarTopViews.tsx # แถบข้างซีรีส์ยอดนิยมแยกตามช่วงเวลา
│   ├── context/
│   │   └── AuthContext.tsx     # ระบบ Authentication, Password Validation, และ Authorization
│   ├── pages/
│   │   ├── HomePage.tsx        # หน้าหลัก (Trending, VIP Exclusives, Free to Watch, Top Dramas)
│   │   ├── MoviesPage.tsx      # หน้ารวมแคตตาล็อก กรองแนวหนังและระดับสมาชิก (Free/VIP)
│   │   ├── MovieDetailsPage.tsx# หน้ารายละเอียดเรื่องย่อ นักแสดง และรีวิวจาก TVMaze
│   │   ├── MovieWatchingPage.tsx # หน้าเครื่องเล่นวิดีโอ มีระบบล็อกตอนสำหรับผู้ใช้ Free
│   │   ├── LoginPage.tsx       # หน้าเข้าสู่ระบบ (Remember Me + 1-Click Demo)
│   │   ├── SignupPage.tsx      # หน้าสมัครสมาชิก (Password Validation & Confirm Match)
│   │   ├── ForgotPasswordPage.tsx # หน้ารีเซ็ตรหัสผ่านแบบ Multi-step
│   │   ├── ProfilePage.tsx     # หน้าโปรไฟล์ผู้ใช้ และจัดการแพ็กเกจสมาชิก
│   │   ├── BlogPage.tsx        # หน้าบทความข่าวสารวงการภาพยนตร์
│   │   └── BlogDetailsPage.tsx # หน้ารายละเอียดบทความ
│   ├── services/
│   │   └── tvmazeApi.ts        # Client เชื่อมต่อ TVMaze REST API
│   ├── types/
│   │   └── zynema.ts           # Types & Interfaces (Show, Episode, Cast, User, Review)
│   ├── App.tsx                 # จุดศูนย์รวม Routing และ Provider
│   └── main.tsx
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🏃 วิธีการรันและทดสอบ (Running the Project)

1. เปิด Terminal / PowerShell แล้วไปที่โฟลเดอร์โปรเจกต์:
   ```powershell
   cd C:\Users\r11-1101\Documents\Web101\anime-react-ts
   ```

2. รันโหมด Development:
   ```powershell
   npm.cmd run dev
   ```
   *เข้าชมได้ที่: `http://localhost:3000`*

3. ทดสอบการเข้าสู่ระบบ:
   - บัญชี **Free User**: `free@zynema.com` | รหัสผ่าน: `Demo1234!`
   - บัญชี **VIP Premium**: `premium@zynema.com` | รหัสผ่าน: `Demo1234!`
   - หรือกดปุ่ม 1-Click ในหน้า Login ได้ทันที

4. ทดสอบระบบ Authorization (จำกัดสิทธิ์):
   - เข้าหน้าดูซีรีส์ (เช่น `http://localhost:3000/watch/82`)
   - หากเป็นผู้ใช้ **Free**: จะรับชมได้เฉพาะ Ep 01 และ Ep 02 เมื่อกด Ep 03 จะพบหน้าจอล็อกสิทธิ์และแจ้งให้อัปเกรด
   - หากเป็นผู้ใช้ **Premium**: จะสามารถคลิกดูได้ทุกตอนพร้อมป้ายกำกับ 4K UHD VIP
   - สามารถกดปุ่ม **"Switch to Premium Tier"** / **"Switch to Free Tier"** บนหน้าเว็บเพื่อสลับสิทธิ์ทดสอบได้ทันที!
"# ZYNEMA" 
