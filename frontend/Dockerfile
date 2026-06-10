FROM node:20-slim

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
RUN npm install

VOLUME /usr/src/app/node_modules

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
