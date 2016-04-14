FROM nodesource/node:4.0

ADD package.json package.json  
RUN npm install  
ADD . .  

EXPOSE 7777

CMD ["node","./server.js"]