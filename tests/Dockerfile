FROM mcr.microsoft.com/playwright:v1.38.0-jammy

RUN npm i -g pnpm

WORKDIR /canvas-styled-text

COPY ./package.json .
RUN pnpm i

COPY . .
