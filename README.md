# Flame & Crust

Project បែងចែកជា frontend និង backend ដាច់ដោយឡែក៖

```text
frontend/   React + JavaScript + Vite + Tailwind CSS
backend/    Java 21 + Spring Boot + MySQL
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

## Backend + MySQL

```bash
cd backend
docker compose up -d mysql
mvn spring-boot:run
```

Backend runs at `http://localhost:8080`.

API endpoints:

- `GET /api/health`
- `GET /api/products`
- `GET /api/products/{category}`
