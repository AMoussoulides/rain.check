const express = require('express');
const router = express.Router();

//User Model
const User = require('../../db_models/User');

//Creating Routes

router.post('/',(req,res)=>{
    res.send('Register Page');
});

module.exports = router;