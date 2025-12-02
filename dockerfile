FROM node:20.5.0-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci && npm cache clean --force

COPY prisma ./prisma

RUN npx prisma generate
RUN npm run seed
COPY . .

RUN npm run build

RUN npm prune --production
EXPOSE 3000


RUN echo '#!/bin/sh\nnpx prisma migrate deploy\nnpm start' > /app/start.sh && chmod +x /app/start.sh

CMD ["/app/start.sh"]