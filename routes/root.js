const express = require('express')
const router = express.Router()
const path = require('path')

router.get('^/$|/index(.html)?', (req, res) => { // only match if requested route is only a '/'... User could also request more than just slash
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'))
}) 

module.exports = router