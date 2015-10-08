/**
 * Created by Laurel Sun on 30/09/2015.
 */

var http=require('http');
var fs=require('fs');
var common=require('./commonHelper');
var MIME=common.types;
var ChatItem=common.ChatItem;
var UserSocketMap=new common.UserSocketMap();
var ResponseResult=common.ResponseResult;
var UserModel=common.UserModel;

var server=http.createServer(function(req,res,next){
    var urlobj=path.parse(__dirname);
    var filename=urlobj.dir+req.url;

    fs.readFile(urlobj.dir+req.url,function(err,data){
        if(err){
            //console.log(err);
            return false;
        }
        var ext=path.extname(filename).substr(1);
        res.writeHead(200, {'Content-Type': MIME[ext]});
        res.end(data);

    });

});

var io=require('socket.io')(server);
var path=require('path');

server.listen(8015);

io.on('connection',function(socket){
    var chat=new ChatItem(new Date().toString(),"system",socket.id,"connect to server");
    socket.emit("sys",{result:true,msg:"",data:chat});

    socket.on("login",function(data){
        console.log(data)
        var result=new ResponseResult();
        var newUser=null;

        if(UserSocketMap.exists(data.name)){
            result.result=false;
            result.msg="user exists"
        }else {
            var socketId=socket.id;
            result.result=true;
            var memberObj={};
            memberObj.result=true;
            memberObj.data={};
            memberObj.data.type="all";
            memberObj.data.user=[];

            for(var i in UserSocketMap.map){
                if(UserSocketMap.map[i]){
                    memberObj.data.user.push(
                        new UserModel(UserSocketMap.map[i].name,'',UserSocketMap.map[i].avatar)
                    );
                }

            }
            console.log(memberObj);
            socket.emit("member",memberObj);

            UserSocketMap.push(data.name,socketId,data.avatar,socket);
            newUser=new UserModel(data.name,socketId,data.avatar);

            memberObj.data.type="part";
            memberObj.data.operate="add";
            memberObj.data.user=[newUser];
            sendMemberMessage(socket,memberObj); //add new user

            var systemMsg=new ChatItem(new Date().toString(),'system',socketId,"success for login");
            sendSystemMessage(data.name,{result:true,data:systemMsg});

        }
        socket.emit('loginfeedback',result);

    });

    socket.on('usermsg',function(data){

        var receive=new ChatItem(new Date().toString(),data.from,data.to,data.content);
        UserSocketMap.map[data.to].socket.emit('msg', new ResponseResult(true,'',receive));
    });



    socket.on('disconnect',function(data){

        var deleteSocket=UserSocketMap.pop(this.id);
        if(deleteSocket) {
            var userData = {};
            userData.type = "part";
            userData.operate = "remove";
            userData.user = [new UserModel(deleteSocket.name, deleteSocket.socketId,
                deleteSocket.avatar)];
            var resResult = new ResponseResult(true, '', userData);

            sendMemberMessage(socket, resResult);
        }
    });

});

function sendSystemMessage(user,data){
   var socketId= UserSocketMap.map[user].socketId;
    if(!socketId){
        console.log(user)
        console.log('unknown userid')
        return false;
    }

   io.sockets.connected[socketId].emit('sys',data);

}

function sendMemberMessage(user,data){

    if(typeof(user)==="string"){
        UserSocketMap.map[user].socket.emit('member',data);
    }
    else{
        user.broadcast.emit("member",data);
    }
}




