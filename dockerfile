FROM node:20.5.0

ENV DATABASE_URL="postgresql://gen_user:D%23%3Dbj2o%25E-%3AT%7C%3D@c2becc99498fd0f3046204f4.twc1.net:5432/default_db"
ENV NAME_EMAIL="mail@onvibe.fun"
ENV PASS_EMAIL="#3jbtSt_CXWr}d"
ENV OPENROUTER_API_KEY="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"
ENV OPENROUTER_MODEL="openai/gpt-oss-20b:free"
ENV TELEGRAM_BOT_TOKEN="8533092302:AAGO7ytlkySEHMssemrkZv719h3_5zyEXCA"
ENV TELEGRAM_CHAT_ID="1364654007"

WORKDIR /app
COPY . .
RUN npm i --save
RUN npm run build
RUN npx prisma migrate
EXPOSE 3000
CMD ["npm", "start"]