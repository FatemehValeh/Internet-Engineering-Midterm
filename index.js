const searchButton = document.querySelector('.search-btn');
const usernameInput = document.querySelector('.search-txt');
const avatarImage = document.querySelector('.profile_img')
const username = document.querySelector('.name');
const userId = document.querySelector('.user_id');
const bio = document.querySelector('.profile_bio');
const profileStatus = document.getElementsByClassName('num');
const locationDiv = document.querySelector('.place');
const locationText = document.querySelector('.place_name');
const error = document.querySelector('.error');
const languageDiv = document.querySelector(".language");
const language = document.querySelector(".popular_language");


// get request to get user data from API
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

// set the avatar in page
function setAvatar(avatar) {
    avatarImage.src = avatar;
}

// set full name of the user
function setName(userData) {
    if (userData.name == null) { // if user doesn't have full name, hide its element
        username.style.display = "none";
    } else {
        username.style.display = "block";
        username.innerHTML = userData.name;
    }
    userId.innerHTML = userData.login;
}

// set the bio 
function setBio(userData) {
    if (userData.bio == null)
        bio.innerHTML = `This user has no bio`;
    else
        bio.innerHTML = userData.bio;
}

// set followers, following and repositores counts
function setStatus(userData) {
    profileStatus[0].innerHTML = userData.followers;
    profileStatus[1].innerHTML = userData.following;
    profileStatus[2].innerHTML = userData.public_repos;
}

// set the location of user
function setLocation(userData) {
    if (userData.location == null) { // if user hasn't set location, hide it's element
        locationDiv.style.display = "none";
    } else {
        locationDiv.style.display = "block";
        locationText.innerHTML = userData.location;
    }
}

// set the user popular langeuage  
function setPopularLanguage(userData) {
    language.innerHTML = userData.popular_langeuage;
    languageDiv.style.display = "block";
}


// fill all user data in html
function fillProfileCard(userData) {
    console.log("user data:", userData);
    setAvatar(userData.avatar_url);
    setName(userData);
    setLocation(userData);
    setStatus(userData);
    setBio(userData);
    setPopularLanguage(userData);
}

// get request for all repositories of user from API
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

// find user popular language based on his 5 last repositories
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
    return popRepo[0][0]
}

// function that is called when seach button or enter key is pressed
async function sendRequest(e) {
    console.log("a search request");
    let username = usernameInput.value;
    if (username == "") {
        console.log("username was empty");
        return;
    }
    e.preventDefault();

    let userData;
    userData = await JSON.parse(window.localStorage.getItem(username)); // check if it is cached
    if (userData == null) { // isn't available in local storage
        userData = await getUserData(username); // make a request to get data
        if (userData == null) {
            console.log("userData null")
            return;
        }

        let popLnag = await findPopLang(username);
        userData['popular_langeuage'] = popLnag
        window.localStorage.setItem(username, JSON.stringify(userData)); // save data in local storage to prevent repetitive requests
    } else {
        console.log("loaded from local storage")
    }
    fillProfileCard(userData);
}

// for handle error
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

searchButton.addEventListener('click', sendRequest);
window.localStorage.clear(); // used for remove cache in refresh