var express = require('express');
var router = express.Router();
const userController=require('../controllers/controllers')
router.post('/',userController.addToDoc)
router.post('/search',userController.search)
module.exports=router;
