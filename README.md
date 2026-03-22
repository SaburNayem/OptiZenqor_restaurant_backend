# OptiZenqor Restaurant Backend

Production-oriented NestJS backend for a single restaurant brand with multiple branches. One unified API serves customer app, customer website, and restaurant dashboard.

## Stack
- NestJS + TypeScript
- PostgreSQL + Prisma ORM
- Redis caching
- JWT auth (access + refresh)
- Role-based + branch-scope authorization
- REST + Swagger
- Socket.IO realtime events
- Docker support

## Folder Structure

```text
.
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── config/
│   ├── common/
│   ├── gateways/
│   ├── prisma/
│   └── modules/
│       ├── auth/
│       ├── users/
│       ├── branches/
│       ├── categories/
│       ├── menu/
│       ├── offers/
│       ├── favorites/
│       ├── addresses/
│       ├── cart/
│       ├── orders/
│       ├── kitchen/
│       ├── payments/
│       ├── reviews/
│       ├── notifications/
│       ├── reports/
│       ├── settings/
│       └── uploads/
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
```

3. Generate Prisma client:
```bash
npm run prisma:generate
```

4. Run migrations:
```bash
npm run prisma:migrate
```

5. Seed data:
```bash
npm run seed
```

6. Start server:
```bash
npm run start:dev
```

## Swagger
- URL: `http://localhost:4000/docs`
- API Base: `http://localhost:4000/api/v1`

## Realtime (Socket.IO)
- Namespace: `/orders`
- Events:
  - `order.new`
  - `order.status`
  - `kitchen.queue`
  - `dashboard.refresh`

## Docker
```bash
docker compose up --build
```

## Seed Accounts (default password: `Password@123`)
- Super admin: `admin@optizenqor.com`
- Branch manager: `manager@optizenqor.com`
- Customer: `customer1@example.com`
