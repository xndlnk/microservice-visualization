FROM node:8-alpine

RUN npm config list

# TODO: maybe try multi-stage build: https://ueberdosis.io/artikel/schlanke-docker-images-mit-multi-stage-builds/
COPY package.json /tmp/package.json
# TODO: use yarn
RUN cd /tmp && npm install
RUN mkdir -p /viewer && cp -a /tmp/node_modules /viewer/

RUN mkdir -p /viewer/src
COPY src /viewer/src/
COPY *.json /viewer/
COPY *.js /viewer/
COPY *.lock /viewer/
WORKDIR /viewer
RUN ls -l

RUN npm run build

EXPOSE 8080
CMD [ "npm", "run", "server" ]