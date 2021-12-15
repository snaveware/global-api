const Login = require('../utils/Login')

const {assert,expect} = require('chai')

describe('validate email function', ()=>{
    it('should return the passed object containing email and password', ()=>{
        const values = {email: "work.evans020@gmail.com", password: "12345678"}
        expect(Login.validate(values.email,values.password)).to.deep.equal({value: values})

    })
})
