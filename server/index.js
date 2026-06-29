// Install on personal network: npm install express socket.io cors
// Run with: node server/index.js  (or: nodemon server/index.js)
const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL ?? "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

app.use(cors({ origin: process.env.CLIENT_URL ?? "http://localhost:3000" }))
app.use(express.json())

// Track which users are in which rooms (workspaceId)
const rooms = new Map()

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`)

  // Join a workspace room
  socket.on("join-workspace", (workspaceId) => {
    socket.join(workspaceId)
    console.log(`${socket.id} joined workspace: ${workspaceId}`)
  })

  // Video processing complete — notify all workspace members
  socket.on("video-processed", ({ workspaceId, videoId, title }) => {
    io.to(workspaceId).emit("video-ready", { videoId, title })
  })

  // New video uploaded — notify workspace
  socket.on("video-uploaded", ({ workspaceId, video }) => {
    socket.to(workspaceId).emit("new-video", video)
  })

  // Folder created
  socket.on("folder-created", ({ workspaceId, folder }) => {
    socket.to(workspaceId).emit("new-folder", folder)
  })

  // Member joined workspace
  socket.on("member-joined", ({ workspaceId, user }) => {
    io.to(workspaceId).emit("new-member", user)
  })

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`)
  })
})

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }))

const PORT = process.env.PORT ?? 4000
server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`)
})
