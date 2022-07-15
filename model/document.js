const mongoose=require('mongoose')
const Schema=mongoose.Schema

const userSchema=new Schema({
    Main_text:{
        required:true,
        type:String
    }
})

module.exports=mongoose.model('Document',userSchema)