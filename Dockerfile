FROM mhart/alpine-node:15 as BUILDER

WORKDIR /app
ADD package.json /app/
RUN npm install

ADD ./src /app/src
ADD ./public /app/public
ADD tsconfig.json /app/
RUN npm run build

FROM mhart/alpine-node:15
RUN npm install -g http-server
COPY --from=BUILDER /app/build /app/build

WORKDIR /app/build
EXPOSE 3000
CMD hs -p 3000
