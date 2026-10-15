FROM node:22-alpine

WORKDIR /app

# Install FFmpeg and FFprobe
RUN apk add --no-cache ffmpeg

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY public ./public

EXPOSE 8000

CMD ["npm", "start"]