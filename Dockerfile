FROM node:14.17.5 as base
WORKDIR /usr/src/app
RUN npm i -g npm@7.20.1
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:14.17.5-alpine as prod
ARG NODE_ENV=production
COPY package*.json ./
RUN npm i --only=production
WORKDIR /usr/src/app
COPY --from=base /usr/src/app/dist ./dist
RUN chown node:node -R /usr/src/app/dist
USER node
CMD ["node","dist/main"]