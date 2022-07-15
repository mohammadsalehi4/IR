const express=require('express')
const app=express()
const bodyParser = require("body-parser");
const cors = require("cors");// <-- in nemidonam chera vali mohemme
const mongoose = require("mongoose");
const PORT = process.env.PORT || 4000; 
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const MONGOSE_URL = "mongodb://127.0.0.1:27017/IR";
const userRoutes=require('./routes/routes')
app.use('/',userRoutes)
app.listen(PORT, () => {
    console.log(`server is running on PORT:${PORT} `);
    mongoose
      .connect(MONGOSE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => console.log("connected to database"))
      .catch((e) => console.error(`CANNOT CONNECT TO DATABASE ${e}`));
});