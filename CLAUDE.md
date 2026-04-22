# Bitcoin Keynote 2026

## Project structure
- `app/` — Vite + React app (run commands from here)
- Arcade components, icons, avatars, and CSS tokens are local in `app/src/assets/`
- No external project dependencies — everything is self-contained

## Dev server
```
cd app && npm run dev
```

## Deploy to GitHub Pages
The site is hosted at https://tmknsm.github.io/BitcoinKeynote2026/

Deploy is a two-step process — build locally, then push to gh-pages:
```
cd app
npm run build
touch dist/.nojekyll
npx gh-pages -d dist --dotfiles
```

The `gh-pages` branch has its own GitHub Actions workflow that serves the files.
There is no CI build — the project must be built locally because it depends on
local fonts and assets that are bundled by Vite.

## Push code updates to GitHub
```
git add <files>
git commit -m "message"
git push
```
Pushing to `main` does NOT auto-deploy. You must run the deploy steps above
to update the live site.

## Important notes
- Always build from `app/` directory
- `.nojekyll` is required in dist — without it GitHub Pages tries to process
  files through Jekyll and fails on large binary assets
- `--dotfiles` flag is required so gh-pages includes `.nojekyll`
- The `@` path alias was removed — all imports use relative paths
- Footage videos are in `app/public/assets/Footage/` and get copied to dist as-is
