
const express=require("express")
const app=express()
const mongoose = require('mongoose');
const Gmail_temp = require("../models/index");


main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(process.env.DB_URL)
console.log("connected to database")
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}


const newGmail=async function () {
    await Gmail_temp.deleteMany({});
  
const mygmail= new Gmail_temp({

    title:"One  of a kind",
    content:`The best formates are waiting 
    for you ,just move your cursor`,
    images:[
      {url:"https://res.cloudinary.com/dsw8xzyyz/image/upload/v1737519103/My_Gmails_Layout/axkgj9sqdmpcy55rr72y.jpg",

      filename:"My_Gmails_Layout/hitrgxwokszubpl4pkpd"
    }
    ],
    logo:'https://png.pngtree.com/png-vector/20220525/ourmid/pngtree-spa-logo-png-image_4721219.png'

})
await mygmail.save()
}
newGmail().then(()=>{
  mongoose.connection.close();
})
