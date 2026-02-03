# Campus OS API

**A campus-scoped social + knowledge system**

Campus OS is a campus social layer, student knowledge graph, learning marketplace, and cultural memory system. It is NOT a newsroom, NOT a portal, NOT a generic social app.

## 🎯 Core Identity

- **Campus-scoped experience**: Single-campus UX with multi-campus capability (hidden, future-safe)
- **Feed-first**: Primary content discovery through intelligent feed algorithm
- **Student-driven**: Content created by and for students
- **Calm, credible, expressive**: Light-first design with restraint over decoration
- **Infrastructure mindset**: Built for scale and reliability

## 🏗️ Architecture

**Clean monolithic architecture** with modular organization:

```
apps/api/
├── src/
│   ├──config/          # Environment, database, auth, storage configuration
│   ├── lib/             # Utilities, pagination, IDs, watermark, reputation, embeds, feed ranking
│   ├── middleware/      # Error handling, auth, roles, campus scoping, anti-spam, validation
│   ├── modules/         # Domain modules (auth, core, notes, feed, updates, articles, etc.)
│   └── prisma/          # Database schema
└── package.json
```

## 📦 Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **Image Processing**: Sharp (watermarking)
- **Validation**: Zod
- **File Uploads**: Multer

## 🗄️ Database Schema

**22 Models** organized across domains:

- **Core**: User, Campus, Course
- **Content Embeds**: ContentEmbed (knowledge graph)
- **Campus Updates**: CampusUpdate (system notices)
- **Notes**: Note, NoteFile, NotePurchase, NoteReview
- **Feed**: FeedPost, FeedComment, FeedReaction, FeedRepost, Poll, PollOption, PollVote
- **Articles**: Article, ArticleRead
- **Timetable**: TimetableEntry
- **Moderation**: Report, ModerationAction

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Navigate to API directory
cd apps/api

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Update .env with your database credentials and secrets

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

### Environment Variables

Required variables (see `.env.example`):

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT signing (min 32 chars)
- `PORT` - Server port (default: 3000)
- `UPLOAD_DIR` - Directory for file uploads

## 📡 API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/me` - Get current user profile (protected)
- `PATCH /api/v1/me` - Update user profile (protected)

### More endpoints coming...

## 🎨 Design Philosophy

**Light-first, calm, academic-modern**

- Content is the hero
- Restraint over decoration  
- Emotion via spacing + light
- Trust via consistency
- Soft gradients, rounded geometry
- Depth through light, not noise

## 🔐 Security Features

- **JWT Authentication**: 7-day tokens
- **Password Hashing**: bcrypt with salt rounds
- **Campus Scoping**: Enforced at middleware level
- **Anti-Spam**: URL blocking, link farming prevention
- **Rate Limiting**: Reputation-aware limits
- **Input Validation**: Zod schemas on all endpoints

## 🎯 Content Embed System

Internal knowledge graph through content embedding:

- Max 1 embed per source
- Same-campus validation only
- Minimum 40 chars original text required
- No external URLs allowed
- Embed influence boost (+0.2x engagement)
- Self-embed abuse detection

## 📊 Feed Ranking Algorithm

Intelligent content ordering:

1. **Campus Update** (if active)
2. **Engagement anchor** (top meme/poll)
3. **Utility injection** (article/note)
4. **Social posts** (ranked by score)
5. **Infinite scroll**

**Time-based decay**:
- Memes: Spike fast, decay fast
- Articles: Persist longest
- Polls: Medium persistence

**Boosts**:
- New user visibility protection (+30%)
- Embed influence (+20% per embed)
- Reputation-based reach

## 🏆 Reputation System

Campus-scoped reputation affecting:

- Rate limits (higher rep = higher limits)
- Content reach (reputation affects ranking)
- Featured article eligibility (100+ rep required)

**Reputation signals**:
- +1: Like on your content
- +2: Article read
- +5: Article completion, cross-user embed
- +3: Note download
- +4: Positive note rating (≥4 stars) 
- -2: Negative note rating (<3 stars)
- -10: Self-embed spam
- -15: Verified report against you

## 🛠️ Development

```bash
# Run development server with auto-reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# View database in Prisma Studio
npm run prisma:studio
```

## 📝 License

MIT

---

**Built with ❤️ for campus communities**
