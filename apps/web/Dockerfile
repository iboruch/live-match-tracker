FROM node:20-alpine

WORKDIR /app

COPY apps/web/package.json apps/web/package.json
WORKDIR /app/apps/web
RUN npm install

COPY apps/web ./

EXPOSE 3000
CMD ["npm", "run", "dev"]
