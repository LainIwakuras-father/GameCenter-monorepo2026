# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Включаем corepack для pnpm
RUN corepack enable

# Копируем только манифесты — кешируется отдельно
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Ставим строго по lock-файлу
RUN pnpm install --frozen-lockfile
# # Copy package files
# COPY package*.json ./

# # Patch package.json to update @types/node to a version compatible with Vite 7.x
# RUN sed -i 's/"@types\/node":\s*"^18.19.0"/"@types\/node": "^20.19.0"/' package.json

# # Install dependencies with the updated version
# RUN npm install

# Copy the rest of the code and build the app
COPY . .

ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# --- Stage 2: serve ---
FROM nginx:1.27-alpine

# Copy the built artifacts from the previous stage (Vite outputs to 'dist' by default)
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]