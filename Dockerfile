#Creating a new image from the node image.
FROM node:14.17.5 as base
#Setting the working directory to /usr/src/app.
WORKDIR /usr/src/app
#Installing a specific version of npm.
RUN npm i -g npm@7.20.1
#Copying the package.json and package-lock.json files from the root of the project to the working directory.
COPY package*.json ./
#Installing the dependencies from the package-lock.json file.
RUN npm ci

#Copying the entire project to the working directory.
COPY . .
#Running the build script from the package.json file.
RUN npm run build

#Creating a new image from the node image.
FROM node:14.17.5-alpine as prod
#Setting the environment variable NODE_ENV to production.
ARG NODE_ENV=production
#Copying the package.json and package-lock.json files from the root of the project to the working directory.
COPY package*.json ./
#Installing the production dependencies from the package.json file.
RUN npm i --only=production
#Setting the working directory to /usr/src/app.
WORKDIR /usr/src/app
#Copying the dist folder from the base image to the current image.
COPY --from=base /usr/src/app/dist ./dist
#Changing the owner of the dist folder to the node user.
RUN chown node:node -R /usr/src/app/dist
#Changing the user to the node user.
USER node
#Running the main.js file from the dist folder.
CMD ["node","dist/main"]