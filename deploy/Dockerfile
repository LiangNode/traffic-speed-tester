FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY app/package.json ./package.json
COPY app/server.js ./server.js
COPY app/public ./public
EXPOSE 8080
CMD ["node", "server.js"]
