# ---- build stage ----
FROM node:20-slim AS build
WORKDIR /app

# Vite bakes these into the JS bundle at build time — must be set before
# `npm run build` runs, not at container-start time.
ARG VITE_BASE_URL
ARG VITE_BASE_WITHOUT_ORIGIN
ENV VITE_BASE_URL=${VITE_BASE_URL}
ENV VITE_BASE_WITHOUT_ORIGIN=${VITE_BASE_WITHOUT_ORIGIN}

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- runtime stage: serve the static build with nginx ----
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
