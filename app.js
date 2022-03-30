const express = require("express");
const app = new express();
const path = require("path");
app.use(express.static('assets'));

let port = process.env.PORT;
if (!port){
    port = 4000;
}
app.listen(port, () => {
    console.log("App listening...")
});

app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'));
});