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



const ExerciseSchema = new mongoose.Schema({
  description: {type:String, required: true},
  duration: {type:Number, required: true},
  date: String
})

const UserSchema = new mongoose.Schema({
  username:{type: String, required: true},
  log: [ExerciseSchema]
})

const User = mongoose.model('User', UserSchema)
const Exercise = mongoose.model('Exercise', ExerciseSchema)

app.use(cors())
app.use(express.static('public')) 
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', async (req, res, next)=>{
  try {
    let users = await User.find()
    return res.json(users)
  } catch (error) {
    return res.send(error)
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
      return res.json(obj)
    })
  } catch (error) {
    return res.send(error)
  }
}) 

app.post('/api/users/:id/exercises', async (req, res, next)=>{
  let {id} = req.params
  let {description, duration, date} = req.body
  let responseObject = {}

  const newExercise = new Exercise({
    description,
    duration,
    date
  })

  if(newExercise.data === ''){
    newExercise.date = new Date().toISOString().substring(0,10)
  }

  User.findByIdAndUpdate(id, {$push:{log:newExercise}},{new:true},(err, updated)=>{
    if(!err){
        responseObject._id=updated.id,
        responseObject.username=updated.username,
        responseObject.description= newExercise.description,
        responseObject.duration=newExercise.duration,
        responseObject.date=newExercise.date
        responseObject = responseObject.toJSON()
        responseObject.count  = updated.log.length
      res.json(
        responseObject
      )
    }
  })
  // if(typeof description !== 'string') return res.json({error: "la descripcion tiene que ser una cadena"})
  // if(typeof duration !== 'number') return res.json({error: "la descripcion tiene que ser un numero"})
  // let dateGive = new Date(Date.parse(date))
  // dateGive.setMinutes(dateGive.getMinutes() + dateGive.getTimezoneOffset())
  // console.log(dateGive)
  // if(dateGive && dateGive.toString() == "Invalid Date") return res.json({error: "la descripcion tiene que ser una cadena"})
  // let todayDate = new Date()
  // let newLog = {
  //   description,
  //   duration: Number(duration),
  //   date: date ? dateGive.toDateString() : todayDate.toDateString()
  // }
  // let responseObject = {
  //   _id,
  //   username: '',
  //   description,
  //   duration: Number(duration),
  //   date: newLog.date
  // }

  //   let user = await User.findById(_id)
  //   user.count+=1
  //   user.log.push(newLog)
  //   responseObject.username = user.username
  //   let finish = await user.save()
  //   res.json(responseObject)
})


app.get('/api/users/:id/logs', async (req, res, next)=>{
  let {id} = req.params
  let responseObject = {}
  try {
    let userFound = await User.findById(id).select({__v:0})
     res.send(userFound)
  } catch (error) {
    return res.send(error)
  }
})


 
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
