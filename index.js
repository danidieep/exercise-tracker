const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const { urlencoded } = require('body-parser')
const bodyParser = require('body-parser');
require('dotenv').config()
const MONGO_URI='mongodb+srv://daniAdmin:YJnkgxhbtE99bSJr@cluster0.yenpvps.mongodb.net/fcc-users?retryWrites=true&w=majority'
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

const userSchema = new mongoose.Schema({
  username:{type: String, required: true},
  count:{type: Number, default: 1},
  log: []
})

const User = mongoose.model('User', userSchema)

app.use(cors())
app.use(express.static('public')) 
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', async (req, res, next)=>{
  try {
    let users = await User.find()
    res.json(users)
  } catch (error) {
    res.send(error)
  }
})

app.post('/api/users', async (req, res, next)=>{
  let userName = req.body.username
  let obj ={}
  try { 
    User.create({username: userName}, (err, done) =>{
      if(err) console.log(err)
      obj.username = done.username
      obj._id = done._id
      res.json(obj)
    })
  } catch (error) {
    res.send(error)
  }
}) 

app.post('/api/users/:id/exercises', async (req, res, next)=>{
  let {id} = req.params
  let {description, duration, date} = req.body
  let newLog = {
    description,
    duration,
    date: date ? date : new Date().toLocaleDateString('en-US')
  }
  try {
    let userFound = await User.findById(id, (err, done)=>{
      if(err) console.log(err)
      console.log(done, "SOY DONE ")
      done.log = [...done.log, newLog]
      done.count+=1
      done.save((err, data)=>{
        if(err) console.log(err)
        res.json(data)
      })
    })
  } catch (error) {
    res.send(error)
  }
})
app.get('/api/users/:id/logs', async (req, res, next)=>{
  let {id} = req.params
  try {
    let userFound = await User.findById(id)
    res.json(userFound)
  } catch (error) {
    res.send(error)
  }
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
