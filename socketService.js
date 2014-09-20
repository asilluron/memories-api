module.exports = function(server) {
	var SocketIO = require('socket.io');
	var ioServer = SocketIO.listen(server.listener);

	ioServer.on('connection', function(socket) {
		socket.emit("connection", "welcome");
	});

	ioServer.on('joinRoom', function(msg, socket) {
		socket.join(msg);
	});

	var socketCache = {};

	return {
		memoryHandler: function getMemoryIoHandler(memoryId) {
		if (socketCache[memoryId]) {} else {
			var ns = ioServer.of(memoryId);
			ns.on("chatMessage", function() {
				ns.emit(msg);
			});

			var memoryIo = {
				newMilestone: function broadcastNewMilestone(milestoneId) {
					ns.emit("milestone", {
						action: "new",
						id: milestoneId
					});
				},
				socket: ns
			};
			socketCache[memoryId] = memoryIo;
		}
		return socketCache[memoryId];
		}
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
