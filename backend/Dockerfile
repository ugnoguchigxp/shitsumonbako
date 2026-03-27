FROM node:22-alpine AS backend-builder
WORKDIR /app
COPY backend/package.json ./package.json
RUN npm install
COPY backend .
RUN npm run build

FROM node:22-alpine AS frontend-builder
WORKDIR /app
ARG VITE_ADMIN_PATH=/internal/ndtj-admin
ENV VITE_ADMIN_PATH=$VITE_ADMIN_PATH
COPY frontend/package.json ./package.json
RUN npm install
COPY frontend .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY backend/package.json ./package.json
RUN npm install --omit=dev
COPY --from=backend-builder /app/dist ./dist
COPY --from=frontend-builder /app/dist ./public
EXPOSE 8787
CMD ["node", "dist/index.js"]
