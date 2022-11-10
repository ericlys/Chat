import express from "express";
import path from "path";
import {createServer} from "http";
import { Server } from "socket.io"
import mongose from "mongoose";

const app = express();

const server = createServer(app);

mongose.connect("mongodb://localhost/chat")

app.use(express.static(path.join(__dirname, "..", "public")))

const io = new Server(server);

io.on("connection", (socket) => {
  console.log("Socket", socket.id)
})

app.get("/", (request, response) => {
  return response.json({
    message: 'hello websocket'
  })
})

export {server,io}