const ENDPOINT = "https://www.victorsmartkill.com/"
let TOKEN = null;

function loadCreds() {
    let username = localStorage.getItem("username");
    if(username) {
        document.getElementById("username").value = username;
    }
    let password = localStorage.getItem("password");
    if(password) {
        document.getElementById("password").value = password;
    }
}

function saveCreds() {
    let username = document.getElementById("username").value;
    localStorage.setItem("username", username);
    let password = document.getElementById("password").value;
    localStorage.setItem("password", password);
}

function setShowPassword(show) {
    let element = document.getElementById("password");
    if(show) {
        element.type = "text";
    } else {
        element.type = "password";
    }
}

function getAuth() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    return {
        username: username,
        password: password,
    };
}

async function getToken() {
    if(!TOKEN) {
        const response = await fetch(ENDPOINT + "api-token-auth/", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(getAuth()),
        });
        const data = await response.json();
        TOKEN = data["token"];
    }
    return TOKEN;
}

async function query(path) {
    let token = await getToken();
    if(token === undefined) {
        return null;
    }
    const response = await fetch(ENDPOINT + path, {
        method: "GET",
        headers: {
            'authorization': "Token " + (await getToken()),
        },
    });
    const result = await response.json();
    if(result.hasOwnProperty("results")) {
        return result["results"];
    }
    return result;
}

// React is overrated. This is just as good:
function make(tagName, classList, ...children) {
    if(!classList) {
        classList = [];
    } else if(typeof(classList) == "string") {
        classList = [classList];
    }
    let element = document.createElement(tagName);
    element.classList.add(...classList);
    element.append(...children);
    return element;
}

function p(s) {
    return make("p", null, s);
}

function trapElement(trap) {
    const stats = trap["trapstatistics"];
    return make("div", "trap",
        make("h3", "trap-name", trap["name"]),
        p(`Last updated: ${new Date(stats["last_report_date"]).toLocaleString()}`),
        p(`Battery: ${stats["battery_level"]}%`),
        p((stats["kills_present"] === 0) ? "No kill present" : `Kills present: ${stats["kills_present"]}`),
        make("hr"),
        make("details", null,
            make("summary", null, "Raw JSON"),
            make("pre", null,
                make("code", null, JSON.stringify(trap, null, 2)),
            ),
        ),
    );
}

function clear(element) {
    while(element.lastChild) element.removeChild(element.lastChild);
}

async function loadTraps() {
    let element = document.getElementById("traps");

    clear(element);
    element.append("Loading...")
    let traps = await query("traps/");
    clear(element);

    if(traps === null) {
        element.append("Missing or invalid credentials.")
        return;
    } else if (traps.length === 0) {
        element.append("No traps")
    }

    for(let trap of traps) {
        element.append(trapElement(trap));
    }
}

loadCreds();
loadTraps().then(() => console.log("Loaded traps."));
