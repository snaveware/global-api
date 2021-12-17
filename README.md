# Global

### Description

APIs for the global shipping management system



### Running the project locally

The API is hosted  [Here](https://global-shipping-api.herokuapp.com/);

Make sure to set the following environment variables:

1. BASE_URL=http://localhost:5000
2. DB_URI=mongodb+srv://shippingUser:shippingUser@cluster0.wo7nf.mongodb.net/shipping?retryWrites=true&w=majority
3. SECRET=shipping
4. PASSWORDSECRET=shippingpassword
5. NODE_ENV=development
6. PORT=5000
7. SENDGRID_API_KEY=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



#### Start the surver by running:

**node index.js**
*or**
**npm start**

*or (if you are using nodemon)*

**npm run dev**


### Running the project using Docker image 

1. Make sure docker is installed in your system
2. Run the following 2 commands

 docker pull snave020/global-api:latest
    
 docker run -d -p 5000:80 snave020/global-api 

*you can change port 5000 to whatever port you wish*

*the server will say started on port 80 but you should access through port 5000 or the given system port*

*You can  remove the -d flag to make the container run in the terminal*

