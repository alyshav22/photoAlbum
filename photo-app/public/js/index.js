function direct(id) {
    console.log(id);
}

function init() {
    fetch('/api/auth/me', {
        method: 'GET',
        headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded',
            'x-access-token': localStorage['x-access-token']
        }),
    }).then(function(response) {
        response.text().then(function(user) {
            user = JSON.parse(user);
            if (user.username) {
                var huser = document.getElementById('huser');
                huser.href = '/profile/' + user.username;
                huser.style.display = "block";
                fetch('/api/album/', {
                    method: 'GET',
                    headers: new Headers({
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'x-access-token': localStorage['x-access-token']
                    }),
                }).then(function(albumResponse) {
                    albumResponse.text().then(function(album) {
                        var content = document.getElementById('content');
                        album = JSON.parse(album);
                        album.forEach(element => {
                            var row = document.createElement('div');
                            row.className = 'row';
                            var anc = document.createElement('a');
                            anc.href = ('/album/' + element.id);
                            anc.style.color = 'black';
                            var div = document.createElement('div');
                            div.style.wordWrap = "break-word";
                            div.style.backgroundColor = '#f2e8e8';
                            div.style.borderColor = '#E7E7E7';
                            div.style.fontFamily = 'arial,sans-serif;'
                            div.className = "col-xs-12 col-sm-12 col-md-12 col-lg-12";
                            div.style.borderRadius = "15px";
                            var img = document.createElement('img');
                            fetch('/api/photos/' + element.id + '/' + element.coverid, {
                                method: 'GET',
                                headers: new Headers({
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                    'x-access-token': localStorage['x-access-token']
                                })
                            }).then(function(imgResponse) {
                                imgResponse.blob().then(function(blob) {
                                    img.src = URL.createObjectURL(blob);
                                    img.alt = "cover";
                                    img.style.width = "auto";
                                    img.style.height = "100";
                                });
                            });
                            var para = document.createElement('p');
                            para.innerText = `Name : ${element.name}
                            Description : ${element.description}
                            Time Created : ${element.time} `
                            div.appendChild(img);
                            div.appendChild(para);
                            anc.appendChild(div);
                            row.appendChild(anc);
                            row.style.margin = "2px 0 20px 0";
                            row.style.padding = "5px";
                            content.appendChild(row);
                        });
                    });
                });
            } else {
                window.location.href = '/login'
            }
        });
    })
}


window.onload = init();

document.getElementById('new_album').onclick = function() {
    fetch('/api/album', {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded',
            'x-access-token': localStorage['x-access-token']
        })
    }).then(function(res) {
        if (res.status == 200) {
            res.text().then(function(message) {
                message = JSON.parse(message);
                console.log(message);
                window.location.href = '/album/' + message.id;
            });
        } else {
            res.text().then(function(message) {
                message = JSON.parse(message);
                console.log(message);
                document.getElementById('msg').innerText = message;
            });
        }
    });
}