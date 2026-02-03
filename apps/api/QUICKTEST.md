# Campus OS API - Quick Test Guide

## ✅ Server Running
- **URL**: http://localhost:3000
- **Status**: All 48+ endpoints active

---

## 🧪 Test Endpoints

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. Get All Campuses
```bash
curl http://localhost:3000/api/v1/campuses
```

### 3. Login (Get JWT Token)
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\",\"password\":\"Password123\"}"
```

**Save the token from the response!**

### 4. Get Your Profile (Use token from login)
```bash
curl http://localhost:3000/api/v1/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Get Feed Posts
```bash
curl http://localhost:3000/api/v1/feed
```

### 6. Get Notes
```bash
curl http://localhost:3000/api/v1/notes
```

### 7. Search Courses
```bash
curl "http://localhost:3000/api/v1/courses?q=Data"
```

### 8. Create a Post (Use token)
```bash
curl -X POST http://localhost:3000/api/v1/feed \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"post_type\":\"text\",\"title\":\"My First Post\",\"body\":\"Hello Campus OS! This is amazing.\"}"
```

### 9. Get Articles
```bash
curl http://localhost:3000/api/v1/articles
```

### 10. Get Active Campus Update
```bash
curl "http://localhost:3000/api/v1/updates/active?campus_id=cmp_makerere"
```

---

## 👥 Test Accounts

### Student Account
- **Email**: john@example.com
- **Password**: Password123
- **Campus**: Makerere University
- **Reputation**: 50

### Moderator Account
- **Email**: jane@example.com
- **Password**: Password123
- **Campus**: Makerere University
- **Roles**: student, moderator
- **Reputation**: 150

### MUBS Account
- **Phone**: +256700123456
- **Password**: Password123
- **Campus**: MUBS

---

## 📊 Sample Data

The database now contains:
- ✅ 3 Campuses (Makerere, MUBS, Kyambogo)
- ✅ 4 Courses (Data Structures, Database Systems, Software Engineering, Financial Accounting)
- ✅ 3 Users (various roles and reputation levels)
- ✅ 1 Feed Post
- ✅ 1 Note (Data Structures - 5,000 UGX)

---

## 🎯 Next Steps

1. **Login** to get your JWT token
2. **Explore the feed** - see posts and interactions
3. **Browse notes** - check out the marketplace
4. **Create content** - test posting, commenting, reactions
5. **Test moderation** - use jane@example.com (moderator)

---

## 🔥 Advanced Features to Test

### Anonymous Posting
When creating a post, set `is_anonymous: true` to get a generated handle like "BlueBird123"

### Content Embeds
Reference internal content using:
- `campus://post/fp_xxxxx`
- `campus://note/nt_xxxxx`
- `campus://article/art_xxxxx`

### Polls
Create a poll by creating a post with `post_type: "poll"`, then add poll options

### Reputation System
- Like posts: +1 rep for author
- Download notes: +3 rep for author
- Rate notes highly: +4 rep for author

---

**Campus OS API** - Built with ❤️ for campus communities
