# 🏀 Mascot Madness - NCAA Tournament Bracket

A fun twist on NCAA Men's Basketball Tournament brackets where users select winners based on mascot images instead of team names!

## Features

- **Mascot-Based Selection**: Pick winners by mascot images with team names revealed on hover
- **User Brackets**: Simple name-based bracket creation (no authentication required)
- **Admin Panel**: Password-protected interface to update real game results
- **Live Leaderboard**: Real-time score updates powered by Supabase subscriptions
- **Smart Scoring**: Weighted points system (1, 2, 4, 8, 16, 32) based on tournament rounds

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL + Realtime)
- **Hosting**: Vercel-ready

## Current Progress

✅ **Completed**:
- Next.js project structure with TypeScript and Tailwind CSS
- Complete database schema with all tables and relationships
- Supabase client configuration
- Database service layer with query functions
- Scoring calculation algorithm
- API endpoints:
  - `GET /api/teams` - Fetch all teams
  - `GET /api/games` - Fetch tournament games
  - `GET /api/brackets?userName={name}` - Get user bracket
  - `POST /api/brackets` - Create new bracket
  - `PUT /api/brackets/[id]/picks` - Update bracket picks
  - `GET /api/leaderboard` - Get current standings
  - `GET /api/master` - Get master bracket results
  - `POST /api/master` - Update game results (admin only)

🚧 **Remaining**:
- Fix npm cache permissions and install dependencies
- Build bracket visualization component
- Implement user bracket creation flow
- Create admin panel with authentication
- Build leaderboard with real-time updates

## Getting Started

### Prerequisites

1. **Node.js** (v18 or later)
2. **Supabase Account** (free tier works great)

### Setup Instructions

#### 1. Fix NPM Cache (if needed)

```bash
# Run this command if you encounter npm permission errors
sudo chown -R $(whoami) ~/.npm
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** to get your project URL and anon key
3. Go to **SQL Editor** and run the schema:
   - Copy contents of `lib/db/schema.sql`
   - Paste and execute in SQL Editor
4. Run the seed data:
   - Copy contents of `lib/db/seed.sql`
   - Paste and execute in SQL Editor

#### 4. Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env.local

# Edit .env.local with your values:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_PASSWORD=your-secure-password
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Database Schema

### Key Tables

- **teams**: Tournament teams with mascot info
- **games**: Tournament bracket structure (67 games)
- **user_brackets**: User information
- **bracket_picks**: User's game selections
- **master_bracket**: Actual tournament results (admin updates)
- **leaderboard_scores**: Precomputed scores for performance

### Scoring Algorithm

Points are awarded based on correct picks in each round:
- Round of 64: **1 point**
- Round of 32: **2 points**
- Sweet 16: **4 points**
- Elite 8: **8 points**
- Final Four: **16 points**
- Championship: **32 points**

Scores are automatically recalculated when admin updates game results via database triggers.

## Project Structure

```
Mascot-Bracket/
├── app/                        # Next.js App Router
│   ├── api/                   # API routes
│   │   ├── brackets/         # Bracket CRUD operations
│   │   ├── games/            # Tournament games
│   │   ├── leaderboard/      # Scores and rankings
│   │   ├── master/           # Admin updates
│   │   └── teams/            # Team data
│   ├── bracket/              # User bracket page (TO BUILD)
│   ├── leaderboard/          # Leaderboard page (TO BUILD)
│   ├── admin/                # Admin panel (TO BUILD)
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles
├── lib/
│   ├── db/
│   │   ├── schema.sql        # Database schema
│   │   ├── seed.sql          # Sample data
│   │   └── client.ts         # Database queries
│   ├── scoring/
│   │   └── calculator.ts     # Scoring logic
│   ├── supabase/
│   │   └── client.ts         # Supabase client
│   └── types.ts              # TypeScript definitions
├── components/               # React components (TO BUILD)
├── public/
│   └── mascots/              # Mascot images (TO ADD)
└── package.json
```

## Next Steps

### Phase 1: Install Dependencies & Test
1. Fix npm cache permissions
2. Run `npm install`
3. Set up Supabase project
4. Configure environment variables
5. Test API endpoints

### Phase 2: Build UI Components
1. Create bracket visualization component
2. Build user bracket creation flow
3. Implement admin panel
4. Build leaderboard with real-time updates

### Phase 3: Add Mascot Images
- Option A: Collect mascot images manually and place in `public/mascots/`
- Option B: Integrate with ESPN API for team data
- Update seed data with actual image paths/URLs

### Phase 4: Deploy
1. Push to GitHub
2. Import to Vercel
3. Configure environment variables in Vercel
4. Deploy and test

## Mascot Images

For the best experience, you'll need mascot images for all 68 teams. Options:

1. **Manual Collection**: Download mascot images and place in `public/mascots/`
2. **ESPN API**: Use ESPN's sports API to fetch team logos/mascots
3. **Placeholder**: Use a service like [UIAvatars](https://ui-avatars.com) temporarily

Update the `mascot_image_url` field in the teams table accordingly.

## Admin Panel Usage

1. Navigate to `/admin`
2. Enter admin password (set in `.env.local`)
3. Select winners for completed games
4. Scores update automatically for all users

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Troubleshooting

### NPM Permission Errors
```bash
sudo chown -R $(whoami) ~/.npm
npm cache clean --force
npm install
```

### Supabase Connection Issues
- Verify environment variables in `.env.local`
- Check Supabase project is active
- Ensure database schema is deployed

### API Errors
- Check browser console and terminal for error messages
- Verify all tables exist in Supabase
- Test API endpoints in browser or Postman

## Future Enhancements

- User authentication for persistent brackets
- Email notifications for leaderboard updates
- Bracket comparison view
- Historical tournament data
- Mobile app version
- Social sharing features
- Prize/reward integration

## License

MIT License - feel free to use for your tournament pools!

---

Made with ❤️ for March Madness
