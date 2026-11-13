# Build the React app, then serve the static files with nginx.
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Create React App bakes these in at build time.
ARG REACT_APP_API_BASE_URL=https://portfoliohub-api.thikana.cc
ARG REACT_APP_WS_BASE_URL=wss://portfoliohub-api.thikana.cc
ARG REACT_APP_API_TIMEOUT=10000
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL \
    REACT_APP_WS_BASE_URL=$REACT_APP_WS_BASE_URL \
    REACT_APP_API_TIMEOUT=$REACT_APP_API_TIMEOUT \
    GENERATE_SOURCEMAP=false
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
