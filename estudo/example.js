const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const AccountModel = mongoose.model('Account')

module.exports = () => {
  router.post('/signup', async (req, res) => {
    const { email, password, repeatPassword } = req.body
    if (password === repeatPassword) {
      const user = await AccountModel.create({ email, password, repeatPassword })
      return res.status(200).json(user)
    }

    return res.status(400).json({ error: 'Password must be equal to repeatPassword' })
  })
}
