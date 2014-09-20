module.exports = (function(server){
	var ioServer = io(server);

	//on connection, store socket. 
	ioServer.on('connection', function(socket){
	   // store user socketId. 
	});

	var memoryIo = {
		registerMemory:  function ioRegisterMemories(socketId, memories){
			memories.forEach(function(memoryId){
				ioServer.sockets.connected[socketId].socket.join(memoryId);
			});
		}
	};


})(server);



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