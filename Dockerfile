FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
RUN node scripts/prepare-public.cjs
ENV NODE_ENV=production PORT=3002 STATIC_ROOT=/app/public
EXPOSE 3002
CMD ["node", "server/index.cjs"]
