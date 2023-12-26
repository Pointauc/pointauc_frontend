FROM node:21 
WORKDIR /app 

RUN apt-get -qq update && apt-get -yqq install xdg-utils

COPY package.json /app 
COPY yarn.lock /app
RUN yarn install 

COPY . /app 
RUN yarn build

CMD yarn dev --host
EXPOSE 3000
