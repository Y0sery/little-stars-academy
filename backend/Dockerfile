FROM node:20-alpine

WORKDIR /app

# Install native dependencies required for sqlite3 build if needed
RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm ci --only=production

COPY . .

# Create uploads and recordings directories
RUN mkdir -p uploads/recordings public

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "server.js"]
