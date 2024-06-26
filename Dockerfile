FROM node:18.15.0 AS demo-cdk-development

WORKDIR /home/node/app

RUN apt-get update && \
    apt-get install -y -qq --no-install-recommends \
    awscli

RUN npm install -g aws-cdk

CMD npm run dev


FROM demo-cdk-development AS demo-cdk

WORKDIR /home/node/app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

CMD npm run start
