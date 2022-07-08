# stage: build
FROM node:12.14.1-alpine

RUN mkdir -p /app/src
COPY src /app/src/
COPY *.json /app/
COPY *.lock /app/

WORKDIR /app
RUN yarn install
RUN apk update && apk add --no-cache openssh-client git bash

# TODO: Usually the latest tadis-analyzer is installed and has all the dependencies.
#   So after the new tadis-analyzer has been released to npm, we can remove the snapshot here.
#   Until then you can just copy the build directory to tadis-analyzer-snapshot.
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
