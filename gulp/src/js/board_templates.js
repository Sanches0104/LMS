/*jshint esversion: 6 */

let url = "http://localhost:3000/";
let postUrl = `${url}post`;
let commentsUrl = `${url}comments`;
let userUrl = `${url}user`;
let backgroundCounter = 0;
let currentUserId = 6;
let currentUser = "Test user";
let currentRole = "Administrator";
const posts = document.querySelector('.posts');

let clickHandler = (event) => {
    let targetId = event.currentTarget.id;
    let targetClasslist = event.target.classList;
    let targetFirstClass = event.target.classList.item(0);
    switch (targetFirstClass) {
        case "btn-post":
            createComment(targetId);
            break;
        case "edit":
            updateMessage(targetId);
            break;
        case "delete":
            if (confirm("Подтвердите удаление сообщения")) {
                removeData(targetId);
            }
            break;
        case "pointer":
        case "pointer__arrow":
            showComments(targetId);
            break;
        case "icon":
            if (targetClasslist.contains("icon--comment")) {
                showComments(targetId);
            } else if (targetClasslist.contains("icon--like")) {
                increaseLikes(targetId);
            }
            break;

    }
};

function showComments(targetId) {
    let mainElement = select(`#${targetId}`);
    let comments = mainElement.querySelector(".comments");
    let arrow = mainElement.querySelector(".pointer__arrow");

    if (comments.style.display === "none") {
        comments.style.display = "block";
        arrow.classList.add("pointer--up");
        arrow.classList.remove("pointer--down");
    } else {
        comments.style.display = "none";
        arrow.classList.remove("pointer--up");
        arrow.classList.add("pointer--down");
    }
}

function setMessageDate() {
    var date = new Date();

    var dd = date.getDate();
    if (dd < 10) {
        dd = '0' + dd;
    }

    var mm = date.getMonth() + 1;
    if (mm < 10) {
        mm = '0' + mm;
    }

    var yy = date.getYear() - 100;

    return `${dd}/${mm}/${yy}`;
}

function setMessageTime() {
    return Date().substr(16, 5);
}

function select(name) {
    return document.querySelector(name);
}

function getPost(post) {
    const html = select('#post-template').textContent.trim();
    const compiled = _.template(html);
    const result = compiled(post);
    let div = document.createElement("div");
    if (backgroundCounter % 2) {
        div.classList.add("post-wrapper");
        backgroundCounter++;
    } else {
        div.classList.add("post-wrapper--middle-grey");
        backgroundCounter++;
    }
    div.setAttribute("id", ("post-" + post.id));
    div.innerHTML = result;
    posts.appendChild(div);
    let comment = document.querySelectorAll(".comments");
    comment[comment.length - 1].setAttribute("id", ("comment-post-" + post.id));
    addNewComment(comment[comment.length - 1], post.id);

    div.addEventListener('click', clickHandler);
}

function getComment(comment) {
    const comments = select(`#comment-post-${comment.postID}`);
    const newComment = comments.querySelector(".new-comment-wrapper");
    const commentHtml = select('#comment-template').textContent.trim();
    const compiledComment = _.template(commentHtml);
    const commentResult = compiledComment(comment);

    let div = document.createElement("div");
    div.setAttribute("id", ("comments-" + comment.id));

    div.innerHTML = commentResult;
    comments.insertBefore(div, newComment);

    div.addEventListener('click', clickHandler);

}

function addNewComment(place, postId) {
    const newComment = document.createElement("div");
    const newCommentHtml = select('#new-comment-template').textContent.trim();
    const newCompiledComment = _.template(newCommentHtml);
    const newCommentResult = newCompiledComment();

    newComment.classList.add("new-comment-wrapper");
    newComment.innerHTML = newCommentResult;
    newComment.setAttribute("id", ("addcomment-" + postId));

    place.appendChild(newComment);
    newComment.addEventListener('click', clickHandler);
}

function addCorrection(place, postId) {
    const correction = document.createElement("div");
    const correctionHtml = select('#correction-template').textContent.trim();
    const compiledCorrection = _.template(correctionHtml);
    const correctionResult = compiledCorrection();

    correction.classList.add("new-comment-wrapper");
    correction.innerHTML = correctionResult;
    correction.setAttribute("id", ("correction-" + postId));

    place.appendChild(correction);

    let change = select("#change");
    let cancel = select("#cancel");

    change.addEventListener("click", () => {
        place.removeChild(correction);
    });
    cancel.addEventListener("click", () => {
        place.removeChild(correction);
    });

}

function pageRender() {
    posts.innerHTML = "";
    console.log(`Fetching URL: ${postUrl}`);

    backgroundCounter = 0;

    fetch(postUrl)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error("Error fetching data. Response status: " + response.status + " : " + response.statusText);
        })
        .then(jsonArrey => {
            for (let json in jsonArrey) {
                getPost(jsonArrey[json]);
            }

            jsonArrey.forEach((json) => {
                let postId = json.id;
                let commentUrl = `${url}comments?postID=${postId}`;
                let post = select(`#post-${postId}`);
                let commentsCount = post.querySelector(".postcomments");

                fetch(commentUrl)
                    .then(response => {
                        if (response.ok) {
                            return response.json();
                        }
                        throw new Error("Error fetching data. Response status: " + response.status + " : " + response.statusText);
                    })
                    .then(jsonArray => {
                        commentsCount.textContent = jsonArray.length;
                        jsonArray.forEach((json) => {
                            getComment(json);
                        });
                    })
                    .catch(err => {
                        console.error("Error: ", err);
                    });
            });
        })
        .catch(err => {
            console.error("Error: ", err);
        });
}

function removeData(targetId) {
    let targetIdArray = targetId.split("-");

    let removeUrl = `${url}${targetIdArray[0]}/${targetIdArray[1]}`;
    console.log(`Fetching URL: ${removeUrl}`);

    let removed = {};

    removed.headers = {
        'Content-Type': 'application/json'
    };
    removed.method = "DELETE";

    removed.body = JSON.stringify({});

    fetch(removeUrl, removed)
        .then(response => {
            if (response.ok) {
                response.json();
            } else {
                throw new Error("Error fetching data. Response status: " + response.status + " : " + response.statusText);
            }
        })
        .then(() => {
            if (targetIdArray[0] == "post") {
                let commentUrl = `${url}comments?postID=${targetIdArray[1]}`;

                fetch(commentUrl)
                    .then(response => {
                        if (response.ok) {
                            return response.json();
                        }
                        throw new Error("Error fetching data. Response status: " + response.status + " : " + response.statusText);
                    })
                    .then(jsonArray => {
                        for (let item in jsonArray) {
                            console.log(jsonArray[item].id);
                            removeData(`comments-${jsonArray[item].id}`);
                        }
                    })
                    .then(pageRender);
            } else {
                pageRender();
            }
        })
        .catch(err => {
            console.error("Error: ", err);
        });
}

function increaseLikes(targetId) {
    let targetIdArray = targetId.split("-");

    let updateUrl = `${url}${targetIdArray[0]}/${targetIdArray[1]}`;
    let getUrl = `${url}${targetIdArray[0]}/${targetIdArray[1]}`;

    console.log(`Fetching URL: ${updateUrl}`);

    fetch(getUrl)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error("Error fetching data. Response status: " + response.status + " : " + response.statusText);
        })
        .then(json => {
            let newLikes = json.likes + 1;

            let updated = {};

            updated.headers = {
                'Content-Type': 'application/json'
            };
            updated.method = "PATCH";

            updated.body = JSON.stringify({
                "likes": newLikes
            });

            fetch(updateUrl, updated)
                .then(response => {
                    if (response.ok) {
                        response.json();
                    } else {
                        throw new Error("Error fetching data. Response status: " + response.status + " : " + response.statusText);
                    }
                })
                .then(pageRender);
        })
        .catch(err => {
            console.error("Error: ", err);
        });
}

function createPost() {

    console.log(`Fetching URL: ${postUrl}`);

    let added = {};

    added.headers = {
        'Content-Type': 'application/json'
    };
    added.method = "POST";
    added.body = JSON.stringify({
        "isNew": true,
        "title": "Next post",
        "date": setMessageDate(),
        "time": setMessageTime(),
        "userID": currentUserId,
        "userName": currentUser,
        "userRole": currentRole,
        "message": "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
        "likes": 0
    });

    fetch(postUrl, added)
        .then(response => {
            if (response.ok) {
                response.json();
            } else {
                throw new Error("Error fetching data. Response status: " + response.status + " : " + response.statusText);
            }
        })
        .then(pageRender)
        .catch(err => {
            console.error("Error: ", err);
        });
}

function createComment(targetId) {

    console.log(`Fetching URL: ${commentsUrl}`);

    let targetIdArray = targetId.split("-");
    let added = {};
    let newComment = select(`#${targetId}`);
    let message = newComment.querySelector(".new-comment__title").value;
    let newCommentsArray;

    added.headers = {
        'Content-Type': 'application/json'
    };
    added.method = "POST";
    added.body = JSON.stringify({
        "postID": Number(targetIdArray[1]),
        "isNew": true,
        "date": setMessageDate(),
        "time": setMessageTime(),
        "userID": currentUserId,
        "userName": currentUser,
        "userRole": currentRole,
        "message": message,
        "likes": 0
    });

    fetch(commentsUrl, added)
        .then(response => {
            if (response.ok) {
                response.json();
            } else {
                throw new Error("Error fetching data. Response status: " + response.status + " : " + response.statusText);
            }
        })
        .then(pageRender)
        .catch(err => {
            console.error("Error: ", err);
        });
}

function updateMessage(targetId) {

    let targetIdArray = targetId.split("-");

    let post = select(`#${targetId}`);
    let message = post.querySelector(".contents__text");
    let currentMessage = message.textContent.trim();

    addCorrection(message, 100000000000000000);
    let temp = select("#correction-100000000000000000");
    let tempMessage = temp.querySelector(".new-comment__title");
    tempMessage.textContent = currentMessage;
    tempMessage.style.minHeight = "100px";

    let button = temp.querySelector("#change");

    button.addEventListener("click", () => {
        let updateUrl = `${url}${targetIdArray[0]}/${targetIdArray[1]}`;
        console.log(`Fetching URL: ${updateUrl}`);

        let updated = {};

        updated.headers = {
            'Content-Type': 'application/json'
        };
        updated.method = "PATCH";

        updated.body = JSON.stringify({
            "message": tempMessage.value
        });

        if (confirm("Внести изменения?")) {

            fetch(updateUrl, updated)
                .then(response => {
                    if (response.ok) {
                        response.json();
                    } else {
                        throw new Error("Error fetching data. Response status: " + response.status + " : " + response.statusText);
                    }
                })
                .then(pageRender);
        }
    });
}

let addIcon = select(".icon-add");
addIcon.addEventListener("click", createPost);

window.onload = pageRender();