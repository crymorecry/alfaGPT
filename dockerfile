FROM node:20.5.0

ENV DATABASE_URL="postgresql://postgres.tgkhsosffsnybqowikdc:VClYXonQweclGiXB@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
ENV NAME_EMAIL="mail@onvibe.fun"
ENV PASS_EMAIL="#3jbtSt_CXWr}d"
ENV OPENROUTER_API_KEY="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"

WORKDIR /app
COPY . .
RUN npm i --save
RUN npm run build
RUN npx prisma migrate
EXPOSE 3000
CMD ["npm", "start"]