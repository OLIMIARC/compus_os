# Campus OS

**A campus-scoped social + knowledge system**

> Campus OS is a campus social layer, student knowledge graph, learning marketplace, and cultural memory system.

## 📦 Project Structure

```
campus-os/
├── apps/
│   └── api/          # Backend API (Node.js + TypeScript + Express + Prisma)
└── package.json      # Workspace root
```

## 🚀 Quick Start

```bash
# Install dependencies
cd apps/api
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npm run prisma:migrate

# Start development server
npm run dev
```

Visit http://localhost:3000/health to verify the server is running.

## 📚 Documentation

- [API README](apps/api/README.md) - Architecture and features
- [Setup Guide](apps/api/SETUP.md) - Detailed installation and testing instructions

## 🎯 Core Features

### ✅ Implemented (Phase 1 - ~40%)

- **Authentication**: JWT-based auth with registration, login, profile management
- **Campuses & Courses**: Campus listing, course search with filters
- **Notes & Past Papers**: Create, purchase, download, review system with ratings
- **Infrastructure**: Complete middleware stack, utilities, reputation system

### 🚧 Coming Soon (Phase 2)

- **Feed System**: Posts, memes, polls with intelligent ranking
- **Campus Updates**: System notices for important announcements
- **Articles**: Long-form student-driven content
- **Content Embeds**: Internal knowledge graph
- **Timetable**: Class scheduling
- **Moderation**: Reports and moderation actions

## 🛠️ Tech Stack

- **Backend**: Node.js, TypeScript, Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: JWT with bcrypt
- **Validation**: Zod schemas
- **Image Processing**: Sharp

## 🏗️ Architecture

Clean monolithic architecture with modular organization:

- **Config**: Environment, database, auth, storage
- **Middleware**: Error handling, auth, campus scoping, anti-spam
- **Utilities**: Pagination, IDs, watermarking, reputation, feed ranking
- **Modules**: Domain-driven modules (auth, core, notes, feed, etc.)

## 📡 API Endpoints (Current)

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/me` - Get profile (protected)
- `PATCH /api/v1/me` - Update profile (protected)

### Core
- `GET /api/v1/campuses` - List campuses
- `GET /api/v1/courses` - Search courses

### Notes
- `GET /api/v1/notes` - List notes
- `POST /api/v1/notes` - Create note (protected)
- `GET /api/v1/notes/:id` - Get note details
- `POST /api/v1/notes/:id/purchase` - Purchase note (protected)
- `GET /api/v1/notes/:id/download` - Download note (protected)
- `POST /api/v1/notes/:id/review` - Review note (protected)

## 🔐 Security Features

- JWT authentication with 7-day tokens
- Password hashing with bcrypt
- Campus-scoped data access
- Anti-spam middleware (URL blocking, link farming prevention)
- Reputation-aware rate limiting
- Zod validation on all inputs

## 🎨 Design Philosophy

**Light-first, calm, academic-modern**

- Content is the hero
- Restraint over decoration
- Emotion via spacing + light
- Trust via consistency

## 📊 Database Schema

22 models across 8 domains:

- Core (User, Campus, Course)
- Content Embeds
- Campus Updates
- Notes & Reviews
- Feed & Polls
- Articles
- Timetable
- Moderation

See [schema.prisma](apps/api/src/prisma/schema.prisma) for full details.

## 🤝 Contributing

This is a greenfield project. See implementation plan and task list for roadmap.

## 📝 License

MIT

---

**Built with ❤️ for campus communities**
