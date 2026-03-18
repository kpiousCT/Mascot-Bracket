# Setup Instructions

## Database Setup

Run these SQL files in your Supabase SQL Editor in order:

### 1. Create Schema
Run [lib/db/schema.sql](lib/db/schema.sql) first to create all tables and functions.

### 2. Seed Data
Run [lib/db/seed.sql](lib/db/seed.sql) to populate 64 teams and 63 games.

### 3. Link Games (Important!)
Run [lib/db/seed-with-links.sql](lib/db/seed-with-links.sql) to connect games so winners automatically advance to next round.

## Features

### Regional Organization
Bracket is organized by region (East, West, South, Midwest) for easier navigation.

### Progressive Bracket Filling
When you pick a winner in Round of 64, they automatically appear in Round of 32. Pick all the way through to the championship before any games start!

### How It Works
1. Pick winners for Round of 64 games (1v16, 8v9, etc.)
2. Your picks automatically populate the next round
3. Continue picking through Round of 32, Sweet 16, Elite 8
4. Final Four matchups appear based on your regional champions
5. Pick your champion!

All picks are predictions - you fill out the entire bracket before the tournament starts.
