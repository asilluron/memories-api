module.exports = function (server) {
	var ioServer = io(server);
 
	ioServer.on('connection', function (socket) {
		socket.emit("connection", "welcome");
	});

	ioServer.on('joinRoom', function (msg, socket) {
		socket.join(msg);
	});

	return function generateMemoryIoHandler(memoryId) {
		var ns = ioServer.of(memoryId);
		ns.on("chatMessage", function () {
			ns.emit(msg);
		});

		var memoryIo = {
			newMilestone: function broadcastNewMilestone(milestoneId) {
				ns.emit("milestone", {
					action: "new",
					id: milestoneId
				});
			}
		};

		return memoryIo;
	};

};

// var socketHandler = require("socketService.js")(server);
// // new memory..
// var memorySocketHandler = socketHandler(memoryId);
// memorySocketHandler.newMilestone(id);

// milestone
// moment
// user
// edit


// milestone
// id
// notifications
// edit
// user
// moment


// user connects
// return list of memories



// server
// 


// client
// 



// var memoryIo = io.of(memoryId)
// memoryIo.emit("")

// memoryIo.to(milestoneId)
// any time a milestone updates
// userSocket.emit("name", data)
// memoryIo.to