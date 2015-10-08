/**
 * Created by Laurel Sun on 30/09/2015.
 */
exports.types = {

    "css": "text/css",

    "gif": "image/gif",

    "html": "text/html",

    "ico": "image/x-icon",

    "jpeg": "image/jpeg",

    "jpg": "image/jpeg",

    "js": "text/javascript",

    "json": "application/json",

    "pdf": "application/pdf",

    "png": "image/png",

    "svg": "image/svg+xml",

    "swf": "application/x-shockwave-flash",

    "tiff": "image/tiff",

    "txt": "text/plain",

    "wav": "audio/x-wav",

    "wma": "audio/x-ms-wma",

    "wmv": "video/x-ms-wmv",

    "xml": "text/xml"

};

exports.ChatItem=function(datetime,from ,to,content){
    this.datetime=datetime;
    this.from=from;
    this.to=to;
    this.content=content;

};

exports.ResponseResult=function(result,msg,data){
    this.result=result;
    this.msg=msg;
    this.data=data;
};

function UserSocketMap(){
    this.map={}
};

function UserModel(name,socketId,avatar,socket){
    this.avatar=avatar;
    this.name=name;
    this.socketId=socketId;
    this.socket=socket;
};



UserSocketMap.prototype.push=function(user,socketId,avatar,socket){
    this.map[user]=new UserModel(user,socketId,avatar,socket);
};

UserSocketMap.prototype.pop=function(socketId){
   // this.map[user]=null;
    var socket=null;
    for(var i in this.map){
        if(!this.map[i])continue;

        if(this.map[i].socketId==socketId){
            socket=this.map[i];
            this.map[i]=null;
            return socket;
        }
    }
    return null;
};
UserSocketMap.prototype.exists=function(user){
    if(this.map[user])
        return true;
    return false;
};

exports.UserModel=UserModel;
exports.UserSocketMap=UserSocketMap;