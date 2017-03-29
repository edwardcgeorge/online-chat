window.addEventListener('load', function(){
    getRoom();
}, false);

function getRoom() {
    var content = $.ajax({
      type: "GET",
      url: '/getRoom',
      async: false
    }).responseText;
    var res = JSON.parse(content);
    var ul = $('#roomBox');
    $.each(res, function(i) {
        // console.log(res[i].body);
        var li = $("<a class=\"list-group-item\" href=\"/"+res[i].room+"\">"+"Room#"+res[i].room+"</a>");
        ul.append(li);
    });
}
