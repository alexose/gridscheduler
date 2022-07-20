const fs = require("fs");
const http = require("http");
const express = require("express");
const app = express();
const port = 3000;
const SCHEDULE_PATH = "./schedule.json";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Create server
const server = http.createServer(app, port);
let schedule = fs.readFileSync(SCHEDULE_PATH);

app.use(express.json()); //For JSON requests
app.use(express.urlencoded({extended: true}));
app.use("/", express.static("dist"));
app.post("/schedule", (req, res) => {
    const obj = req.body;
    const str = JSON.stringify(obj);
    fs.writeFileSync(SCHEDULE_PATH, str);
    schedule = str;
    const segments = DAYS.map((d, i) => calculateSegments(d, i, obj));
    console.log(segments);
    res.send("ok");
});
app.get("/schedule", (req, res) => res.send(schedule));
server.listen(port, () => console.log(`Server listening at http://localhost:${port}`));

function calculateSegments(str, day, highlighted) {
    const results = [];
    const minutes = (60 * 24) / 5;
    let segment = null;
    for (let i = 0; i <= minutes; i++) {
        const key = `${day}-${i}`;
        const zone = highlighted[key];

        if (segment && segment.zone === zone) {
            segment.time += 5;
        } else if (segment && segment.zone !== zone) {
            results.push(segment);
            segment = null;
        } else if (zone) {
            segment = {zone, time: 5, begin: getTime(i)};
        }
    }
    return results;
}

function getTime(i) {
    // Work out locale time from increment
    const totalMinutes = i * 5;
    const hour = Math.floor(totalMinutes / 60);
    const minute = (totalMinutes % 60).toLocaleString("en-US", {
        minimumIntegerDigits: 2,
        useGrouping: false,
    });
    return `${hour}:${minute}`;
}
