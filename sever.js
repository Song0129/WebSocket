// TODO 服务端定义
var ws = require("nodejs-websocket");
var protobufjs = require("protobufjs");
var message = protobufjs.loadSync("./message.proto");

var server = ws.createServer(function(conn) {
	console.log("New Conntection");
	// 向客户端发送消息
	conn.on("text", function(str) {
		console.log('上传的数据',str);
		var data = JSON.parse(str);
		console.log('name',data)
		switch (data.type) {
			// 设置名称
			case "setname":
				console.log('setname')
				// 解析接收的数据
				var MessageReq = message.lookupType("message.MessageReq");
				// array转Uint8Array
				var arr = new Uint8Array(data.name)
				// console.log("buffer",arr)
				// 反序列解析数据
				var messageReq = MessageReq.decode(arr)
				console.log("接收数据的数据:", messageReq);
				// 用户名赋值给回话
				conn.nickname = messageReq.text;

				// 发送的数据
				var sendMessageReq = MessageReq.create();
				sendMessageReq.text= conn.nickname  + "加入了房间"
				console.log('sendMessageReq',sendMessageReq)
				var sendData = MessageReq.encode(sendMessageReq).finish();

				// Buffer处理
				var sendBuffer = Buffer.alloc(2);
				sendBuffer.writeInt16BE(100);

				// 拼接数据
				var totalBuffer = Buffer.concat([sendBuffer,sendData],sendData.length + sendBuffer.length);

				boardcast(JSON.stringify({
					name: "Server",
					// text: data.name+"加入了房间",
					text: totalBuffer
				}));
				break;
			// 聊天
			case "chat":
				console.log('chat')
				// 解析接收的数据
				var MessageReq = message.lookupType("message.MessageReq");
				console.log('text',data.text)
				// array转Uint8Array
				var arr = new Uint8Array(data.text)
				// console.log("buffer",arr)
				// 反序列解析数据
				var messageReq = MessageReq.decode(arr)
				console.log("接收数据的数据:", messageReq);

				// 发送的数据
				var sendMessageReq = MessageReq.create();
				sendMessageReq.text = messageReq.text
				console.log('sendMessageReq',sendMessageReq)
				var sendData = MessageReq.encode(sendMessageReq).finish();

				// Buffer处理
				var sendBuffer = Buffer.alloc(2);
				sendBuffer.writeInt16BE(100);

				// 拼接数据
				var totalBuffer = Buffer.concat([sendBuffer,sendData],sendData.length + sendBuffer.length);

				boardcast(JSON.stringify({
					name: conn.nickname,
					// text: data.text,
					text: totalBuffer,
				}));
				break;
			default:
				break;
		}
	});
	// 人物离开页面
	conn.on("close", function() {
		boardcast(JSON.stringify({
			name: "Server",
			text: conn.nickname +"离开了房间"
		}));
	})
	conn.on("error", function(err) {
		console.log(err)
	})
}).listen(2334)
// 广播
function boardcast(str) {
	server.connections.forEach(function(conn) {
		conn.sendText(str);
	})
}
