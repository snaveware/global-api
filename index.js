const express = require('express')
const app = express()
const fs = require('fs')
require('dotenv').config()
require('./database')()
const cors = require('cors')

app.use(cors())
var path = require('path');
global.appRoot = path.resolve(__dirname);



app.use(express.json())


//routers middlewares
const auth = require('./routers/auth.router')
app.use('/auth',auth)

const users = require('./routers/users.router')
app.use('/users',users)

const manifest = require('./routers/manifests.router')
app.use('/manifests',manifest)

const shipments = require('./routers/shipments.router')
app.use('/shipments',shipments)

const files = require('./routers/files.router')
app.use('/files',files)


const groups = require('./routers/groups.router')
app.use('/groups',groups)




app.get('/',(req,res) =>{
   console.log(req.query)
   res.send('welcome shipping api')
})


app.listen(process.env.PORT|5000,()=>{
   console.log(`server running on port ${process.env.PORT|5000}`)
})





