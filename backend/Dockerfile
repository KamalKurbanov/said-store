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

COPY ./scripts/start.sh ./scripts/start.sh
RUN chmod +x ./scripts/start.sh

CMD ["./scripts/start.sh"]
