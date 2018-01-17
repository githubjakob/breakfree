FROM node:alpine

ADD . /

RUN npm install

CMD ["npm", "run-script", "start"]