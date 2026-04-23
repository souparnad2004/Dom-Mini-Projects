import "dotenv/config"

import express from "express"
import {createServer} from "node:http"
import { Server } from "socket.io";
import path from "node:path";
import { fileURLToPath } from "node:url";
import connectDB from "./db/db.js";
import { Check } from "./db/check.model.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const server = createServer(app);
const port = process.env.PORT || 4000;
const io = new Server(server);

await connectDB();

async function getState() {
    const checkedItems = await Check.find({
        checked: true
    }, {index: 1, _id: 0});

    const checkedList = checkedItems.map(item => item.index);
    const totalCount = checkedList.length;
    return {
        checkedList, 
        totalCount
    }
}

app.use(express.static("public"))

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname , "public"))
})

let globalCount = 0;

async function updateGlobalCount() {
    const state = await getState();
    globalCount = state.totalCount;
}

await updateGlobalCount();


io.on('connection', async (socket) => {
    let {checkedList, totalCount} = await getState();
    socket.emit("init-state", {checkedList, totalCount})

    socket.on("checkbox-change", async (data) => {
        const {id, checked} = data;

        await Check.updateOne(
            {index: id},
            {$set: {checked}},
            {upsert: true}
        )
        
        if(checked) globalCount++;
        else globalCount--;
        

        io.emit("checkbox-change", {
            index: id,
            checked,
            totalCount: globalCount,
        });
    })
})

server.listen(port, () => {
    console.log(`server running at http://localhost:${port}`)
})