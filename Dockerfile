FROM node:18

WORKDIR /usr/src/app

COPY . .

EXPOSE 5000

CMD ["node", "index.js"]