FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS build
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4321
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY scripts/check-production.mjs ./scripts/check-production.mjs
USER node
EXPOSE 4321
HEALTHCHECK --interval=20s --timeout=3s --start-period=10s --retries=3 CMD node -e "fetch('http://127.0.0.1:4321/health/ready').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["sh", "-c", "node ./scripts/check-production.mjs && node ./dist/server/entry.mjs"]
