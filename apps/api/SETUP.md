# Campus OS API - Setup Instructions

## Quick Start

1. **Install Dependencies**
```bash
cd apps/api
npm install
```

2. **Set Up Database**

Create a PostgreSQL database and update your `.env` file:

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and update DATABASE_URL
# Example: DATABASE_URL="postgresql://user:password@localhost:5432/campus_os?schema=public"
```

3. **Run Database Migrations**

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations to create tables
npm run prisma:migrate

# (Optional) Open Prisma Studio to view/edit data
npm run prisma:studio
```

4. **Seed Initial Data (Optional)**

You can manually add campuses and courses through Prisma Studio or create a seed script.

Example campuses to add:
- Makerere University (Kampala)
- MUBS (Kampala)
- Kyambogo University (Kampala)

5. **Start Development Server**

```bash
npm run dev
```

The server will start on http://localhost:3000

## Testing the API

### 1. Register a User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "password": "Password123",
    "campus_id": "cmp_001"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email_or_phone": "test@example.com",
    "password": "Password123"
  }'
```

Save the `token` from the response.

### 3. Get Campuses

```bash
curl http://localhost:3000/api/v1/campuses
```

### 4. Get Courses

```bash
curl "http://localhost:3000/api/v1/courses?campus_id=cmp_001&q=computer"
```

### 5. Create a Note (Protected)

```bash
curl -X POST http://localhost:3000/api/v1/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "campus_id": "cmp_001",
    "course_id": "crs_101",
    "title": "CSC101 Week 1-5 Notes",
    "description": "Comprehensive notes",
    "type": "notes",
    "year": 2026,
    "price_ugx": 1000
  }'
```

### 6. Get Notes

```bash
curl "http://localhost:3000/api/v1/notes?campus_id=cmp_001&type=notes"
```

## Environment Variables

All required environment variables are documented in `.env.example`:

- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - Secret for JWT signing (min 32 characters)
- `JWT_EXPIRES_IN` - Token expiration (default: 7d)
- `UPLOAD_DIR` - File upload directory (default: ./uploads)
- `MAX_FILE_SIZE` - Max file size in bytes (default: 10MB)
- `PLATFORM_NAME` - Platform name for branding
- `WATERMARK_TEXT` - Watermark text for images

## Next Steps

The following modules are planned but not yet implemented:

- [ ] Feed Module (posts, memes, polls)
- [ ] Campus Updates Module (system notices)
- [ ] Articles Module (long-form content)
- [ ] Timetable Module
- [ ] Reports & Moderation Module
- [ ] File upload handling for notes
- [ ] Embed system integration

## Database Schema

The complete schema is defined in `src/prisma/schema.prisma` with 22 models covering:

- Core (User, Campus, Course)
- Content Embeds
- Campus Updates
- Notes & Reviews
- Feed & Polls
- Articles
- Timetable
- Moderation

View the schema file for full details on relationships and constraints.

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Verify database exists

### Migration Errors

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Then run migrations again
npm run prisma:migrate
```

### Port Already in Use

Change the PORT in your `.env` file to a different port.

## Production Deployment

For production:

1. Set `NODE_ENV=production` in `.env`
2. Use a strong JWT_SECRET (generate with: `openssl rand -base64 32`)
3. Use environment variables instead of `.env` file
4. Set up proper PostgreSQL database (not local)
5. Configure file storage (S3 or similar)
6. Set up SSL/TLS
7. Configure rate limiting

```bash
# Build for production
npm run build

# Start production server
npm start
```
