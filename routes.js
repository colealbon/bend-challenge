// routes.js
var app = require('./app')

app.get('/', async function (req, res) {
  try {
    res.json(await api.index())
  } catch (err) {
    res.status(404).send('User not found')
  }
})
