var ReqUser = window.location.href.split('/')[window.location.href.split('/').length - 1];
var crrUser = undefined;

function init() {
    var firstname = document.getElementById('firstname');
    var lastname = document.getElementById('lastname');
    var email = document.getElementById('email');
    var username = document.getElementById('username');
    var gender = document.getElementById('gender');
    var user_ = window.location.href.split('/')[window.location.href.split('/').length - 1];
    fetch('/api/users/' + user_).then(function(response) {
        if (response.status == 200) {
            response.text().then(function(message) {
                message = JSON.parse(message);
                firstname.innerText = "firstname : " + message['firstname'];
                lastname.innerText = "lastname : " + message['lastname'];
                username.innerText = "username : " + message['username'];
                email.innerText = "email : " + message['email'];
                gender.innerText = "gender : " + message['gender'];
                fetch('/api/auth/me', {
                    method: 'GET',
                    headers: new Headers({
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'x-access-token': localStorage['x-access-token']
                    })
                }).then(function(response) {
                    response.text().then(function(user) {
                        user = JSON.parse(user);
                        crrUser = user;
                        if (user.username == message.username) {
                            password.style.display = "block";
                            password.disabled = false;
                            edit.style.display = "block";
                            edit.disabled = false;
                        }
                        if (user.username) {
                            var huser = document.getElementById('huser');
                            huser.href = '/profile/' + user.username;
                            huser.style.display = "block";
                        }
                    });
                })
            });
        } else {
            firstname.innerText = 'No User Found';
        }
    });
}


window.onload = init();


document.getElementById('edit').onclick = function() {

    if (crrUser.username != ReqUser)
        return;
    document.getElementById('fname').value = crrUser.firstname;
    document.getElementById('lname').value = crrUser.lastname;
    document.getElementById('memail').value = crrUser.email;
    document.getElementById('mgender').value = crrUser.gender;
    document.getElementById('id01').style.display = 'block'
}


