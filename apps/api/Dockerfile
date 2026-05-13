FROM node:20-alpine

WORKDIR /app

COPY apps/api/package.json apps/api/package.json
WORKDIR /app/apps/api
RUN npm install

COPY apps/api ./

EXPOSE 4000
CMD ["npm", "run", "dev"]
