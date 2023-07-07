FROM node:18
WORKDIR /usr/app
COPY server/.env server/.env
COPY server server
RUN cd server && npm install --production && npm run build
COPY client client
RUN cd client && npm install --production && npm run build
WORKDIR /usr/app/server/
CMD ["node", "dist/app.js"]