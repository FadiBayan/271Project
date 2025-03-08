export function tryLogin(email, password){
    
    const user = {
        username: getUsername_from_email(email),
        password: password
    }

    return fetch(`http://localhost:5000/login-user`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
    .then(response => response.json())
    .then(data => {

        return data.message;
    })
    .catch(error => {
        console.error("Error while fetching from login route: " + error);
        return error;
    })

}

function getUsername_from_email(email){

    const username = email.substring(0, email.indexOf('@'));

    return username;

}

export function trySignup(email, password) {
    const user = {
        email: email,
        password: password
    };

    return fetch(`http://localhost:5000/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
    .then(response => response.json())
    .then(data => {
        return data.message;
    })
    .catch(error => {
        console.error("Signup request failed:", error);
        return "Failed to fetch";
    });
}
