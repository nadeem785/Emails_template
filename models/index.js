const express= require("express")
const app = express()
const mongoose=require("mongoose")
const schema=mongoose.Schema;



const gmailSchema=new schema({
    title:String,
    content:String,
    images:[
      {
        url:String,
        filename:String
      }

    ],
    logo:String


})

module.exports=mongoose.model("Gmail_temp",gmailSchema)