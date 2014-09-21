module.exports = function(server) {
	var SocketIO = require('socket.io');
	var ioServer = SocketIO.listen(server.listener);
	var clientSocket;

	ioServer.on('connection', function(socket) {
		socket.emit("connection", "welcome");
		clientSocket = socket;
	});

	var socketCache = {
		memories: {},
		milestones: {}
	};
	return {
		memoryHandler: function getMemoryIoHandler(memoryId) {
		if (socketCache.memories[memoryId]) {} else {
			var ns = ioServer.of(memoryId);
			var chat = ioServer.of(memoryId + "/chat");
			var chatSocket;
			var nameAssociations = {};

			chat.on('connection', function(socket){
				chatSocket = socket;
			});

			chat.on('nameReg', function(data){
				nameAssociations[chatSocket] = data.name;
			});

			chat.on('chatMessage', function(data, socket){
				chat.emit.broadcast('chatSocket', {memory: memoryId, creator: socket.id, createdDate: Date.now(), text: data.text});
			});

			ns.on('connection', function(socket){

			});

			var memoryIo = {
				newMilestone: function broadcastNewMilestone(milestoneId) {
					ns.emit("milestone", {
						action: "new",
						id: milestoneId
					});
				},
				deleteMilestone: function deleteMilestone(milestoneId){
					ns.emit("milestone", {
						action: "delete",
						id: milestoneId
					});
				},
				newMoment: function newMoment(memoryId, momentId){
					ns.emit("moment", {
						action: "new",
						id: momentId,
						parent: {memory: memoryId}
					});
				},
				deleteMoment: function deleteMoment(memoryId){
					ns.emit("moment", {
						action: "delete",
						id: momentId,
						parent: {memory: memoryId}
					});
				},
			};
			socketCache.memories[memoryId] = memoryIo;
		}
		return socketCache.memories[memoryId];
		},
		milestoneHandler: function getMilestoneHandler(milestoneId){
			if(socketCache.milestones[milestoneId]){} else {
				var ns = ioServer.of(memoryId + "/" +milestoneId);
				ns.on('connection', function(socket){
					socket.emit("helloWorld", "Hello, "+ socket);
				});

				var milestoneIo = {
					newMoment: function newMoment(momentId){
						ns.emit("moment", {
							action: "new",
							id: momentId,
							parent: {memory: memoryId}
						});
					}
				};	
				socketCache.milestones[milestoneId] = milestoneIo;
			}
			return socketCache.milestones[milestoneId];
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
