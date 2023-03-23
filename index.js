

const express = require("express");

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("public/index.html");
})


app.listen(PORT, () => console.log(`NUMERICAL METHOD CALCULATOR: Running at port ${PORT}`));

