/**
 * Created by Laurel Sun on 29/09/2015.
 */

function Chat(socketUrl){
    this.socketUrl="ws://127.0.0.1:8015";
    this.userLst=[];  //[{name:"",avatar:""}]
    this.userLstJson={};//{"user1":0,"user2":0}
    this.unreadChatJson={};//{"user1":[item1,item2],"user2":[item1]}
    this.ChatHistory={};//{"user1":[item1,item2],"user2":[item1]}
    this.currentUser=new User();
    this.targetUser=new User();
    this.socket=null;

    this.init();
}
Chat.prototype.init=function(){
    if(!this.socket){
        this.socket=io.connect(this.socketUrl);
    }
    this.currentUser=new User();
};

Chat.prototype.emit=function(type,data){
    this.socket.emit(type,data);
};

Chat.prototype.listen=function(type,callback){
    this.socket.on(type,callback);
};

Chat.prototype.render=function(arr,callback)
{
    var html='';
    for(var i=0;i<arr.length;i++){
      html+= callback(arr[i],i);
    }
    return html;
};

Chat.prototype.login=function(userObj,callback){

    this.emit('login',userObj);
    this.listen('loginfeedback',function(data){
        //{result:true,msg:""}
         callback(data);
    })

};

Chat.prototype.sendMessage=function(chatItem){
    this.emit('usermsg',chatItem);
};

Chat.prototype.getSystemMessage=function(callback){
    this.listen('sys',function(data){
        if(!data.result){
            console.log(data.msg)
            return false;
        }
        //{result:[true false],msg:"",data:{datetime:"",content:"",to:""}}
        var msgObj=data.data;
        var sysMsg=new ChatItem(msgObj.datetime,"system",msgObj.to,msgObj.content,MessageType.system);
        if(!callback){
            console.log(sysMsg);
        }
        else{
            callback(sysMsg);
        }
    })
};

Chat.prototype.getMember=function(callback){
    var $this=this;
    this.listen('member',function(data){
        if(!data.result){
            console.log(data.msg);
            return false;
        }
        //{result:[true,false],msg:"",data:{type:[all,part],operate:[add,remove],user:[{name,avatar}]}}

        var dataObj=data.data;
        var userArr=dataObj.user;
        if(dataObj.type=="all"||dataObj.operate=="add"){
            for(var i=0;i<userArr.length;i++){

                $this.userLstJson[userArr[i].name]=i;
                $this.userLst.push(userArr[i]);
            }
        }else{
            for(var i=0;i<userArr.length;i++){
                var userIndex=$this.userLstJson[userArr[i].name];
                if(userIndex>=0){
                    $this.userLstJson[userArr[i].name]=null;
                    //$this. userLstJson.splice(userIndex,1);

                    $this.userLst.splice(userIndex,1);
                }
            }
        }

        if(callback){
            callback(dataObj);
        }

    });
};

Chat.prototype.getUserMessage=function(callback){
    this.listen('msg',function(data){
        console.log('receive data:'+data);
        if(!data.result){
            console.log(data.msg)
            return false;
        }

        //{result:[true,false],msg:"",data:{from:"",to:"",datetime:"",content:""}}
        var chatObj=data.data;
        var chatItem=new ChatItem(chatObj.datetime,chatObj.from,chatObj.to,
            chatObj.content,MessageType.other);

        if(callback){
            callback(chatItem);
        }

    })
};

Chat.prototype.appendUnreadMessage=function(msg){
    if(!this.unreadChatJson[msg.from]){
        this.unreadChatJson[msg.from]=[];
    }
    this.unreadChatJson[msg.from].push(msg);

    return this.unreadChatJson[msg.from].length;
};

Chat.prototype.appendHistory=function(msg){

   if(!this.ChatHistory[msg.from]){
       this.ChatHistory[msg.from]=[];

   }
    this.ChatHistory[msg.from].push(msg);

};

