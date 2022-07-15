const mongoose=require('mongoose')
const Schema=mongoose.Schema

const userSchema=new Schema({
    word:{
        required:true,
        type:String
    },
    address:[{
        required:true,
        type:String
    }]
})

module.exports=mongoose.model('index',userSchema)