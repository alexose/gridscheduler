const fs = require("fs");
const http = require("http");
const express = require("express");
const app = express();
const port = 3000;
const SCHEDULE_PATH = "./schedule.json";

// Create server
const server = http.createServer(app, port);
let schedule = fs.readFileSync(SCHEDULE_PATH);

app.use(express.json()); //For JSON requests
app.use(express.urlencoded({extended: true}));
app.use("/", express.static("dist"));
app.post("/schedule", (req, res) => {
    const str = JSON.stringify(req.body);
    fs.writeFileSync(SCHEDULE_PATH, str);
    schedule = str; 
    res.send("ok");
});
app.get("/schedule", (req, res) => res.send(schedule));
server.listen(port, () => console.log(`Server listening at http://localhost:${port}`));
