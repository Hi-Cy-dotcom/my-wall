# MY WALL

A 2008-style wall application built with Next.js 16, React 19, TypeScript, Tailwind CSS, and Supabase. Features real-time updates and a nostalgic Web 2.0 aesthetic.

## Features

- Post messages with a 280-character limit
- Live character counter (gray → amber at 240 → red at 270)
- Real-time feed updates via Supabase Realtime with live status indicator
- Posts persist across page refreshes
- Relative timestamps that update every 30 seconds (shared timer)
- Optimistic posting with "Sending…" state
- Draft autosave to localStorage
- Pagination with "Show older posts" button
- New posts pill when scrolled down
- 2008 Web 2.0 aesthetic (blue gradient header, subtle bevels, small radius)
- Editable author name (saved to localStorage)
- Profile card on desktop with post count
- Square avatars with consistent colors per author
- Slide-in animation with yellow flash for new posts
- Mobile-responsive with 44px tap targets and 16px font to prevent iOS zoom
- Respects `prefers-reduced-motion`
- No login required

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Supabase (Database + Realtime)

## Prerequisites

- Node.js 18+ installed
- A Supabase project (free tier works)

## Supabase Setup

### 1. Run the SQL Setup

Copy the contents of `supabase-setup.sql` and run it in your Supabase SQL Editor to create the `posts` table and enable realtime.

### 2. Run the Storage Setup

Copy the contents of `storage-setup.sql` and run it in your Supabase SQL Editor to create the storage bucket for profile images.

### 3. Run the Posts Image Setup

Copy the contents of `posts-image-setup.sql` and run it in your Supabase SQL Editor to add the `image_url` column to the posts table for image support.

### 4. Get Your Supabase Credentials

In the Supabase dashboard:

1. Go to **Settings** → **API**
2. Copy the **Project URL** (this is your `NEXT_PUBLIC_SUPABASE_URL`)
3. Copy the **anon** / **public** key (this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

The anon key is safe to use in client-side code as it has restricted permissions via RLS policies.

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important**: Never commit `.env.local` to git. It's already in `.gitignore`.

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/mywall.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings

### 3. Add Environment Variables

During the Vercel setup or after deployment:

1. Go to your project **Settings** → **Environment Variables**
2. Add these variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key

### 4. Deploy

- If you added variables during initial setup: Click "Deploy"
- If you added variables after first deployment: Click "Redeploy"

Your app will be live at `https://your-project.vercel.app`

## File Structure

```
mywall/
├── app/
│   ├── globals.css          # Global styles with Tailwind
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main page component
├── components/
│   ├── Header.tsx           # Blue gradient header with posting as label
│   ├── ShareBox.tsx         # Input with auto-grow, draft, Ctrl+Enter, cooldown
│   ├── Feed.tsx             # Feed with pagination and live status
│   ├── PostItem.tsx         # Post with square avatar and relative time
│   ├── PostSkeleton.tsx     # Loading skeleton
│   ├── NewPostsPill.tsx     # Floating pill for new posts
│   ├── LiveStatus.tsx       # Connection status indicator
│   └── ProfileCard.tsx      # Desktop sidebar with profile info
├── lib/
│   ├── supabase.ts          # Supabase client
│   └── utils.ts             # Helper functions (relative time, avatar color)
├── hooks/
│   ├── useNow.ts            # Shared timer for relative timestamps
│   ├── useDraft.ts          # localStorage draft autosave
│   └── usePosts.ts          # Posts hook with fetch, paginate, realtime
├── types.ts                 # TypeScript types
├── supabase-setup.sql       # SQL setup script
├── .env.local.example       # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
└── README.md
```

## Testing the App

1. **Post a message**: Type in the box and click "Share"
2. **Verify persistence**: Refresh the page - your post should still be there
3. **Test character limit**: Try typing more than 280 characters
4. **Test realtime**: Open the app in two browser tabs - posts should appear in both without refresh
5. **Check Supabase**: Go to Supabase Table Editor to see your posts

## Troubleshooting

### Posts not saving
- Check that your Supabase credentials in `.env.local` are correct
- Verify the SQL setup was completed successfully
- Check the browser console for errors

### Realtime not working
- Ensure you ran the `ALTER PUBLICATION supabase_realtime ADD TABLE posts;` command
- Check Supabase dashboard → Replication to confirm the table is enabled

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Delete `.next` folder and run `npm run dev` again

## License

MIT
