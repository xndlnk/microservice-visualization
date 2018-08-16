# stage: build
FROM node:8-alpine as build

RUN mkdir -p /viewer/src
COPY src /viewer/src/
COPY *.json /viewer/
COPY *.js /viewer/
COPY *.lock /viewer/

WORKDIR /viewer
RUN npm install
RUN npm run build

# stage: install prod packages & run
FROM node:8-alpine

RUN mkdir -p /viewer/dist
COPY --from=build /viewer/build /viewer/build/
COPY --from=build /viewer/*.json /viewer/
COPY --from=build /viewer/*.js /viewer/
COPY --from=build /viewer/*.lock /viewer/
RUN mkdir -p /viewer/src/frontend
COPY --from=build /viewer/src/frontend /viewer/src/frontend/

WORKDIR /viewer
# TODO: add lock file for npm. we use npm here because yarn somehow cannot just install without dev depedencies
RUN npm install --production

EXPOSE 8080
CMD [ "npm", "run", "server-prod" ]