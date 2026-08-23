# Market Maker Terminal — GitHub Pages

Static, self-contained build of the MM trading terminal. No server needed:
on `*.github.io` it talks **directly** to the public Robinhood RPC and Blockscout
(both CORS-enabled), so the `server.js` proxy is only used on `localhost`.

Files:
- `index.html` — the terminal (single file)
- `ethers.umd.min.js` — ethers v6 (vendored)
- `artifacts.js` — contract ABIs
- `.nojekyll` — disables Jekyll so nothing is stripped

## Deploy (org site — cleanest URL: https://market-maker-org.github.io/)

Create a repo named exactly `market-maker-org.github.io` under the
[Market-Maker-Org](https://github.com/Market-Maker-Org) org, then from this `pages/` folder:

```bash
cd pages
git init -b main
git add .
git commit -m "Market Maker terminal — static build"
git remote add origin https://github.com/Market-Maker-Org/market-maker-org.github.io.git
git push -u origin main
```

Then in the repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch → `main` / `/ (root)` → Save.**
Live within ~1 min at **https://market-maker-org.github.io/**

## Alternative (project site): https://market-maker-org.github.io/terminal/
Name the repo `terminal` instead and push the same files; enable Pages the same way.

## Custom domain
Add a `CNAME` file here containing your domain (e.g. `app.marketmaker.xyz`), set the
DNS `CNAME` → `market-maker-org.github.io`, then enable it under Settings → Pages.

## Updating
After editing `frontend/index.html`, re-sync and push:

```bash
pwsh ../deploy-pages.ps1   # copies frontend -> pages
cd pages && git add . && git commit -m "update" && git push
```

Admin/Deploy tools are intentionally **not** included here (owner-only, run locally).
