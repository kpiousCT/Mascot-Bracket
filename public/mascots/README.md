# Mascot Images Folder

This folder stores mascot images for all NCAA tournament teams.

## Adding Mascot Images

### Option 1: Admin Upload Interface (Recommended)
1. Go to http://localhost:3000/admin/mascots
2. Enter your admin password
3. Click "Choose File" for each team
4. Select the mascot image file
5. Image uploads automatically and updates immediately

### Option 2: Manual Upload
1. Save your mascot images to this folder (`public/mascots/`)
2. Name them descriptively (e.g., `duke.png`, `unc.png`)
3. Update the database with the image path:
   ```sql
   UPDATE teams SET mascot_image_url = '/mascots/duke.png'
   WHERE name = 'Duke Blue Devils';
   ```

## Image Specifications

**Recommended:**
- Size: 512x512px or larger
- Format: PNG (transparent background) or JPG
- Aspect Ratio: Square (1:1) works best
- File size: Under 500KB for fast loading

**Tips:**
- Use actual mascot character images, not logos
- High-quality, colorful images work best for kids
- Transparent backgrounds (PNG) look cleanest

## Finding Mascot Images

Good sources for mascot images:
1. Official university athletics websites
2. Google Images (search "[team name] mascot")
3. Wikipedia team pages
4. Social media accounts (Twitter/Instagram of mascots)

**Copyright Note:** Ensure you have permission to use mascot images, especially if the bracket is public or commercial.

## Current Status

After uploading, images are stored here and referenced by the database. The app will automatically display them in:
- Battle Mode (huge 300x300px)
- Overview Mode (40x40px thumbnails)
- Admin Panel
- Leaderboard

## Troubleshooting

If images don't appear:
1. Check that the file actually exists in `public/mascots/`
2. Verify the database has the correct path (should start with `/mascots/`)
3. Check browser console for image loading errors
4. Try clearing browser cache
5. Ensure image file format is supported (PNG, JPG, GIF, WebP)
