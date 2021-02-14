FROM node:14-alpine

RUN mkdir /usr/share/runner

COPY . /usr/share/runner

WORKDIR /usr/share/runner

RUN npm install

cmd ["node", "log-maker.js"]