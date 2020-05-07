window.onload = function() {
    fetch('/api/auth/logout').then(function(response) {
        if (response.status == 200) {
            document.getElementById('body').innerText = "Log out Successful";
            localStorage['x-access-token'] = undefined;
            setInterval(function() {
                window.location.href = '/';
            }, 1000)
        }
    });
}