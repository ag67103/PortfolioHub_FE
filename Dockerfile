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
# Where link-preview crawlers are sent for /u/<slug> pages (same API the app talks to)
ARG REACT_APP_API_BASE_URL=https://portfoliohub-api.thikana.cc
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN API_HOST=$(echo "$REACT_APP_API_BASE_URL" | sed -E 's#^https?://##; s#/.*$##') \
 && sed -i "s#__API_ORIGIN__#${REACT_APP_API_BASE_URL%/}#; s#__API_HOST__#${API_HOST}#" /etc/nginx/conf.d/default.conf \
 && nginx -t
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
