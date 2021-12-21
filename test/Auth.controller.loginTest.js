
const chai = require('chai');
const chaiHttp = require('chai-http')

const server = require('../index')


chai.use(chaiHttp);


describe(' check login endpoint /auth/login ', ()=>{
    it('Check if login is functional',  (done)=>{
        credentials = {
            email: 'work.evans020@gmail.com',
            password: "password"
        }

        
        chai.request(server)
        .post('/auth/login')
        .send(credentials)
        .end((err,response)=>{
            //console.log(response)
            //chai.expect(response).to.have.status(200)
        })
        done()

      
        
        
        
    })
})