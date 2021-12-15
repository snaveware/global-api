FROM node:alpine
WORKDIR /app
COPY package.json /app
RUN npm i
COPY . /app
ENV BASE_URL=http://localhost:5000
ENV DB_URI=mongodb+srv://shippingUser:shippingUser@cluster0.wo7nf.mongodb.net/shipping?retryWrites=true&w=majority
ENV SECRET=shipping
ENV PASSWORDSECRET=shippingpassword
ENV NODE_ENV=development
ENV PORT=80
ENV SENDGRID_API_KEY=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
CMD [ "npm", "start" ]