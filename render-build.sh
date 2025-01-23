#!/usr/bin/env bash
# Update and install Puppeteer dependencies
apt-get update && apt-get install -y \
    libnss3 \
    libatk-1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libxss1 \
    libxcomposite1 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libasound2 \
    libgtk-3-0

echo "Dependencies installed successfully."
