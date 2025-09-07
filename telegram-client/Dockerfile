# Multi-stage build for Telegram client
FROM node:20-alpine as base

# Install dependencies
RUN apk add --no-cache libc6-compat curl
WORKDIR /usr/src/app

# Install dependencies based on package.json
COPY package*.json ./
RUN npm ci && npm cache clean --force

FROM base as development
# Copy source code
COPY . .

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 telegram --ingroup nodejs

# Change ownership of the app directory
RUN chown -R telegram:nodejs /usr/src/app
USER telegram

EXPOSE 3001

CMD ["npm", "run", "start:dev"]

FROM base as production
# Copy built application
COPY --from=development --chown=telegram:nodejs /usr/src/app/dist ./dist
COPY --from=development --chown=telegram:nodejs /usr/src/app/node_modules ./node_modules

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 telegram --ingroup nodejs
USER telegram

EXPOSE 3001

CMD ["npm", "run", "start:prod"]