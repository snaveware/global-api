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

const emails = require('./routers/emails.router')
app.use('/emails',emails)

const groups = require('./routers/groups.router')
app.use('/groups',groups)



console.log('environment=',process.env.NODE_ENV)
// const authRouter = require('./routes/auth.route')
// app.use('/auth',authRouter)

// const usersRouter = require('./routes/users.route')
// app.use('/users',usersRouter)

// const manifestsRouter = require('./routes/manifests.route')
// app.use('/manifests',manifestsRouter)


// const shipmentsRouter = require('./routes/shipments.route')
// app.use('/shipments',shipmentsRouter)

// const userGroupsRouter = require('./routes/userGroups.route')
// app.use('/groups',userGroupsRouter)

// const fileRouter = require('./routes/file.route')
// app.use('/file',fileRouter)

app.get('/',(req,res) =>{
   console.log(req.query)
   res.send('welcome shipping api')
})


app.listen(process.env.PORT|5000,()=>{
   console.log(`server running on port ${process.env.PORT|5000}`)
})





