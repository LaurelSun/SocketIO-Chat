/**
 * Created by Laurel Sun on 29/09/2015.
 */
function User(name,avatar){
    this.name=name;
    this.avatar=avatar;
}

function ChatItem(datetime,from,to,content,type){
    this.from=from;
    this.to=to;
    this.content=content;
    this.type=type;
    this.datetime=datetime;
}

function ResultObject(result,msg){
    this.result=result;
    this.msg=msg;
}

var avatarArr=["img/1.jpg","img/2.jpg","img/3.jpg"];
var MessageType={system:0,self:1,other:2};
function changeAvatar(){
    var index=parseInt(Math.random()*avatarArr.length);
    return avatarArr[index];
}
