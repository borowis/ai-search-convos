FROM node:18-alpine
WORKDIR /app
RUN apk add --update --no-cache python3 build-base
COPY . .
RUN npm install
CMD ["npm", "run", "dev"]
