# OnlineGarage Backend API

Comprehensive backend for the OnlineGarage platform — an on-demand mechanic booking service.

## Tech Stack
- Node.js & Express.js
- PostgreSQL & PostGIS (via Prisma ORM)
- Redis & Socket.io for Real-time Tracking
- JWT Authentication (Multi-role)
- Stripe Payments (Escrow)
- Cloudinary (File Uploads)

## Setup

1. Install dependencies
```bash
npm install
```

2. Setup Environment Variables
```bash
cp .env.example .env
# Edit .env with your PostgreSQL, Redis, Stripe, and Cloudinary credentials
```

3. Setup Database (Requires PostGIS extension enabled in PostgreSQL)
```bash
npx prisma migrate dev
```

4. Seed Database
```bash
npm run db:seed
```

5. Start Development Server
```bash
npm run dev
```

## PostGIS Note
Since Prisma does not natively support PostGIS geometry columns, the `location` column on `MechanicProfile` is commented out in the schema. In a production scenario, you would create an empty migration, manually add the SQL to create the `location` column, and uncomment the related code in `services/service.service.js`.
