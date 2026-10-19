# SPOOPY PUP

A one-screen Halloween pixel pet. It opens on a welcome door: press **OPEN** to step inside.
Then press **TRICK** to change the puppy's costume
(ghost → pumpkin → bat → wizard → stripes → cinema mask → Frankenpup → repeat).
Press **TREAT** to feed it a candy and watch it hop, wag and float hearts.
The current costume is remembered in localStorage.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/ (relative paths, host anywhere)
```

## Structure

- `public/assets/` – the original art (scene, sprites, ui, effects)
- `src/App.jsx` – switches between the WELCOME and GAME screens
- `src/Welcome.jsx` + `src/welcome.css` – the door screen and opening animation
- `src/Game.jsx` – game logic (React state + localStorage)
- `public/assets/welcome/` – door layers, title, moon, stars, bats, lantern, OPEN button
- `source_art/welcome/` – your original uploaded welcome artwork
- `src/styles.css` – layout and CSS animations

## Deploy to GitHub Pages

1. Create a new GitHub repo (e.g. `spoopy-pup`) and push this folder to its `main` branch.
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Every push to `main` builds and deploys automatically (see the Actions tab).
   The game will be at `https://<your-username>.github.io/spoopy-pup/`.

Asset paths are relative (`base: './'` in `vite.config.js`), so it works under any repo name.

## Deploy to GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds the game and publishes it
on every push to `main`. One-time setup in the repo: **Settings → Pages →
Build and deployment → Source: GitHub Actions**. The site appears at
`https://<your-username>.github.io/spoopypup/`. All asset paths are relative,
so no base-path changes are needed.
