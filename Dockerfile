FROM node:latest

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
COPY live/urls.json ./src/lib/

ENV PORT=3000
ENV HOST=0.0.0.0
EXPOSE 3000

RUN npm run build

CMD ["node", "build"]

