FROM node:14-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p uploads/datasets
EXPOSE 8082
CMD ["npm", "start"]
