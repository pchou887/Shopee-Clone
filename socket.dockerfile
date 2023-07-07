FROM node:18
WORKDIR /usr/app
COPY socket/.env socket/.env
COPY socket socket
RUN cd socket && npm install && npm run build
COPY hyperushle hyperushle
WORKDIR /usr/app/socket/
CMD ["node", "dist/socket.js"]