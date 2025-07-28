# --- STAGE 1: Build ---
FROM node:20 AS builder

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# --- STAGE 2: Serve with nginx ---
FROM nginx:stable-alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config (optional but recommended)
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
