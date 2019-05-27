# stage: build
FROM node:10.14-jessie-slim as build

RUN mkdir -p /app/src
COPY src /app/src/
COPY test /app/test/

COPY *.json /app/
COPY *.lock /app/
COPY entrypoint.sh /

WORKDIR /app
RUN yarn install
RUN yarn test
RUN yarn build

# stage: install prod packages & run
FROM node:10.14-alpine

RUN apk update && apk add --no-cache openssh-client git bash

RUN mkdir -p /app/build
COPY --from=build /app/build /app/build/
COPY --from=build /app/*.json /app/
COPY --from=build /app/*.lock /app/
COPY --from=build /entrypoint.sh /

WORKDIR /app
RUN yarn install --production

RUN mkdir -p /app/temp

ARG VERSION
ENV VERSION=$VERSION
EXPOSE 8080

WORKDIR /
CMD [ "./entrypoint.sh" ]