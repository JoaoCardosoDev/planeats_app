# Builder stage
FROM node:18-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
# Ensure package-lock.json or yarn.lock is also copied if present
# For npm, it's usually package.json and package-lock.json
# If using yarn, it would be package.json and yarn.lock
RUN npm install
COPY . .
RUN npm run build

# Final stage
FROM node:18-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/node_modules ./node_modules
# next.config.js might not exist initially for a barebones Next.js app,
# but it's good to include if planned.
# If it's optional, the COPY command might fail if the file doesn't exist in builder.
# Consider making this copy conditional or ensuring next.config.js is created.
COPY --from=builder /usr/src/app/next.config.js ./next.config.js
EXPOSE 3000
CMD ["npm", "start"]
