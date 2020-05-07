document.getElementById('login-button').onclick = function() {
    var json = {
        json: JSON.stringify({
            uname: window.document.getElementById('uname').value,
            psw: window.document.getElementById('psw').value
        }),
        delay: 1
    };
    var data = {
        username: window.document.getElementById('uname').value,
        password: window.document.getElementById('psw').value
    }
    fetch('/api/auth/login', {
        method: 'POST', // or 'PUT'
        body: JSON.stringify(data), // data can be `string` or {object}!
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        credentials: 'same-origin'
    }).then(function(response) {
        if (response.status == 200) {
            response.text().then(function(message) {
                message = JSON.parse(message);
                localStorage['x-access-token'] = message.token;
                window.location.href = '/';
            });
        } else if (response.status == 404) {
            document.getElementById('msg').innerText = 'Username not found';
        } else if (response.status == 401) {
            document.getElementById('msg').innerText = 'Wrong Username/Password';
        }
    });
}