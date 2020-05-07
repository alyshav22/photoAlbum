document.getElementById('register-button').onclick = function() {
    var firstname = document.getElementById('firstname').value;
    var lastname = document.getElementById('lastname').value;
    var email = document.getElementById('email').value;
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var gender = document.getElementById('gender').value;
    console.log(gender);
    var msg = document.getElementById('msg');
    msg.innerHTML = '';
    if (firstname.length > 0 && email.length > 0 && username.length > 0 && password.length > 0) {
        var data = {
            firstname: firstname,
            lastname: lastname,
            email: email,
            password: password,
            username: username,
            gender: gender
        };
        fetch('/api/auth/register', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded'
            }),
            body: "email=" + encodeURIComponent(email) + "&password=" + encodeURIComponent(password) + "&username=" + encodeURIComponent(username) + "&firstname=" + encodeURIComponent(firstname) + "&lastname=" + encodeURIComponent(lastname) + "&gender=" + encodeURIComponent(gender)
        }).then(function(response) {
            if (response.status == 200) {
                msg.innerHTML = "<i class=\"glyphicon glyphicon-ok-circle\"></i><b> User Registered Successfully</b>"
                response.text().then(function(message) {
                    message = JSON.parse(message);
                    localStorage['x-access-token'] = message.token;
                    window.location.href = '/profile/' + message.username;
                })
            } else {
                response.text().then(function(message) {
                    msg.innerText = 'username / email already in use';
                })
            }
        })
    } else {
        msg.innerText = 'username,email,password,firstname cannot be empty';
    }

}