@echo off
cd /d "c:\Users\ASUS\Downloads\YCWC_CPMMUNITY\ycwcbaru"
echo === Installing dependencies ===
npm install
echo === Building project ===
npm run build
echo === Deploying to Cloudflare Pages ===
npx wrangler pages deploy dist
pause
