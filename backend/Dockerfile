FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 4000

# Прямой запуск команд вместо скрипта для гарантии выполнения миграций
CMD sh -c "sleep 10 && npx prisma db push --accept-data-loss && npx prisma generate && npm run start:prod"
