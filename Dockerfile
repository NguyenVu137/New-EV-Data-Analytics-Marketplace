FROM node:14-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies including dev dependencies (needed for babel)
RUN npm install

# Copy all source files
COPY . .

# Expose port
EXPOSE 6969

# Start the server using babel-node via npm start
CMD ["npm", "start"]

#docker build --tag node-docker
#docker run -p 8080:8080 -d node-docker