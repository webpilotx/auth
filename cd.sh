#!/bin/bash

git pull
pnpm install
npx run migrate
pnpm run build
sudo systemctl restart auth.service