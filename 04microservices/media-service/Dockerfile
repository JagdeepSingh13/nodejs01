FROM node:23-alpine

WORKDIR /use/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3003

CMD [ "node", "src/server.js" ]
