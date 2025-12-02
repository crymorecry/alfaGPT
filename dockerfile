FROM node:20.5.0

WORKDIR /app
COPY . .
RUN npm i --save
RUN npm run build
EXPOSE 3000
CMD sh -c "npx prisma migrate deploy && npm run seed && npm start"
