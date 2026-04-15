const usersInRoom = {};

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join-meeting", ({ meetingId, userName }) => {
      socket.join(meetingId);

      if (!usersInRoom[meetingId]) {
        usersInRoom[meetingId] = [];
      }

      const exists = usersInRoom[meetingId].some((u) => u.socketId === socket.id);
      if (!exists) {
        usersInRoom[meetingId].push({ socketId: socket.id, userName });
      }

      socket.emit(
        "all-users",
        usersInRoom[meetingId].filter((u) => u.socketId !== socket.id)
      );

      socket.to(meetingId).emit("user-joined", {
        socketId: socket.id,
        userName
      });
    });

    socket.on("sending-signal", ({ userToSignal, callerId, signal, userName }) => {
      io.to(userToSignal).emit("user-joined-signal", {
        signal,
        callerId,
        userName
      });
    });

    socket.on("returning-signal", ({ signal, callerId }) => {
      io.to(callerId).emit("receiving-returned-signal", {
        signal,
        id: socket.id
      });
    });

    socket.on("send-message", ({ meetingId, message, userName }) => {
      io.to(meetingId).emit("receive-message", {
        userName,
        message,
        createdAt: new Date()
      });
    });

    socket.on("disconnecting", () => {
      const rooms = [...socket.rooms];

      rooms.forEach((room) => {
        if (usersInRoom[room]) {
          usersInRoom[room] = usersInRoom[room].filter(
            (user) => user.socketId !== socket.id
          );
          socket.to(room).emit("user-left", { socketId: socket.id });

          if (usersInRoom[room].length === 0) {
            delete usersInRoom[room];
          }
        }
      });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};

export default socketHandler;
