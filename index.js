const searchButton = document.querySelector('.search-btn');
const usernameInput = document.querySelector('.search-txt');
const avatarImage = document.querySelector('.profile_img')
const username = document.querySelector('.name');
const userId = document.querySelector('.user_id');
const bio = document.querySelector('.profile_bio');
const stats = document.getElementsByClassName('num');
const locationDiv = document.querySelector('.place');
const locationText = document.querySelector('.place_name');
const error = document.querySelector('.error');
const languageDiv = document.querySelector(".language");
const language = document.querySelector(".popular_language");



// for handle status code error
function handleError(response) {
    showErrorMessage(response.message);
}

// displays each given message as an error message 
function showErrorMessage(message) {
    console.log(message);
    error.classList.add('active');
    error.innerHTML = message;
    setTimeout(() => { // removes the error message from screen after 4 seconds.
        error.classList.remove('active');
    }, 4000)
}

// get user data from API and return the json value.
async function getUserData(username) {
    console.log("request");
    try {
        let response = await fetch(`https://api.github.com/users/${username}`)
        let json = await response.json();
        if (response.status == 200) {
            return json
        }
        console.log("error:", json)
        handleError(json);
        return Promise.reject(`Request failed with error ${response.status}`);
    } catch (e) {
        showErrorMessage(e);
        console.log(e);
    }
}

// set avatar in view
function setAvatar(avatar) {
    avatarImage.src = avatar;
    console.log("image added")
}

// set name in view
function setName(userData) {
    if (userData.name == null) {
        username.style.display = "none";
    } else {
        username.style.display = "block";
        username.innerHTML = userData.name;
    }
    userId.innerHTML = userData.login;
}

function setBio(userData) {
    if (userData.bio == null)
        bio.innerHTML = `This user has no bio`;
    else
        bio.innerHTML = userData.bio;
}

// Sets followers, following and repo counts.
function setStats(userData) {
    stats[0].innerHTML = userData.followers;
    stats[1].innerHTML = userData.following;
    stats[2].innerHTML = userData.public_repos;
}

function setLocation(userData) {
    if (userData.location == null) {
        locationDiv.style.display = "none";
    } else {
        locationDiv.style.display = "block";
        locationText.innerHTML = userData.location;
    }
}

// add http to start of link
const getClickableLink = link => {
    return link.startsWith("http://") || link.startsWith("https://") ?
        link :
        `http://${link}`;
};


// fill user data in view .
function fillProfileCard(userData) {
    console.log("user data:", userData);
    setAvatar(userData.avatar_url);
    setName(userData);
    setLocation(userData);
    setStats(userData);
    setBio(userData);
}

// get all repositories of user and return json.
async function getRepos(username) {
    try {
        let response = await fetch(`https://api.github.com/users/${username}/repos`);
        let json = await response.json();
        if (response.status != 200) {
            handleError(json);
            return Promise.reject(`Request failed with error ${response.status}`);
        }
        return json;
    } catch (e) {
        console.log(e);
        showErrorMessage(e);
    }
}

// set popular repository in view.
async function findPopLang(username) {
    languageDiv.style.display = "none";
    let repos = await getRepos(username);
    // sort repos by time of push and get 0:5 repos. 
    repos = repos.sort(function(a, b) {
        return b.pushed_at.localeCompare(a.pushed_at);
    }).slice(0, 5);

    if (repos.length == 0)
        return;
    // get popular repository.
    let popRepo = [...repos.reduce((op, inp) => {
        let lang = inp.language;
        op.set(lang, (op.get(lang) || 0) + 1)
        return op
    }, new Map()).entries()];

    popRepo.sort(function(a, b) {
        return b[1] - a[1];
    });
    // set in html
    language.innerHTML = popRepo[0][0];
    languageDiv.style.display = "block";

}

// the process of sending data and fill it in view.
async function sendRequest(e) {
    console.log("clicked on submit");
    let username = usernameInput.value;
    if (username == "") {
        console.log("username was empty");
        return;
    }
    e.preventDefault();
    let userData;
    userData = await JSON.parse(window.localStorage.getItem(username));
    if (userData == null) {
        userData = await getUserData(username);
        if (userData == null) {
            console.log("userData null")
            return;
        }
        findPopLang(username);
        window.localStorage.setItem(username, JSON.stringify(userData));
    }
    console.log("came from local storage")
    findPopLang(username);
    fillProfileCard(userData);
}

searchButton.addEventListener('click', sendRequest);
window.localStorage.clear(); // used for remove cache in refresh