#!/bin/bash

git pull
pnpm install
npx drizzle-kit migrate
pnpm run build
sudo systemctl restart auth.service