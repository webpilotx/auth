#!/bin/bash

git pull
pnpm install
pnpm run migrate
pnpm run build
sudo systemctl restart auth.service