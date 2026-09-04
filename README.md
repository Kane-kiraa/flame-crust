# 🍕 Flame & Crust — Food Ordering & Management Platform

<p align="center">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.5.4-brightgreen?style=for-the-badge&logo=springboot" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk" alt="Java 21" />
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-7-purple?style=for-the-badge&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/MySQL-8.4-00758f?style=for-the-badge&logo=mysql" alt="MySQL" />
  <img src="https://img.shields.io/badge/Docker-Supported-2496ed?style=for-the-badge&logo=docker" alt="Docker" />
</p>

---

## 📖 Overview

**Flame & Crust** គឺជាប្រព័ន្ធបញ្ជាទិញម្ហូប និងភីហ្សាទំនើប (Modern Food & Pizza Ordering E-Commerce Platform) ដែលត្រូវបានបង្កើតឡើងជាមួយ **React 19 + Vite** នៅលើ Frontend និង **Spring Boot 3 (Java 21) + MySQL** នៅលើ Backend រួមទាំងការតភ្ជាប់ប្រព័ន្ធទូទាត់ប្រាក់ **Bakong KHQR**។

---

## ✨ Features (លក្ខណៈពិសេស)

- 🍕 **Product & Menu Management:** ម៉ឺនុយភីហ្សា និងម្ហូបច្រើនជម្រើស ជាមួយការកំណត់ទំហំ តម្លៃ និងការតុបតែង។
- 🛒 **Interactive Cart & Ordering:** រទេះទំនិញងាយស្រួលប្រើ រៀបចំការកុម្ម៉ង់បានរហ័ស។
- 🇰🇭 **Bakong KHQR Payment Integration:** បង្កើត និងផ្ទៀងផ្ទាត់ QR Code សម្រាប់ទូទាត់តាមប្រព័ន្ធធនាគារក្នុងស្រុកដោយស្វ័យប្រវត្តិ។
- 🔐 **Authentication & Security:** ប្រើប្រាស់ **JWT (JSON Web Token)**, Spring Security និង Rate Limiting ជាមួយ Bucket4j។
- 📧 **Email Notifications:** ផ្ញើសារបញ្ជាក់ការទិញ និងវិក្កយបត្រតាម Email ដោយស្វ័យប្រវត្តិ។
- 📍 **Interactive Maps & Address:** ជ្រើសរើសទីតាំងដឹកជញ្ជូនតាមរយៈ Leaflet Map។
- 🎨 **Modern & Responsive UI:** រចនាបទស្អាតទាក់ទាញ ដំណើរការរលូនលើគ្រប់ឧបករណ៍ (Mobile & Desktop) ដោយប្រើ Tailwind CSS និង Framer Motion Animations។
- 🐳 **Docker & Cloud Ready:** គាំទ្រការ Deploy លើ Docker, Render, Vercel និង Aiven Cloud Database។

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19, Vite
- **Styling:** Tailwind CSS v4, Radix UI Components, Lucide Icons
- **State Management:** Zustand, TanStack Query
- **Payment & Map:** `bakong-khqr`, `qrcode.react`, Leaflet / React-Leaflet
- **Animations:** Framer Motion, Canvas Confetti

### Backend
- **Framework:** Spring Boot 3.5.4 (Java 21)
- **Security:** Spring Security, JWT (io.jsonwebtoken)
- **Database / ORM:** MySQL 8.4, Spring Data JPA, Flyway Migration
- **Tools & Libraries:** Lombok, Bucket4j (Rate Limiting), Spring Mail

### DevOps & Cloud
- **Containerization:** Docker (Multi-stage build)
- **Hosting:** Render (Backend API), Vercel (Frontend SPA), Aiven (Cloud MySQL)
- **CI/CD:** GitHub Actions

---

## 📂 Project Structure

```text
flame-crust/
├── backend/                # Spring Boot Backend API
│   ├── src/main/java/      # Java Controllers, Services, Repositories, Models
│   ├── src/main/resources/ # application.properties, db/ migrations
│   ├── pom.xml             # Maven dependencies
│   └── Dockerfile          # Backend Dockerfile
├── frontend/               # React + Vite Frontend
│   ├── src/                # Components, Pages, Hooks, Context, Assets
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite Configuration
├── .github/workflows/      # GitHub Actions CI/CD Pipeline
├── Dockerfile              # Root multi-stage Docker build
├── deploy.md               # 24/7 Deployment documentation
└── README.md               # Project documentation
```

---

## 🚀 Getting Started (ដំណើរការលើ Local Machine)

### ១. Prerequisites
- **Java:** JDK 21+
- **Maven:** 3.9+
- **Node.js:** 18+ ឬ 20+
- **MySQL Database:** 8.0+ ឬ Aiven Cloud MySQL

---

### ២. Clone Repository
```bash
git clone https://github.com/Kane-kiraa/flame-crust.git
cd flame-crust
```

---

### ៣. Backend Setup

1. ចូលទៅកាន់ folder `backend`:
   ```bash
   cd backend
   ```
2. បង្កើតឯកសារ `.env` (ឬកំណត់ក្នុង `application.properties`):
   ```env
   MYSQL_URL=jdbc:mysql://localhost:3306/flame_crust?createDatabaseIfNotExist=true&serverTimezone=UTC
   MYSQL_USER=root
   MYSQL_PASSWORD=your_mysql_password
   JWT_SECRET=your_super_secret_jwt_key_at_least_256_bits_long
   JWT_EXPIRATION=86400000
   MAIL_USERNAME=your_email@gmail.com
   MAIL_PASSWORD=your_email_app_password
   BAKONG_API_TOKEN=your_bakong_token
   PORT=8080
   ```
3. ដំណើរការ Backend:
   ```bash
   ./mvnw spring-boot:run
   ```
   API នឹងដំណើរការលើ `http://localhost:8080`

---

### ៤. Frontend Setup

1. ចូលទៅកាន់ folder `frontend`:
   ```bash
   cd ../frontend
   ```
2. ដំឡើង Dependencies:
   ```bash
   npm install
   ```
3. បង្កើតឯកសារ `.env`:
   ```env
   VITE_API_URL=http://localhost:8080
   ```
4. ដំណើរការ Frontend Dev Server:
   ```bash
   npm run dev
   ```
   Frontend នឹងដំណើរការលើ `http://localhost:3000`

---

## 🐳 Docker Support

អ្នកអាច build និង run backend តាមរយៈ Docker:

```bash
# Build Docker Image
docker build -t flame-crust-backend .

# Run Docker Container
docker run -p 8080:8080 \
  -e MYSQL_URL="jdbc:mysql://host.docker.internal:3306/flame_crust" \
  -e MYSQL_USER="root" \
  -e MYSQL_PASSWORD="your_password" \
  flame-crust-backend
```

---

## 🌐 Cloud Deployment (24/7 Free)

| Component | Platform | Configuration Summary |
| :--- | :--- | :--- |
| **Database** | [Aiven MySQL](https://aiven.io) | MySQL 8.4 Free Tier ជាមួយ SSL |
| **Backend** | [Render](https://render.com) | Docker Web Service + Cron-Job Keep-Alive Ping |
| **Frontend** | [cloudflared](https://cloudflare.com) | React/Vite Preset with `VITE_API_URL` env |

> 📖 សម្រាប់មេរៀន និងជំហានលម្អិតអំពីការ Deploy សូមមើលឯកសារ [deploy.md](deploy.md)។

---

## ⚙️ CI/CD Workflow

Repository នេះមានរៀបចំ GitHub Actions សម្រាប់ធ្វើការ Build និង Test ដោយស្វ័យប្រវត្តិ។
- ប្រសិនបើអ្នកចង់ **Push** ដោយរំលង CI/CD pipeline គ្រាន់តែបន្ថែម `[skip ci]` ទៅក្នុង commit message:
  ```bash
  git commit -m "Update docs [skip ci]"
  git push origin main
  ```

---

## 📄 License

This project is licensed under the MIT License.
