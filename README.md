# 📒 Notes App

A **multi-tenant notes management system** built with **Next.js 13+, TailwindCSS, and Drizzle ORM**.
This app supports **user authentication, tenant management, and collaborative note sharing** with role-based access control.

---

## 🚀 Features

* **Authentication**

  * Sign up, Sign in, Refresh tokens, Logout
* **Tenants**

  * Create, Update, Delete tenants
  * Join/Leave tenants
  * List all tenants or tenants you belong to
  * Upgrade tenant to Pro
* **Users**

  * Apply to join tenant
  * Leave tenant
* **Admin**

  * View join requests
  * Accept/Reject requests
  * Remove users from tenant
* **Notes**

  * Create, Read, Update, Delete notes inside tenants

---

## ⚡ Tech Stack

* **Frontend:** Next.js 13+ (App Router)
* **UI:** TailwindCSS (dark mode by default)
* **Database:** Drizzle ORM
* **Auth:** JWT-based authentication
* **API:** RESTful endpoints under `/api`

---

## 📦 Installation

1. Clone the repository

   ```bash
   git clone https://github.com/your-username/notes-app.git
   cd notes-app
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Set up environment variables in `.env.local`

   ```env
   DATABASE_URL=your_database_url
   JWT_SECRET=your_secret
   ```

4. Run database migrations (Drizzle ORM)

   ```bash
   npm run db:push
   ```

5. Start development server

   ```bash
   npm run dev
   ```

6. Open the app → [http://localhost:3000](http://localhost:3000)

---

## 🔑 API Endpoints

### Auth

| Method | Endpoint            | Body                          | Description   |
| ------ | ------------------- | ----------------------------- | ------------- |
| POST   | `/api/auth/sign_up` | `{username, email, password}` | Register user |
| POST   | `/api/auth/sign_in` | `{email, password}`           | Sign in user  |
| POST   | `/api/auth/refresh` | `{}`                          | Refresh token |
| POST   | `/api/auth/logout`  | `{}`                          | Logout user   |

### Tenant

| Method | Endpoint              | Body           | Description               |
| ------ | --------------------- | -------------- | ------------------------- |
| POST   | `/api/tenant`         | `{name, desc}` | Create tenant             |
| PUT    | `/api/tenant`         | `{name, desc}` | Update tenant             |
| DELETE | `/api/tenant`         | `{}`           | Delete tenant             |
| GET    | `/api/tenant/all`     | `{}`           | List all users in tenants |
| GET    | `/api/tenant/list`    | `{}`           | List all tenants          |
| POST   | `/api/tenant/upgrade` | `{}`           | Upgrade tenant to Pro     |

### User

| Method | Endpoint        | Body          | Description     |
| ------ | --------------- | ------------- | --------------- |
| POST   | `/api/user`     | `{tenant_id}` | Apply to tenant |
| DELETE | `/api/user/:id` | `{}`          | Leave tenant    |

### Admin

| Method | Endpoint         | Body         | Description        |
| ------ | ---------------- | ------------ | ------------------ |
| GET    | `/api/admin`     | `{}`         | List all requests  |
| DELETE | `/api/admin/:id` | `{}`         | Remove user        |
| POST   | `/api/admin/:id` | `{response}` | Respond to request |

### Notes

| Method | Endpoint        | Body                          | Description          |
| ------ | --------------- | ----------------------------- | -------------------- |
| POST   | `/api/note`     | `{title, content, tenant_id}` | Create note          |
| GET    | `/api/note/:id` | `{}`                          | List notes in tenant |
| PATCH  | `/api/note/:id` | `{title, content}`            | Update note          |
| DELETE | `/api/note/:id` | `{}`                          | Delete note          |

---

## 📂 Project Structure

```
/app
  /auth
    sign_in/page.tsx
    sign_up/page.tsx
  /tenants/page.tsx
  /notes/page.tsx
  /you/page.tsx
  /manage_tenant/page.tsx
/api
  /auth/*
  /tenant/*
  /user/*
  /admin/*
  /note/*
/db
  /schemas/*
/utils
  requestHandler.ts
  ApiResponse.ts
```

---

## 🛠️ Enviroment variable

```
DATABASE_URL=postgresql+asyncpg://notes_user:notes_pass@localhost:5432/notes_db
ACCESS_TOKEN_SECRET=shhh
REFRESH_TOKEN_SECRET=shh
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

- you can use this db string if you are using docker-compose file for db instance.
---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/awesome-feature`)
3. Commit changes (`git commit -m "Add awesome feature"`)
4. Push branch (`git push origin feature/awesome-feature`)
5. Open a Pull Request

---

## 📜 License

MIT License © 2025 Shivendra Devadhe
