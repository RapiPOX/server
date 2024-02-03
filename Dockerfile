FROM node:18-buster-slim AS base
# FROM node:18-alpine AS base

RUN ["addgroup", "--system", "--gid", "1001", "nodejs"]
RUN ["adduser" , "--system", "--uid", "1001", "nodejs"]

RUN apt-get update
RUN apt-get install -y git python3 build-essential

FROM base AS dependencies

WORKDIR /app
COPY . ./

RUN ["npm", "i", "-g", "pnpm"]
RUN ["npm", "i", "-g", "esbuild"]
RUN ["pnpm", "i", "--frozen-lockfile", "--prod"]

FROM dependencies AS build

WORKDIR /app
RUN ["pnpm", "build"]

FROM build AS runner

WORKDIR /app
USER nodejs
ENV NODE_ENV production
ENV PORT     3000
EXPOSE 3000

ENTRYPOINT ["node", "dist/index.js"]