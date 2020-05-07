var gPhoto = undefined;
var gUser = undefined;

function init() {
    var pid = window.location.href.split('/')[window.location.href.split('/').length - 1];
    var aid = window.location.href.split('/')[window.location.href.split('/').length - 2];

    fetch('/api/photos/details/' + aid + '/' + pid, {
        method: 'GET',
        headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded',
            'x-access-token': localStorage['x-access-token']
        })
    }).then(function(photoResponse) {
        if (photoResponse.status == 200) {
            photoResponse.text().then(function(element) {
                element = JSON.parse(element);
                gPhoto = element;
                if (element.state == 'public')
                    document.getElementById('edit_photo').style.display = "block";
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
                        img.alt = element.id;
                        img.style.height = '50%';
                        img.style.width = 'auto';
                    });
                });
                var para = document.createElement('h3');
                para.innerText = `Name : ${element.name}
                        Description : ${element.description}
                        Time Created : ${element.time} 
                        Privacy : ${element.state}`
                div.appendChild(img);
                div.appendChild(para);
                anc.appendChild(div);
                row.appendChild(anc);
                row.style.margin = "2px 0 20px 0";
                row.style.padding = "5px";
                content.appendChild(row);

                fetch('/api/auth/me', {
                    method: 'GET',
                    headers: new Headers({
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'x-access-token': localStorage['x-access-token']
                    })
                }).then(function(response) {
                    if (response.status == 200) {
                        response.text().then(function(user) {
                            user = JSON.parse(user);
                            gUser = user.username;
                            if (user.username == element.username || element.state == 'public') {
                                document.getElementById('edit_photo').style.display = "block";
                                document.getElementById('delete_photo').innerHTML = `<a id='delete' onMouseOver="this.style.cursor='pointer'" onclick = "del();"><span class="glyphicon glyphicon-trash"></span> Delete Photo</a>`
                            }
                        });
                    } else {
                        document.getElementById('logout').innerHTML = `<a href="/login"><span class="glyphicon glyphicon-log-in"></span> login</a>`
                    }
                })
            })
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
            div.innerHTML = `You Don't Have Rights to View this Photo `
            row.style.margin = "2px 0 20px 0";
            row.style.padding = "5px";
            row.appendChild(div);
            content.appendChild(row);
        }
    });
}

window.onload = init();

function del() {
    fetch('/api/photos/' + gPhoto.albumid + '/' + gPhoto.id, {
        method: 'DELETE',
        headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded',
            'x-access-token': localStorage['x-access-token']
        })
    }).then(function(response) {
        response.text().then(function(message) {
            document.getElementById('msg').innerText = message;
            if (message == 'success-deleted-image')
                setInterval(function() {
                    window.location.href = '/album/' + gPhoto.albumid;
                }, 1000);
        })
    })
}

document.getElementById('edit_photo').onclick = function() {
    console.log(gUser);
    document.getElementById('m_name').value = gPhoto.name;
    document.getElementById('m_description').value = gPhoto.description;
    document.getElementById('m_privacy').value = gPhoto.state;
    if (gPhoto.username != gUser) {
        document.getElementById('m_privacy').disabled = true;
    }
    document.getElementById('id01').style.display = 'block'
}

document.getElementById('fsubmit').onclick = function() {
    name = document.getElementById('m_name').value;
    description = document.getElementById('m_description').value;
    state = document.getElementById('m_privacy').value;
    if (gUser != gPhoto.username)
        state = gPhoto.state;
    if (name.length > 0 && description.length > 0) {
        var data = {
            name: name,
            description: description,
            state: state
        }
        fetch('/api/photos/' + gPhoto.albumid + '/' + gPhoto.id, {
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

window.onclick = function(event) {
    var modal = document.getElementById('id01');
    if (event.target == modal) {
        var msg_disp = window.document.getElementById('msg_1');
        msg_disp.innerHTML = ' ';
        modal.style.display = "none";
    }
}