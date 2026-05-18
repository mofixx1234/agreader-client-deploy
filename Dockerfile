FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN npm install -g serve@14.2.5 \
  && addgroup -S app \
  && adduser -S app -G app

COPY --from=build --chown=app:app /app/dist ./dist

USER app

EXPOSE 4173

CMD ["serve", "-s", "dist", "-l", "4173"]
