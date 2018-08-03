# stage: build
FROM node:8-alpine as build

RUN npm config list

COPY package.json /tmp/package.json
# TODO: use yarn
RUN cd /tmp && npm install
RUN mkdir -p /viewer && mv /tmp/node_modules /viewer/

RUN mkdir -p /viewer/src
COPY src /viewer/src/
COPY *.json /viewer/
COPY *.js /viewer/
COPY *.lock /viewer/
WORKDIR /viewer
RUN ls -l

RUN npm run build

# stage: run
FROM node:8-alpine
RUN mkdir -p /viewer/dist
COPY --from=build /viewer/dist /viewer/dist/
COPY --from=build /viewer/*.json /viewer/
COPY --from=build /viewer/*.js /viewer/
COPY --from=build /viewer/*.lock /viewer/
WORKDIR /viewer
RUN npm install --production

EXPOSE 8080
CMD [ "npm", "run", "server-prod" ]