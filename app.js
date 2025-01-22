if(process.env.NODE_ENV!=='production'){
  require("dotenv").config()
}
const express=require("express")
const app=express();
const ejs=require("ejs")
const methodOverride=require("method-override")
const ejsMate=require("ejs-mate")
const morgan=require("morgan");
const mongoose = require("mongoose");
app.use(morgan("tiny"))
const Gmail_temp=require("./models/gmail_temp")
app.use(express.urlencoded({ extended: true }));
const puppeteer=require("puppeteer")
const fetch = require("node-fetch");
const expressError=require("./utils/expressError")
const catchAsync=require("./utils/catchAsync")
const multer= require("multer")
const {storage}=require("./cloudinary")
const upload = multer({  storage });

async function convertToBase64(url) {
    const response = await fetch(url);
    const buffer = await response.buffer();
    return `data:image/jpeg;base64,${buffer.toString("base64")}`;
}


app.set("view engine","ejs")
app.engine("ejs",ejsMate)
const path=require("path")
app.use(methodOverride('_method'))

app.set("views",path.join(__dirname,"views"))

const dbUrl=process.env.DB_URL

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
console.log("connected to database")
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

app.get("/gmail_temp",catchAsync(async(req,res)=>{
  const gmail_temp= await Gmail_temp.find({});

  
    res.render("gmail/home",{gmail_temp})
}))

app.get("/gmail_temp/:id/edit", catchAsync(async(req,res)=>{
  const gmail_temp= await Gmail_temp.findById(req.params.id)
  console.log("***********")
  console.log(gmail_temp)
  res.render("gmail/edit",{gmail_temp})
}))



app.get("/gmail_temp/:id/download", catchAsync(async (req, res) => {
    const id = req.params.id;
    const gmail_temp = await Gmail_temp.findById(id);

    if (!gmail_temp) {
        return res.status(404).send("Template not found");
    }

    try {
        const logoBase64 = gmail_temp.logo 
            ? await convertToBase64(gmail_temp.logo) 
            : null;

        // Convert all image URLs in the images array to Base64
        const imageBase64Array = await Promise.all(
            gmail_temp.images.map(async (image) => {
                return image.url ? await convertToBase64(image.url) : null;
            })
        );

        // Filter out any null values (in case of invalid or missing URLs)
        const validImageBase64Array = imageBase64Array.filter((base64) => base64 !== null);

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${gmail_temp.title}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f9f9f9;
                    color: #333;
                }
                .container {
                    max-width: 800px;
                    margin: 20px auto;
                    padding: 20px;
                    background: #fff;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }
                .logo {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .logo img {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    border: 2px solid #ddd;
                }
                .title {
                    text-align: center;
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 20px;
                    color: #555;
                }
                .carousel {
                    display: flex;
                    overflow-x: scroll;
                    gap: 10px;
                    padding: 10px;
                }
                .carousel img {
                    width: 100%;
                    max-width: 700px;
                    height: auto;
                    border-radius: 8px;
                }
                .content {
                    text-align: center;
                    font-size: 18px;
                    line-height: 1.6;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">
                    ${logoBase64 ? `<img src="${logoBase64}" alt="Logo">` : ""}
                </div>
                <div class="title">
                    ${gmail_temp.title}
                </div>
                <div class="carousel">
                    ${validImageBase64Array
                        .map((base64) => `<img src="${base64}" alt="Carousel Image">`)
                        .join("")}
                </div>
                <div class="content">
                    ${gmail_temp.content}
                </div>
            </div>
        </body>
        </html>
        `;

        const browser = await puppeteer.launch({ ignoreHTTPSErrors: true });
        const page = await browser.newPage();

        // Set content and wait for resources to load
        await page.setContent(htmlContent, { waitUntil: "networkidle2" });

        // Generate the PDF
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
        });

        await browser.close();

        // Send PDF to the client
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${gmail_temp.title}.pdf"`);
        res.end(pdfBuffer);
    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).send("Failed to generate PDF");
    }
}));







app.post("/gmail_temp/", upload.array("image"),catchAsync(async(req,res)=>{
  
  console.log(req.body)
  const id = req.params.id; // Extract the ID from the URL
  
  const updatedData = req.body.gmail;
  

  const newGmail =new Gmail_temp(updatedData);
  newGmail.images=req.files.map(f=>({url:f.path,filename:f.filename}))
  
  await newGmail.save();

    res.redirect(`/gmail_temp/${newGmail._id}`)
}))
app.get("/gmail_temp/:id",catchAsync(async(req,res,next)=>{
  const id=req.params.id
  const gmail_temp= await Gmail_temp.findById(id)
res.render("gmail/show",{gmail_temp})
}))


app.all("*",(req,res,next)=>{
    next( new expressError("No page is found",404))
  
  })
  app.use((err,req,res,next)=>{
    if(err){
     const {message="something went wrong ",code=500}=err;
     res.status(code).render("error",{err})
   
    }
  })



app.listen(3000,(req,res)=>{
    console.log("server is running on port 3000")
})