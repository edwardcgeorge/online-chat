var Onickname;
var socket = io.connect();

Array.prototype.contains = function ( needle ) {
   for (i in this) {
       if (this[i] == needle) return true;
   }
   return false;
}

function meta(name) {
    var tag = document.querySelector('meta[name=' + name + ']');
    if (tag != null)
        return tag.content;
    return '';
}
// fired when the page has loaded
$(document).ready(function(){
    // handle incoming messages
    var messageForm = $('#messageForm').submit(sendMessage);
    Onickname = setNickName();
    var memberList = [];
    var count;
    var isFirst = true;
    socket.on('message', function(nickname, message, time, id){
        // display a newly-arrived message
        var ul = $('#messageBox');
        if(id === socket.id) {
            var li = $(' <li class="own"><p class="user"><span class="user-name">'+nickname+'<br>(myself)</span></p>'
            +'<div class="reply-content-box"><span class="reply-time">'+time+'</span>'
            +'<div class="reply-content pr">'
            +'<span class="arrow">&nbsp;</span>'+message+'</div></div></li>');
            ul.append(li);
        }
        else {
            var li = $(' <li class="other"><p class="user"><span class="user-name">'+nickname+'</span></p>'
            +'<div class="reply-content-box"><span class="reply-time">'+time+'</span>'
            +'<div class="reply-content pr">'
            +'<span class="arrow">&nbsp;</span>'+message+'</div></div></li>');
            ul.append(li);
        }
        divScroll();
    });

    socket.on('nickname', function(Onickname1, nickname){
        // Onickname = nickname;
        $('#'+Onickname1+'').html(nickname);
        $('#'+Onickname1+'').prop('id', nickname);
        var ale = $('<li><span class="ale label label-info">Member '+Onickname1+' Has Changed Name To '+nickname+'</span></li>');
        $('#messageBox').append(ale);
        divScroll();
    });

    // handle room membership changes
    socket.on('newMember', function(nickname, nums){
        // display the new member list
        // console.log('sC');
        if(isFirst) {
            var li = $('<li style="list-style:none" id=\'myName1\'>'+nickname+'(myself)</li>');
            $('#memberBox').append(li);
            count++;
            $('#peopleCount').html('Acive member: '+nums+'');
            isFirst = false;
        }
        else {
            var li = $('<li style="list-style:none" id=\''+nickname+'\'>'+nickname+'</li>');
            $('#memberBox').append(li);
            count++;
            $('#peopleCount').html('Acive member: '+nums+'');
            var ale = $('<li><span class="ale label label-default">New Member '+nickname+' Comes In!!</span></li>');
            $('#messageBox').append(ale);
            divScroll();
        }
    });

    socket.on('leave', function(nickname){
        $('#'+nickname+'').remove();
        count--;
        console.log(count-1);
        $('#peopleCount').html('Acive member: '+count+'');
        var ale = $('<li><span class="ale label label-warning">'+nickname+' Has Left Room!!</span></li>');
        $('#messageBox').append(ale);
        divScroll();
    });

    socket.emit('join', meta('roomName'), Onickname, function(messages, members, nums){
        // process the list of messages the server sent back
        //nums is current numsof people currently active in this room
        console.log("messages get back: "+messages+" "+members+" "+nums);
        var res = messages;
        var ul = $('#messageBox');
        $.each(res, function(i) {
            var time = new Date(res[i].time);
            console.log(time);
            var formatTime= time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + time.getDate() + " " +  time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
            var li = $(' <li class="other"><p class="user"><span class="user-name">'+res[i].nickname+'</span></p>'
            +'<div class="reply-content-box"><span class="reply-time">'+formatTime+'</span>'
            +'<div class="reply-content pr">'
            +'<span class="arrow">&nbsp;</span>'+res[i].body+'</div></div></li>');
            ul.append(li);
        });
        // console.log(members);
        $.each(members, function(i, v){
            var li = $('<li style="list-style:none" id=\"'+v+'\">'+v+'</li>');
            $('#memberBox').append(li);
        });
        count = nums;
        $('#peopleCount').html('Acive member: '+nums+'');
        divScroll();
    });
});

function divScroll(){
    var d = $('#messageArea');
    d.scrollTop(d.prop("scrollHeight"));
    $("#messageArea").animate({ scrollTop: $('#messageArea')[0].scrollHeight}, 1000);
}

function change() {
    var nick;
    do{
        nick = prompt("Please enter your new Nickname");
    } while(nick == null || nick == "" );
    Onickname = nick;
    $('#myName1').html(nick+'(myself)');
    socket.emit('nickname', nick);
}

function sendMessage(event) {
    event.preventDefault();
    var message = $("#messageField").val(); // get message
    // console.log("M:"+message);
    $('#messageForm')[0].reset();
    // send it to the server
    socket.emit('message', message, socket.id);
}

function setNickName() {
    var nick;
    do{
        nick = prompt("Please enter your Nickname");
    } while(nick == null || nick == "" );
    return nick;
}
