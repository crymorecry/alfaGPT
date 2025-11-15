FROM node:20.5.0

WORKDIR /app
COPY . .
RUN npm i --save
RUN npm run build
RUN npx prisma migrate
EXPOSE 3000
CMD ["npm", "start"]