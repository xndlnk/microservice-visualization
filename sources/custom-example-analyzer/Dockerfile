# stage: build
FROM node:12.14.1-alpine as build

RUN mkdir -p /app/src
COPY src /app/src/
COPY *.json /app/
COPY *.lock /app/

WORKDIR /app
RUN yarn install
RUN yarn build

# stage: install prod packages & run
FROM node:12.14.1-alpine

RUN apk update && apk add --no-cache openssh-client git bash

RUN mkdir -p /app/build
COPY --from=build /app/build /app/build/
COPY --from=build /app/*.json /app/
COPY --from=build /app/*.lock /app/

WORKDIR /app
RUN yarn install --production

# TODO: REMOVE and RETEST after new tadis-analyzer version is released
RUN rm -rf /app/node_modules/tadis-analyzer
RUN mkdir /app/node_modules/tadis-analyzer
COPY tadis-analyzer-snapshot /app/node_modules/tadis-analyzer/

COPY entrypoint.sh /

RUN mkdir -p /app/temp

ARG VERSION
ENV VERSION=$VERSION
EXPOSE 8080

WORKDIR /
CMD [ "./entrypoint.sh" ]
