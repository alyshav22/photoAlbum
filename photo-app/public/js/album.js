var gAlbum = undefined;
var gUser = undefined;

function init() {
    var id = window.location.href.split('/')[window.location.href.split('/').length - 1];
    console.log(id);
    fetch('/api/album/' + id, {
        method: 'GET',
        headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded',
            'x-access-token': localStorage['x-access-token']
        }),
    }).then(function(response) {
        if (response.status == 200) {
            response.text().then(function(album) {
                album = JSON.parse(album);
                console.log(album);
                gAlbum = album;
                var des = true;
                var add = true;
                if (gAlbum.state == 'public')
                    document.getElementById('edit_album').style.display = "block";
                if (des) {
                    element = album;
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
                    var text = `Name : ${element.name}
                    Description : ${element.description}
                    Time Created : ${element.time} 
                    Privacy: ${element.state}`;
                    if (element.state != 'private')
                        text += `
                        To sahre : http://` + window.location.host + '/album/' + element.id;
                    para.innerText = text;
                    div.appendChild(img);
                    div.appendChild(para);
                    anc.appendChild(div);
                    row.appendChild(div);
                    row.style.margin = "2px 0 20px 0";
                    row.style.padding = "5px";
                    content.appendChild(row);
                    var row = document.createElement('div');
                    var h4 = document.createElement('h4');
                    h4.innerText = 'Photos'
                    row.style.margin = "2px 0 20px 0";
                    row.style.padding = "5px";
                    row.appendChild(h4);
                    content.appendChild(row);
                }
                if (add) {
                    var row = document.createElement('div');
                    row.className = 'row';
                    var div = document.createElement('div');
                    div.style.wordWrap = "break-word";
                    div.style.backgroundColor = '#f2e8e8';
                    div.style.borderColor = '#E7E7E7';
                    div.style.fontFamily = 'arial,sans-serif;'
                    div.className = "col-xs-12 col-sm-12 col-md-12 col-lg-12";
                    div.style.borderRadius = "15px";
                    div.innerHTML = `Add new photo <br>
                    <input name="myFile" type="file" id="upload" accept="image/* multiple = "false"" /><br>
                    <input type="button" value="Submit" onClick = "upload();"/>`
                    row.style.margin = "2px 0 20px 0";
                    row.style.padding = "5px";
                    row.appendChild(div);
                    content.appendChild(row);
                }
                album.photos.forEach(element => {
                    if (element != album.coverid) {
                        fetch('/api/photos/details/' + album.id + '/' + element, {
                            method: 'GET',
                            headers: new Headers({
                                'Content-Type': 'application/x-www-form-urlencoded',
                                'x-access-token': localStorage['x-access-token']
                            })
                        }).then(function(photoResponse) {
                            if (photoResponse.status == 200) {
                                photoResponse.text().then(function(element) {
                                    element = JSON.parse(element);
                                    var row = document.createElement('div');
                                    row.className = 'row';
                                    var anc = document.createElement('a');
                                    anc.href = ('/photo/' + element.albumid + '/' + element.id);
                                    anc.style.color = 'black';
                                    var div = document.createElement('div');
                                    div.style.wordWrap = "break-word";
                                    div.style.backgroundColor = '#f2e8e8';
                                    div.style.borderColor = '#E7E7E7';
                                    div.style.fontFamily = 'arial,sans-serif;'
                                    div.className = "col-xs-12 col-sm-12 col-md-12 col-lg-12";
                                    div.style.borderRadius = "15px";
                                    var img = document.createElement('img');
                                    fetch('/api/photos/' + element.albumid + '/' + element.id, {
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
                                            Time Created : ${element.time}
                                            Privacy : ${element.state} `
                                    div.appendChild(img);
                                    div.appendChild(para);
                                    anc.appendChild(div);
                                    row.appendChild(anc);
                                    row.style.margin = "2px 0 20px 0";
                                    row.style.padding = "5px";
                                    content.appendChild(row);
                                })
                            }
                        });
                    }
                });
                bar();
            });
        } else {
            var row = document.createElement('div');
            row.className = 'row';
            var div = document.createElement('div');
            div.style.wordWrap = "break-word";
            div.style.backgroundColor = '#f2e8e8';
            div.style.borderColor = '#E7E7E7';
            div.style.fontFamily = 'arial,sans-serif;'
            div.className = "col-xs-12 col-sm-12 col-md-12 col-lg-12";
            div.style.borderRadius = "15px";
            div.innerHTML = `You Don't Have Rights to View this Album `
            row.style.margin = "2px 0 20px 0";
            row.style.padding = "5px";
            row.appendChild(div);
            content.appendChild(row);
        }
    });


}

window.onload = init();

function bar() {
    fetch('/api/auth/me', {
        method: 'GET',
        headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded',
            'x-access-token': localStorage['x-access-token']
        }),
    }).then(function(response) {
        if (response.status == 200) {
            response.text().then(function(message) {
                user = JSON.parse(message);
                gUser = user.username;
                var huser = document.getElementById('huser');
                huser.href = '/profile/' + user.username;
                huser.style.display = "block";
                if (user.username == gAlbum.username || gAlbum.state == 'public') {
                    document.getElementById('edit_album').style.display = "block";
                    document.getElementById('delete_album').innerHTML = `<a id='delete' onMouseOver="this.style.cursor='pointer'" onclick = "del();"> Delete Album</a>`
                }
            });
        } else {
            document.getElementById('upload').disabled = true;
            document.getElementById('logout').innerHTML = `<a href="/login"> login</a>`
        }
    });
}

function upload() {
    var input = document.querySelector('input[type="file"]')

    var data = new FormData()
    data.append('image', input.files[0])
    data.append('x-access-token', localStorage['x-access-token'])

    fetch('/api/photos/' + gAlbum.id, {
        method: "POST",
        body: data
    }).then(function(response) {
        response.text().then(function(message) {
            console.log(message);
            if (response.status == 200) {
                location.reload();
            } else {
                response.text().then(function(message) {
                    document.getElementById('msg').innerText = message;
                })
            }
        })
    });
}

function del() {
    fetch('/api/album/' + gAlbum.id, {
        method: 'DELETE',
        headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded',
            'x-access-token': localStorage['x-access-token']
        })
    }).then(function(response) {
        response.text().then(function(message) {
            document.getElementById('msg').innerText = message;
            if (message == 'album-deleted-successfully')
                setInterval(function() {
                    window.location.href = '/';
                }, 1000);
        })
    })
}


document.getElementById('edit_album').onclick = function() {
    console.log(gAlbum);
    console.log(gUser);
    document.getElementById('m_name').value = gAlbum.name;
    document.getElementById('m_description').value = gAlbum.description;
    document.getElementById('m_privacy').value = gAlbum.state;
    if (gAlbum.username != gUser) {
        document.getElementById('m_privacy').disabled = true;
    }
    document.getElementById('id01').style.display = 'block'
}

window.onclick = function(event) {
    var modal = document.getElementById('id01');
    if (event.target == modal) {
        var msg_disp = window.document.getElementById('msg_1');
        msg_disp.innerHTML = ' ';
        modal.style.display = "none";
    }
}

document.getElementById('fsubmit').onclick = function() {
    name = document.getElementById('m_name').value;
    description = document.getElementById('m_description').value;
    state = document.getElementById('m_privacy').value;
    if (gUser != gAlbum.username)
        state = gAlbum.state;
    if (name.length > 0 && description.length > 0) {
        var data = {
            name: name,
            description: description,
            state: state
        }
        fetch('/api/album/' + gAlbum.id, {
            method: 'PUT',
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded',
                'x-access-token': localStorage['x-access-token']
            }),
            body: 'name=' + encodeURI(name) + '&description=' + encodeURI(description) + '&state=' + encodeURI(state)
        }).then(function(response) {
            response.text().then(function(message) {
                document.getElementById('msg_1').innerText = message;
                if (message == 'updated-successfully')
                    setInterval(function() {
                        location.reload();
                    }, 1000);
            });
        });
    } else {
        document.getElementById('msg_1').innerText = 'name and description cannot be empty';
    }
}