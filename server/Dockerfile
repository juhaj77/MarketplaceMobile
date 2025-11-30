# Production Dockerfile for Mini Marketplace server
FROM node:18-alpine AS base

WORKDIR /app

# Install dependencies separately for better caching
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm ci || npm install --production

# Copy source
COPY src ./src
COPY .env ./.env.example

ENV NODE_ENV=production

EXPOSE 4000

CMD ["node", "src/server.js"]
