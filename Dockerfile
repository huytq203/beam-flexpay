# =============================================================================
# Stage 1: Build
# =============================================================================
FROM node:18-alpine AS builder
WORKDIR /app

# Enable Corepack for Yarn 4 (specified in package.json packageManager)
RUN corepack enable

# Copy dependency files first for better layer caching
COPY package.json yarn.lock .yarnrc.yml ./

RUN yarn install

COPY . .

# Increase Node memory for production build (React + Antd + TailwindCSS)
ENV NODE_OPTIONS="--max-old-space-size=8192"
RUN yarn build

# =============================================================================
# Stage 2: Serve
# =============================================================================
FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8000

CMD ["nginx", "-g", "daemon off;"]
