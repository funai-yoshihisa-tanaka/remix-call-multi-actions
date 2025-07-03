FROM node:22

WORKDIR /app

RUN npm install -g typescript ts-node dotenv cross-env core-js ts-node