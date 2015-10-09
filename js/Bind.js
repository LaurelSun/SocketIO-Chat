var chat=null;

$(function(){
    //SHOW LOGIN WINDOW
    $('#myModal').modal({show:true,backdrop:"static"});

    chat=new Chat("ws://127.0.0.1:8015");
    chat.currentUser.avatar=$('#setAvatar').attr('src');

    //LOGIN
    $('#btnConnect').click(userLogin);

    //CHANGE AVATAR
    $('.btn_change').click(function(){
        chat.currentUser.avatar=changeAvatar();
        $('#personalHead,#setAvatar').attr('src',chat.currentUser.avatar);
    });

    //CHOOSE USER
    var userList=$('.userLst');
    userList.delegate('li','click',function(){
        var curLi=$(this);
        chat.targetUser=new User();
        chat.targetUser.avatar=curLi.find('img').attr('src');
        chat.targetUser.name=curLi.attr('id');
        $('.header').text(chat.targetUser.name);
        clearMessagebox();

        //append unread msg
        if(chat.unreadChatJson[chat.targetUser.name]&&chat.unreadChatJson[chat.targetUser.name].length>0){
            chat.render(chat.unreadChatJson[chat.targetUser.name],function(msg){
                console.log(msg);
                appendMessage($('#messageList'),msg)
            });
        }

        chat.unreadChatJson[chat.targetUser.name]=[];
        //remove  badge
        var badge=curLi.find($('.badge'));
        if(badge.length>0){
            badge.remove();
        }

        var userLi=$('li',userList);

        for(var i=0;i<userLi.length;i++){
            $(userLi[i]).removeClass('cur')
        }
        curLi.addClass('cur');

    });

    //SEND MESSAGE
    $('#btnSubmit').click(function(){
        if(chat.userLstJson[chat.targetUser.name]==null){

            alert(chat.targetUser.name+" is offline.");
            return false;
        }
      var msg=$('#txtMsg');
        if(msg.val().length<0){
            alert('content is not null');
            return false;
        }

        if(!chat.targetUser.name){
            alert('please choose a user');
            return false;
        }
        var chatObj=new ChatItem(new Date().toString(),chat.currentUser.name,
            chat.targetUser.name,msg.val(),MessageType.self);
        chat.sendMessage(chatObj);
        var messageList=$('#messageList');
        appendMessage(messageList,chatObj);
        chat.appendHistory(chatObj);


        msg.val('');

    });



});

function userLogin(){
    var txtUser=$('#txtUser');
    var name=txtUser.val();
    if(name.trim().length>0){
        var user=new User(name.trim(),chat.currentUser.avatar);

        bindMessage();
        bindMember();

        chat.login(user,function(data){
           if(data.result){
             $('#myModal').modal('hide');

               $('.userLst').html();

               chat.currentUser=user;

           }
            else{
               txtUser.parent().addClass('has-error');
               txtUser.val(data.msg);
           }
        });

    }
}

function bindMember(){

    var userList= $('.userLst');

    chat.getMember(function(memberList){
        //update member count
        $('#totalCnt').val(chat.userLst.length);

        //if user list type is add or all, render them to html

        var userArr=memberList.user;
        if(memberList.operate=="add"||memberList.type=="all"){
           var memberHtml=userList.html();
            memberHtml+=chat.render(userArr,function(item,index){
                console.log(index+'_'+item);
                var unreadCnt=0;
                if(chat.unreadChatJson[item.name]){
                    unreadCnt=chat.unreadChatJson[item.name].length;
                }
               return "<li id='"+item.name+"'><img src='"+item.avatar+"' alt='"+item.name+
                      "' class='img-thumbnail personalHead'/> <span>"+item.name+
                   (unreadCnt>0?"<span class='badge'>"+unreadCnt+"</span>":"")+"</span></li>";


            });
             userList.html(memberHtml);
        }
        else{
            //remove disconnect user from html
            for(var i=0;i<userArr.length;i++){
                userList.find($('#'+userArr[i].name)).remove();

            }
        }

        $('#totalCnt').text(chat.userLst.length+1);

    });


}

function bindMessage(){

    var messageList=$('#messageList');

    chat.getSystemMessage(function(systemMessage){
       appendMessage(messageList,systemMessage);
    });

    chat.getUserMessage(function(userMessage){

        if(userMessage.from==chat.targetUser.name){
            chat.appendHistory(userMessage);
            appendMessage(messageList,userMessage);
        }
        else{
          var unreandCnt=chat.appendUnreadMessage(userMessage);

            var reminderObj= $('#'+userMessage.from).find($('.badge'));
            if(reminderObj.length<1){
                var reminderHtml="<span class='badge'>"+unreandCnt+"</span>";
                var span= $('#'+userMessage.from).find('span');
                span.append($(reminderHtml));
            }
            else{
                reminderObj.text(unreandCnt);
            }


        }

    });

}

function appendMessage(container,msg){

    var html="";
    if(msg.type==MessageType.other||msg.type==MessageType.self) {
        html = "<li> <div>  <div class='" + (msg.type == MessageType.other ? "left" : "right") + "'>" +
            "<img src='" + chat.targetUser.avatar + "' alt='" + chat.targetUser.name + "' class='img-thumbnail headimg'/>" +
            "</div>  <div class='dialog " + (msg.type == MessageType.other ? "other" : "self") + "'>" +
            "  <i class='arrow'></i><span>" + msg.content + "</span> </div> </div>  </li>";
    }
    else{
        html="  <li>  <div class='sys'>system message:"+msg.content+"</div>  </li>";
    }
    container.append($(html));
}

function clearMessagebox(){
    $('#messageList').html('');
}