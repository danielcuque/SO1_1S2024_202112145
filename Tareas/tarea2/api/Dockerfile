FROM node:18-alpine

WORKDIR /api

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

EXPOSE 3001

CMD ["node", "index.js"]