/**
 * Created by Laurel Sun on 30/09/2015.
 */

function ChatServer(){
    this.UserSocketMap={};

}
ChatServer.prototype.push=function(user,socketId){
   this.UserSocketMap[user]=socketId;

};

ChatServer.prototype.pop=function(user){
    this.UserSocketMap[user]=null;
};
ChatServer.prototype.exists=function(user){
    if(this.UserSocketMap[user])
    return true;
    return false;
};


modules.exports=ChatServer;