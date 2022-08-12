// ©2022 Nilvin Sathnindu Kottage - All Rights Reserved
// E-mail: devbysatha@gmail.com

const pageId = document.getElementsByTagName("body")[0].id;
const API_URL = 'https://dpacks-nightly-server.herokuapp.com';

// Login view
const hash = window.location.hash.substr(1);
const user = JSON.parse(localStorage.getItem('user'));

// -- class checker --
let file_path = document.getElementById("dpack_admin_script").src;
let the_arr = file_path.split('/');
the_arr.pop();
const base_url = the_arr.join('/');

if (user && user.accessToken) {
    console.log("dpacks: Admin protocol activated");
    admin();
}

if (hash === "dpacks") {
    if (user && user.accessToken) {
        window.location.href = window.location.href.split('#')[0];
    } else {
        console.log("login");
        let login_div = document.createElement("div");
        login_div.setAttribute("class", "dpacks_login")
        login_div.innerHTML =
            '<div class="con-mid" style="width: 100%; min-height: 100vh;" id="dpacks_login_form">' +
            '<div class="con-mid dpacks-login-form-style-line">' +
            '<div class="dpacks_login_box">' +
            '<img class="dpacks_login_logo" src="http://localhost/dpacks/dpacks-nightly/logo.png" alt="logo" />' +
            '<p class="dpacks_copyright_text" style="color: #fff;">V1.0 - BETA 1</p>' +
            '<p class="dpacks_copyright_text" style="color: #fff; margin-bottom: 25px;">TECHNICAL PREVIEW</p>' +
            '<input placeholder="Email" type="text" id="dpacks_login_email">' +
            '<br/>' +
            '<input placeholder="Password" type="password" id="dpacks_login_password">' +
            '<br/>' +
            '<div id="dpacks-login-bad-credentials" style="display: none; color: #f85149; background-color: #160b0b; border: 1px solid #f85149; margin: 0 10px; font-size: 0.675rem; border-radius: 10px; padding: 10px 20px;">Invalid Credentials</div>' +
            '<br/>' +
            '<button onclick="dpacksLogin()" id="dpacks-login-btn">Login</button>' +
            '<br/>' +
            '<a href="https://dpacks.space/forgot" class="dpacks_forgot_password">Forgot Password?</a>' +
            '<div style="width: 100%;" class="con-mid dpacks_login_footer">' +
            '<p class="dpacks_copyright_text">' +
            '<span>©' + new Date().getFullYear() + ' DPACKS TECHNOLOGY - </span>' +
            '<strong><span>BY <a href="https://bysatha.netlify.app/" style="color: #000A2A; text-decoration: none;">SATHA</a></span>' +
            '</strong></p>' +
            //'<img src="./satha.png" alt="SATHA" style="width: 70px;"/>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
        document.getElementsByTagName("body")[0].after(login_div);
    }
}

console.log("dpacks: " + dpacks_key);

function authHeader() {
    if (user && user.accessToken) {
        return {SiteKey: dpacks_key, Authorization: 'Bearer ' + user.accessToken}; // for Spring Boot back-end
        //return { 'x-access-token': user.accessToken };       // for Node.js Express back-end
    } else {
        return {};
    }
}

function dpacksLogin() {
    document.getElementById("dpacks-login-bad-credentials").style.display = "none";
    document.getElementById("dpacks-login-btn").innerText = "Loading...";
    axios.post(API_URL + '/api/auth/signin', {
            username: document.getElementById("dpacks_login_email").value,
            password: document.getElementById("dpacks_login_password").value
        }
    )
        .then(function (response) {
            localStorage.setItem("user", JSON.stringify(response.data));
            window.location.href = window.location.href.split('#')[0];
            /*if (user) {
                const decodedJwt = user.accessToken;
                if (decodedJwt.exp * 1000 < Date.now()) {
                    //props.logOut();
                }
            }*/
            document.getElementById("dpacks-login-btn").innerText = "Login";
        })
        .catch(function (error) {
            document.getElementById("dpacks-login-bad-credentials").style.display = "block";
            document.getElementById("dpacks-login-btn").innerText = "Login";
            console.log(error);
        });
}

function dpacksLogOut() {
    localStorage.removeItem("user");
    if (window.location.href.slice(-1) === '/') {
        window.location.href = window.location.href.slice(0, -1);
    } else {
        window.location.replace(window.location.href);
    }
}


// -- data edit saving ajax (update json file) --
function jsave(id) {
    document.getElementById("dpacks-admin-status").innerText = "SAVING...";
    axios.put(API_URL + '/api/v1/json-update', {
        id: id,
        page: pageId,
        key: 'text',
        //value: $("#text_" + id).val()
        value: document.getElementById(id).innerText
    }, {
        headers: authHeader()
    }).then(function (response) {
        console.log(response);
        document.getElementById("dpacks-admin-status").innerText = "SAVED TO IPFS";
    }).catch(function (error) {
        document.getElementById("dpacks-admin-status").innerText = "ERROR";
        console.log(error);
    });
}

async function allJSave() {
    document.getElementById("dpacks-admin-status").innerText = "SAVING...";
    // -- edit save inner text
    let tagsList = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const jsonData = document.querySelectorAll(tagsList);

    // cleaner element array init
    let pageElementArray = [];

    for (let i = 0; i < jsonData.length; i++) {

        // -- id checker
        if (jsonData[i].hasAttribute('id')) {
            // -- id declaration --
            let id = jsonData[i].id;

            // cleaner element array push
            pageElementArray.push(id);


            // get default data
            let curr_element = document.getElementById(id);
            let curr_text = curr_element.innerHTML;


            axios.get(API_URL + '/api/v1/cid', {
                    headers: {
                        siteId: dpacks_key,
                        page: pageId,
                        element: id
                    }
                }
            ).then(function (response) {

                // -- check if data file exists --
                let xhr = new XMLHttpRequest();
                xhr.responseType = 'json';
                // xhr.open('GET', base_url + '/b2/' + dpacks_key + '_' + pageId + '_' + id + '.json');
                xhr.open('GET', 'https://gateway.pinata.cloud/ipfs/' + response.data);
                xhr.send();
                xhr.onload = function (e) {
                    if (xhr.readyState === 4) {
                        // -- create json file --
                        async function createJSON() {
                            axios.put(API_URL + '/api/v1/json-update', {
                                id: id,
                                page: pageId,
                                key: 'text',
                                value: curr_text
                            }, {
                                headers: authHeader()
                            })
                                .then(function (response) {
                                    document.getElementById("dpacks-admin-status").innerText = "SAVED TO IPFS";
                                    console.log(response);
                                })
                                .catch(function (error) {
                                    document.getElementById("dpacks-admin-status").innerText = "ERROR";
                                    console.log(error);
                                });
                        }

                        createJSON().then(async r => {
                            console.log(r);
                        }).catch(error => {
                            console.log(error);
                        });

                    }
                }

            }).catch(function (error) {
                console.log(error);
            });


        }
        // cleaner element array display
        if (i === jsonData.length - 1) {
            await cleaner(pageElementArray);
            console.log(pageElementArray);
        }
    }
}

// admin login and other css
let css =
        '/*@import url(\'https://fonts.googleapis.com/css2?family=Finger+Paint&display=swap\');*/' + '/*@import url(\'https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+Antique:wght@400;500&display=swap\');*/' + '@font-face {' + 'font-family: \'Zen Kaku Gothic Antique\';' + '    src:  url(\'../fonts/ZenKakuGothicAntique-Regular.ttf\') format(\'ttf\')' + '}' + '@font-face {' + '    font-family: \'Finger Paint\';' + '    src:  url(\'../fonts/FingerPaint-Regular.ttf\') format(\'ttf\')' + '}' + '.con-mid {display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;} ' + '.dpacks_nav_right {right: 0px; position: fixed;}' + '.dpacks_nav_left {left: 0px; position: fixed;}' + '.dpacks_nav_content {width: 280px; background-color: #000A2A; border: 2px solid #737DFF; height: 38px; border-radius: 10px; display: inline-block; box-shadow: 0px 9px 20px 2px #00000075;}' + '@media screen and (max-width: 420px) {.dpacks_nav_logo{display: none;}}' + '.dpacks_nav_content_a {text-decoration: none; margin: 0px 5px; width: 40px; height: 31px; margin-top: 6px; display: inline-block; font-family: \'Finger Paint\', \'Zen Kaku Gothic Antique\', sans-serif; font-weight: 500; background-color: transparent; color: #fff;}' + '.dpacks_nav_content_a:hover {text-decoration: none; background-color: #737DFF; border-top-right-radius: 7px; border-top-left-radius: 7px;} ' +
        '@import url(\'https://fonts.googleapis.com/css2?family=Radio+Canada&display=swap\');' +
        '.dpacks_modal {width: 100vw; ' + 'height: 100vh; ' + 'background-color: #000a2a; ' + 'color: #fff; ' + 'position: fixed; ' + 'top: 0; ' + 'left: 0; ' + 'right: 0; ' + 'overflow-y: scroll; ' + 'z-index: 99992; ' + 'font-family: \'Zen Kaku Gothic Antique\', sans-serif !important; ' + 'font-weight: 500; ' + '}' +
        '.dpacks_modal_inner {' + 'background-color: #111541;' + 'border: 1px solid #737DFF; ' + 'margin: 30px; ' + 'padding: 30px; ' + 'border-radius: 10px; ' + 'box-shadow: 0 0 30px 6px #737dff1c;' + '}' +
        '.dpacks_modal_inner textarea, .dpacks_modal_inner input, .dpacks_modal_inner select {' + 'background-color: #000a2a;' + 'padding: 14px;' + 'margin-bottom: 16px;' + 'color: #fff; ' + 'border: 1px solid #414796;' + 'border-radius: 10px;' + 'outline: none; ' + 'box-shadow: none; ' + 'min-width: 150px; ' + '}' +
        '.dpacks_modal_inner textarea {' + 'width: 400px;' + 'height: 200px; ' + 'max-width: 93%; ' + '}' +
        '.dpacks_modal_inner textarea:hover, .dpacks_modal_inner textarea:focus, .dpacks_modal_inner textarea:active, .dpacks_modal_inner input:hover, .dpacks_modal_inner input:focus, .dpacks_modal_inner input:active, .dpacks_modal_inner select:hover, .dpacks_modal_inner select:active, .dpacks_modal_inner select:focus {' + 'outline: none;' + 'box-shadow: none; ' + '}' + '' + '.dpacks_modal_topics {' + 'font-family: \'Finger Paint\', \'Zen Kaku Gothic Antique\', sans-serif;' + '}' + '' + '.modal_element_page_id {' + 'font-size: 12px; ' + 'background-color: #000a2a; ' + 'padding: 5px 10px;' + 'border-radius: 5px;' + '}' + '' + '.dpacks-button {' + 'background-color: #007bff;' + 'color: #fff;' + 'padding: 7px 12px 6px 12px;' + 'border-radius: 10px;' + 'box-shadow: 0px 5px 20px #027bfe45;' + 'border: 1px solid transparent;' + 'border-color: #007bff;' + '}' + '' + '.dpacks-button:hover {' + 'background-color: #0069d9;' + 'box-shadow: 0px 0px 10px #027bfe45;' + '}' + '' + '.dpacks-close-button {' + 'float: right;' + 'width: 80px;' + '}' + '' + '.dpacks-save-button {' + 'margin-top: 10px;' + 'width: 80px;' + '}' +
        '.dpacks-attr-btn {background-color: #000A2A; color: #fff; box-shadow: none; outline: none; border: 2px solid #737DFF; border-radius: 5px; font-size: 12px;}' +
        '.dpacks-attr-btn:hover {cursor: pointer;}' +
        '.dpacks_login {width: 100%; min-height: 100vh; background-color: #000A2A; position: fixed; top: 0px; left: 0px;}' +
        '.dpacks_login_box {width: 360px;}' +
        '.dpacks_login_logo {width: 250px; margin-bottom: 20px;}' +
        '#dpacks_login_form ::placeholder {' +
        'color: #737DFF;' +
        'font-size: 14px;' +
        '}' +
        '#dpacks_login_form {' +
        'font-family: \'Radio Canada\', sans-serif;' +
        '}' +
        '#dpacks_login_form input, #dpacks_login_form input:focus {' +
        'outline:none; ' +
        'height: 40px; ' +
        'border-top-right-radius: 10px;' +
        'border-top-left-radius: 10px;' +
        'border-color: transparent;' +
        'border-bottom: 2px dashed #737dff87;' +
        'color: #fff !important; ' +
        'background-color: #000f3d; ' +
        'font-weight: 500 !important; ' +
        'text-align: center; ' +
        'width: 280px;' +
        'margin-bottom: 20px;' +
        'padding: 5px 30px;' +
        '}' +
        '#dpacks_login_form input:focus {' +
        'border-bottom: 2px solid #737DFF;' +
        '}' +
        '@media screen and (max-width: 400px) {' +
        '#dpacks_login_form input, #dpacks_login_form input:focus {' +
        'width: 250px;' +
        'padding: 5px 15px;' +
        '}' +
        '}' +
        '@media screen and (max-width: 350px) {' +
        '#dpacks_login_form input, #dpacks_login_form input:focus {' +
        'width: 230px;' +
        'padding: 5px 10px;' +
        '}' +
        '}' +
        '@media screen and (max-width: 1024px) {' +
        '.dpacks-login-form-style-line {' +
        'border: none !important;' +
        '}' +
        '}' +
        '#dpacks_login_form button {' +
        'width: 160px;' +
        'border-color: transparent;' +
        'cursor: pointer;' +
        'border-radius: 10px;' +
        'background-color: #737DFF;' +
        'height: 40px;' +
        'color: #fff;' +
        'margin-top: 20px;' +
        'margin-bottom: 30px;' +
        'box-shadow: 0px 5px 20px #737dff6b' +
        '}' +
        '#dpacks_login_form button:hover {' +
        'box-shadow: none;' +
        '}' +
        '#dpacks_login_form .dpacks_forgot_password {' +
        'color: #737dff;' +
        'text-decoration: none;' +
        'font-size: 11px;' +
        '}' +
        '.dpacks-login-form-style-line {' +
        'height: 100vh;' +
        'width: 50%;' +
        //'border-left: 1px dashed #737dff;' +
        '}' +
        '.dpacks_login_footer {' +
        'background-color: #737dff;' +
        'color: #fff;' +
        'height: 30px;' +
        'left: 0px;' +
        'bottom: 0px;' +
        'position: absolute;' +
        'text-align: center;' +
        'padding-left: 7px;' +
        'padding-right: 7px;' +
        '}' +
        '#dpacks_login_email:hover, #dpacks_login_password:hover {' +
        'border-bottom: 2px solid #737dff87;' +
        '}' +
        '.dpacks_copyright_text{' +
        'text-align: center;' +
        'color: #000A2A;' +
        'font-family: \'Zen Kaku Gothic Antique\', sans-serif;' +
        'font-size: 8px;' +
        'letter-spacing: 4px;' +
        '}' +
        '.attr-control-btn {' +
        'outline: none;' +
        'border: none;' +
        'box-shadow: none;' +
        'margin: 3px 5px 15px 0;' +
        'padding: 5px 10px;' +
        'border-radius: 5px;' +
        '}' +
        '.attr-control-btn:hover {' +
        'cursor: pointer;' +
        '}' +
        '.attr-control-btn-update {' +
        'border: 1px solid #d29922;' +
        'background-color: rgb(22, 11, 11);' +
        'color: #d29922;' +
        '}' +
        '.attr-control-btn-update:hover {' +
        'background-color: #d29922;' +
        'color: #fff;' +
        '}' +
        '.attr-control-btn-del {' +
        'border: 1px solid #f85149;' +
        'background-color: rgb(22, 11, 11);' +
        'color: #f85149;' +
        '}' +
        '.attr-control-btn-del:hover {' +
        'background-color: #f85149;' +
        'color: #fff;' +
        '}' +
        '.dpacks-button:hover {' +
        'cursor: pointer;' +
        '}',

    head = document.head || document.getElementsByTagName('head')[0],
    style = document.createElement('style');
head.appendChild(style);
style.type = 'text/css';
if (style.styleSheet) {
    // This is required for IE8 and below.
    style.styleSheet.cssText = css;
} else {
    style.appendChild(document.createTextNode(css));
}

// attribute save
function attrSave(id) {

    document.getElementById("attr_save_" + id).innerText = "Saving...";

    function attrSavingAjax() {
        axios.put(API_URL + '/api/v1/json-update', {


            id: id,
            page: pageId,
            key: $("#dpacks_attr_key_" + id).val(),
            value: $("#dpacks_attr_key_value_" + id).val()


        }, {
            headers: authHeader()
        }).then(function (response) {
            document.getElementById("attr_save_" + id).innerText = "Saved";
            window.location.reload();
            console.log(response);
        }).catch(function (error) {
            console.log(error);
        });
    }

    attrSavingAjax();

}

// admin view
function admin() {


    // dPacks navbar
    //document.getElementsByTagName("html")[0].style.setProperty('margin-top', 40 + 'px', 'important');

// menu element
    let header_ele = document.getElementsByTagName("body")[0];
    let div = document.createElement("div");
    div.setAttribute("id", "dpacks-nightly-settings-nav");
    div.setAttribute("class", "con-mid");
    div.setAttribute("style", "position: fixed; z-index: 2147483640; height: 40px; left: 20px; margin: 0px; bottom: 20px!important;");

    div.innerHTML =
        '<div class=\"dpacks_nav_content con-mid\">' +
        '<a class=\"dpacks_nav_content_a con-mid\" href=\"https://gitcoin.co/tip?username=sathninduk\">💰</a>' +
        '<a class=\"dpacks_nav_content_a con-mid\" href=\"\" onclick=\"allJSave()\">💾</a>' +
        '<a class=\"dpacks_nav_content_a con-mid\" href=\"https://dpacks.space/login\">🛠</a>' +
        '<a class=\"dpacks_nav_content_a con-mid\" onclick=\"hiddenElementsList()\" href=\"\">🙈</a>' +
        '<a class=\"dpacks_nav_content_a con-mid\" href=\"\" onclick="dpacksLogOut()">👋️</a>' +
        '</div>';

    let div2 = document.createElement("div");
    let div3 = document.createElement("div");
    div2.setAttribute("id", "dpacks-nightly-status-nav");
    div3.setAttribute("id", "dpacks-nightly-attr-instruction-nav");
    div2.setAttribute("class", "con-mid");
    div3.setAttribute("class", "con-mid");
    div2.setAttribute("style", "border: 2px solid #737DFF; position: fixed; z-index: 2147483640; padding: 10px 10px; border-radius: 10px; width: 140px; right: 10px; margin: 0px; top: 10px!important; background-color: #000A2A;");
    div3.setAttribute("style", "border: 2px solid #737DFF; position: fixed; z-index: 2147483640; padding: 10px 10px; border-radius: 10px; width: 140px; right: 10px; margin: 0px; top: 46px!important; background-color: #000A2A;");

    div2.innerHTML =
        //'<img src="./logo.png"  alt="dpacks logo" style="width: 80px;" />' +
        //'<br />' +
        '<span id="dpacks-admin-status" style="font-family: \'Zen Kaku Gothic Antique\', sans-serif; font-size: 8px; letter-spacing: 4px; color: #fff;">ADMIN PROTOCOL</span>';

    div3.innerHTML =
        //'<img src="./logo.png"  alt="dpacks logo" style="width: 80px;" />' +
        //'<br />' +
        '<span id="dpacks-admin-status" style="font-family: \'Zen Kaku Gothic Antique\', sans-serif; font-size: 6px; letter-spacing: 1px; color: #fff;">RIGHT CLICK ON THE ELEMENT TO EDIT ATTRIBUTES</span>';

    if (hash !== "dpacks") {
        header_ele.appendChild(div);
        header_ele.appendChild(div2);
        header_ele.appendChild(div3);
    }


// -- class checker --
    let tagsList = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const jsonData = document.querySelectorAll(tagsList);
    console.log(jsonData);
    for (let i = 0; i < jsonData.length; i++) {

        // -- id checker
        if (jsonData[i].hasAttribute('id')) {

            // -- id declaration --
            let id = jsonData[i].id;

            console.log(id);

            if (id !== 'dpacks-nightly-settings-nav') {
                // get default data
                let curr_element = document.getElementById(id);
                let curr_text = curr_element.innerText;

                axios.get(API_URL + '/api/v1/cid', {
                        headers: {
                            siteId: dpacks_key,
                            page: pageId,
                            element: id
                        }
                    }
                ).then(function (response) {

                    console.log(response.data);

                    if (response.data === "default_start") {
                        // 404
                        // -- create json file --
                        async function createJSON() {

                            let formDataTest = {
                                id: id,
                                page: pageId,
                                text: curr_text,
                                attrKey: [],
                                attrValue: []
                            }

                            for (let att, j = 0, atts = jsonData[i].attributes, n = atts.length; j < n; j++) {
                                att = atts[j];
                                if (att.nodeName !== "id") {
                                    formDataTest.attrKey.push(att.nodeName);
                                    formDataTest.attrValue.push(att.nodeValue);
                                }
                            }

                            axios.post(API_URL + '/api/v1/json',
                                formDataTest, {
                                    headers: authHeader()
                                }
                            )
                                .then(function (response) {
                                    console.log(response);
                                })
                                .catch(function (error) {
                                    console.log(error);
                                });
                        }

                        createJSON().then(async r => {
                            //await location.reload();
                            console.log("200");
                        }).catch(error => {
                            console.log(error);
                        });


                    } else {


                        axios.get('https://gateway.pinata.cloud/ipfs/' + response.data, {}).then(function (response) {
                            console.log(response);
                        }).catch(function (error) {
                            // console.log(error);
                        }).then(function () {
                            }
                        )

                        // -- check if data file exists --
                        let xhr = new XMLHttpRequest();
                        xhr.responseType = 'json';
                        xhr.open('GET', 'https://gateway.pinata.cloud/ipfs/' + response.data);
                        xhr.send();
                        xhr.onload = function (e) {
                            if (xhr.readyState === 4) {
                                if (xhr.status === 400 || xhr.status === 404) {
                                    // 404
                                    // -- create json file --
                                    async function createJSON() {

                                        let formDataTest = {
                                            id: id,
                                            page: pageId,
                                            text: curr_text,
                                            attrKey: [],
                                            attrValue: []
                                        }

                                        for (let att, j = 0, atts = jsonData[i].attributes, n = atts.length; j < n; j++) {
                                            att = atts[j];
                                            if (att.nodeName !== "id") {
                                                formDataTest.attrKey.push(att.nodeName);
                                                formDataTest.attrValue.push(att.nodeValue);
                                            }
                                        }

                                        axios.post(API_URL + '/api/v1/json',
                                            formDataTest, {
                                                headers: authHeader()
                                            }
                                        )
                                            .then(function (response) {
                                                console.log(response);
                                            })
                                            .catch(function (error) {
                                                console.log(error);
                                            });
                                    }

                                    createJSON().then(async r => {
                                        //await location.reload();
                                        console.log(r);
                                    }).catch(error => {
                                        console.log(error);
                                    });

                                } else if (xhr.status === 200) {
                                    // 200
                                    // append data to webpage

                                    //axios.get(base_url + '/b2/' + dpacks_key + '_' + pageId + '_' + id + '.json')
                                    //fetch(base_url + '/b2/' + dpacks_key + '_' + pageId + '_' + id + '.json')
                                    fetch('https://gateway.pinata.cloud/ipfs/' + response.data)
                                        .then(response => {
                                            if (!response.ok) {
                                                throw new Error("HTTP error " + response.status);
                                            }
                                            return response.json();
                                        })
                                        .then(json => {
                                            appendData(json);
                                        })
                                        .catch(e => {
                                            console.log('error: ' + e);
                                        })

                                } else {
                                    // other error codes
                                    console.log('Network status: ' + xhr.status)
                                }
                            }
                        };

                    } // default start else


                }).catch(function (error) {
                    console.log(error);
                });
            }
            // axios get checker


            // -- append data from data files (view fetch) - function --
            function appendData(data) {

                if (data[0].page == pageId && data[0].id == id) {

                    jsonData[i].setAttribute('contenteditable', 'true');

                    function htmlDecode(input) {
                        let doc = new DOMParser().parseFromString(input, "text/html");
                        return doc.documentElement.textContent;
                    }

                    let mainContainer = document.getElementById(id);
                    mainContainer.innerHTML = htmlDecode(data[0].text);
                    mainContainer.setAttribute("oncontextmenu", "attrModel(\'" + id + "\'); attrValueCall(\'" + id + "\');");

                    let atrArray = data[0];
                    Object.keys(atrArray).forEach(key => {
                        if (key == 'tag_class') {
                            mainContainer.setAttribute("class", atrArray[key]);
                        } else if (key != 'text' && key != 'id' && key != 'page') {
                            mainContainer.setAttribute(key, atrArray[key]);
                        }
                    });


                    let div = document.createElement("div");
                    let div2 = document.createElement("div");
                    let div3 = document.createElement("div");

                    let btn = document.createElement("button");
                    let btn1 = document.createElement("button");
                    let btn2 = document.createElement("button");
                    let btn3 = document.createElement("button");

                    //btn.setAttribute("onClick", "jDataModel(\'" + id + "\')");
                    btn.setAttribute("onClick", "jsave(\'" + String(id) + "\')");
                    btn1.setAttribute("onClick", "jDataModel(\'" + id + "\')");
                    btn2.setAttribute("onClick", "deleteData(\'" + id + "\')");
                    btn3.setAttribute("oncontextmenu", "attrModel(\'" + id + "\'); attrValueCall(\'" + id + "\');");
                    btn3.setAttribute("class", "dpacks-attr-btn");

                    div2.setAttribute("style", "display: none;");
                    div2.setAttribute("class", "dpacks_modal");

                    div3.setAttribute("style", "display: none;");
                    div3.setAttribute("class", "dpacks_modal");

                    div2.setAttribute("id", "model_" + id);
                    div3.setAttribute("id", "attrModal_" + id);

                    if ($('#' + id).is(":visible") == false || $('#' + id).is(":hidden") == true) {
                        jDataCloseModel_func('jDataCloseModel_hidden');
                        attrCloseModel_func('attrCloseModel_hidden');
                    } else {
                        jDataCloseModel_func('jDataCloseModel');
                        attrCloseModel_func('attrCloseModel');
                    }

                    function jDataCloseModel_func(jDataCloseModel_type) {
                        div2.innerHTML = '<div class=\"dpacks_modal_inner\"><button class="dpacks-button dpacks-close-button" onClick="' + jDataCloseModel_type + '(\'' + String(id) + '\')">Back</button><br><span class=\"dpacks_modal_topics\">Edit content<br><span class=\"modal_element_page_id\"><span style=\"color: #97aeff\">Page ID: </span>' + String(pageId) + ', <span style=\"color: #97aeff\">Element ID: </span>' + String(id) + '<br></span></span>' + '<br><textarea style="font-family: Zen Kaku Gothic Antique, sans-serif;" id="text_' + String(id) + '">' + String(data[0].text) + '</textarea><br><button class="dpacks-button dpacks-save-button" onclick="jsave(\'' + String(id) + '\')">Save</button></div>';
                    }

                    function attrCloseModel_func(attrCloseModel_type) {
                        div3.innerHTML = '<div class=\"dpacks_modal_inner\">' + '<button class="dpacks-button dpacks-close-button" onClick="' + attrCloseModel_type + '(\'' + String(id) + '\')">Back</button><br><span class=\"dpacks_modal_topics\">Edit attributes<br><span class=\"modal_element_page_id\"><span style=\"color: #97aeff\">Page ID: </span>' + String(pageId) + ', <span style=\"color: #97aeff\">Element ID: </span>' + String(id) + '</span></span>' + '<div id=\"dpack_data_attr_' + id + '\"></div>' + '<br>' + '<div class=\"dpacks_modal_topics\" id="dpacks_modal_topics" style="display: none;"></div>' + '<div id=\"dpacks_attr_div_' + id + '\"></div>' + '<hr style="border-color: #414796;"/><br/>' + '<div id=\"add-new-attr\" style=\"font-family: Zen Kaku Gothic Antique, sans-serif;\">' + 'Add New / Update' + '<br /><br />' + '<input placeholder=\"Attribute name\" style=\"width: 280px;" id=\"dpacks_attr_key_' + id + '\">' + '<br />' + '<textarea placeholder=\"Attribute value\" style=\"max-width: 280px; min-width: 280px; font-family: Zen Kaku Gothic Antique, sans-serif; min-height: 70px; height: 70px;\" id=\"dpacks_attr_key_value_' + id + '\"></textarea>' + '<br><button class="dpacks-button dpacks-save-button" onclick="attrSave(\'' + String(id) + '\')" id="attr_save_' + id + '">Save</button>' + '</div>' + '</div>' + '<br/><br/><br/>';
                    }

                    mainContainer.after(div);
                    mainContainer.after(div2);
                    mainContainer.after(div3);

                    if (
                        Object.keys(data[0]).length <= 2
                    ) {
                        div.appendChild(btn1);
                        btn1.innerText = 'Add';
                    } else {

                        // admin buttons

                        // div.appendChild(btn);
                        // div.appendChild(btn3);
                        // div.appendChild(btn2);


                        btn.innerText = 'Save';
                        btn3.innerText = 'A';
                        btn2.innerText = 'Delete';
                    }

                    // Checks CSS content for display:[none|block], ignores visibility:[true|false]
                    // The same works with hidden
                    if ($('#' + id).is(":visible") == false || $('#' + id).is(":hidden") == true) {
                        console.log(id);

                        let ul = document.getElementById("dpacks_hiddenList_ul_element");
                        let name = id;
                        let li = document.createElement('li');
                        li.setAttribute("id", "dpacks_hidden_elements_" + id);

                        li.innerHTML =
                            "<button onclick=\"jDataModel_hidden(\'" + id + "\')\">Edit</button>" +
                            "<button onclick=\"attrModel_hidden(\'" + id + "\');\">Attributes</button>" +
                            "<button onclick=\"deleteData(\'" + id + "\')\">Delete</button>";

                        li.appendChild(document.createTextNode(name));
                        ul.appendChild(li);

                    }

                }
            }

            // -- append data from data files (view fetch) - function - end --
            /*if (i + 1 == jsonData.length && $('#dpacks_style').length > 0) {
                dPacksClassStylesRemove();
            }*/
        }
    }

// css style tag append
    /*function dPacksClassStylesRemove() {
        let css = '.dpack {color: inherit; min-height: inherit; animation: inherit; background-image: inherit; background-size: inherit; background-position: inherit;}',
            //let css = '',
            head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');
        head.appendChild(style);
        style.type = 'text/css';
        if (style.styleSheet) {
            // This is required for IE8 and below.
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
    }*/


    // hidden elements list
    let mainBody = document.getElementsByTagName("body")[0];
    let hidden_div = document.createElement("div");
    let hidden_ul = document.createElement("ul");
    let hidden_li = document.createElement("li");
    hidden_div.setAttribute("id", "dpacks_hidden_elements");
    //hidden_div.setAttribute("style", "margin-top: 40px!important; display: none; width: 100vw; height: 100vh; background-color: lightgray; position: fixed; top: 0; left: 0; right: 0; overflow-y: scroll; z-index: 99990;");
    hidden_div.setAttribute("style", "display: none;");
    hidden_div.setAttribute("class", "dpacks_modal");
    hidden_div.innerHTML =
        "<div style=\"padding: 20px;\">" +
        "<div>Hidden / Invisible Elements</div>" +
        "<div><button class=\"dpacks-button dpacks-close-button\" onclick=\"hiddenElementsListClose()\">Back</button>" +
        "<div id=\"hiddenList\">" +
        "<ul id=\"dpacks_hiddenList_ul_element\"></ul>" +
        "</div>" +
        "</div>" +
        "</div>";
    mainBody.appendChild(hidden_div);
    let dpacks_hiddenList_ul_element = document.getElementById("dpacks_hiddenList_ul_element");


}

// Admin model control buttons
{
// A 1 -- data editing model - open --
    function jDataModel(id) {
        document.getElementById("dpacks-nightly-status-nav").style.display = "none";
        document.getElementById("dpacks-nightly-attr-instruction-nav").style.display = "none";
        document.getElementById("dpacks-nightly-settings-nav").style.display = "none";

        // attr close
        let model_1 = document.getElementById("attrModal_" + id);
        model_1.style.display = 'none';

        // edit open
        let model = document.getElementById("model_" + id);
        model.style.removeProperty('display');
    }

// A 2 -- data editing model - close --
    function jDataCloseModel(id) {
        document.getElementById("dpacks-nightly-status-nav").style.display = "none";
        document.getElementById("dpacks-nightly-attr-instruction-nav").style.display = "none";
        document.getElementById("dpacks-nightly-settings-nav").style.display = "none";

        // attr close
        let model_1 = document.getElementById("attrModal_" + id);
        model_1.style.display = 'none';

        // edit close
        let model = document.getElementById("model_" + id);
        model.style.display = 'none';
    }

// A 3 -- data attr editing model - open --
    function attrModel(id) {

        document.addEventListener('contextmenu', function (e) {
            e.preventDefault();
        }, false);

        document.getElementById("dpacks-nightly-status-nav").style.display = "none";
        document.getElementById("dpacks-nightly-attr-instruction-nav").style.display = "none";
        document.getElementById("dpacks-nightly-settings-nav").style.display = "none";

        // edit close
        let model_1 = document.getElementById("model_" + id);
        model_1.style.display = 'none';

        // attr open
        let model = document.getElementById("attrModal_" + id);
        model.style.removeProperty('display');
    }

// A 4 -- data attr editing model - close --
    function attrCloseModel(id) {
        document.getElementById("dpacks-nightly-status-nav").style.display = "flex";
        document.getElementById("dpacks-nightly-attr-instruction-nav").style.display = "flex";
        document.getElementById("dpacks-nightly-settings-nav").style.display = "flex";
        // edit close
        let model_1 = document.getElementById("model_" + id);
        model_1.style.display = 'none';

        // attr open
        let model = document.getElementById("attrModal_" + id);
        model.style.display = 'none';
    }

// Hidden elements
// B 1 -- data editing model - open --
    function jDataModel_hidden(id) {
        document.getElementById("dpacks-nightly-status-nav").style.display = "none";
        document.getElementById("dpacks-nightly-attr-instruction-nav").style.display = "none";
        document.getElementById("dpacks-nightly-settings-nav").style.display = "none";

        // attr close
        let model_1 = document.getElementById("attrModal_" + id);
        model_1.style.display = 'none';

        // main div open
        let mainElement = document.getElementById(id);
        mainElement.style.removeProperty('display');
        mainElement.setAttribute("style", "display: inherit!important; visibility: visible!important;");

        // edit open
        let model = document.getElementById("model_" + id);
        model.style.removeProperty('display');
    }

// B 2 -- data editing model - close --
    function jDataCloseModel_hidden(id) {
        document.getElementById("dpacks-nightly-status-nav").style.display = "flex";
        document.getElementById("dpacks-nightly-attr-instruction-nav").style.display = "flex";
        document.getElementById("dpacks-nightly-settings-nav").style.display = "flex";
        // attr close
        let model_1 = document.getElementById("attrModal_" + id);
        model_1.style.display = 'none';

        // main div close
        let mainElement = document.getElementById(id);
        mainElement.setAttribute("style", "display: none;");

        // edit close
        let model = document.getElementById("model_" + id);
        model.style.display = 'none';
    }

// B 3 -- data attr editing model - open --
    function attrModel_hidden(id) {
        document.getElementById("dpacks-nightly-status-nav").style.display = "none";
        document.getElementById("dpacks-nightly-attr-instruction-nav").style.display = "none";
        document.getElementById("dpacks-nightly-settings-nav").style.display = "none";

        // edit close
        let model_1 = document.getElementById("model_" + id);
        model_1.style.display = 'none';

        // main div open
        let mainElement = document.getElementById(id);
        mainElement.style.removeProperty('display');
        mainElement.setAttribute("style", "display: inherit!important; visibility: visible!important;");

        // attr open
        let model = document.getElementById("attrModal_" + id);
        model.style.removeProperty('display');
    }

// B 4 -- data attr editing model - close --
    function attrCloseModel_hidden(id) {
        document.getElementById("dpacks-nightly-status-nav").style.display = "flex";
        document.getElementById("dpacks-nightly-attr-instruction-nav").style.display = "flex";
        document.getElementById("dpacks-nightly-settings-nav").style.display = "flex";
        // edit close
        let model_1 = document.getElementById("model_" + id);
        model_1.style.display = 'none';

        // main div close
        let mainElement = document.getElementById(id);
        mainElement.setAttribute("style", "display: none;");

        // attr open
        let model = document.getElementById("attrModal_" + id);
        model.style.display = 'none';
    }
}

// hidden elements list reveal
function hiddenElementsList() {
    document.getElementById("dpacks-nightly-status-nav").style.display = "none";
    document.getElementById("dpacks-nightly-attr-instruction-nav").style.display = "none";
    document.getElementById("dpacks-nightly-settings-nav").style.display = "none";

    let model = document.getElementById("dpacks_hidden_elements");
    model.style.removeProperty('display');
}

// hidden elements list close
function hiddenElementsListClose() {
    document.getElementById("dpacks-nightly-status-nav").style.display = "flex";
    document.getElementById("dpacks-nightly-attr-instruction-nav").style.display = "flex";
    document.getElementById("dpacks-nightly-settings-nav").style.display = "flex";
    let model = document.getElementById("dpacks_hidden_elements");
    model.style.display = 'none';
}

// Attributes - UI Attribute dashboard
function attrValueCall(id) {
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    }, false);

    let attr_value_div = document.getElementById("dpacks_attr_div_" + id);
    attr_value_div.innerHTML = "";
    let val_select = document.createElement("ul");
    val_select.setAttribute("id", "dpacks_attr_select_" + id);

    axios.get(API_URL + '/api/v1/cid', {
            headers: {
                siteId: dpacks_key,
                page: pageId,
                element: id
            }
        }
    ).then(function (response) {


        // append data to webpage
        // fetch(base_url + '/b2/' + dpacks_key + '_' + pageId + '_' + id + '.json')
        fetch('https://gateway.pinata.cloud/ipfs/' + response.data)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                let array = data[0];
                Object.keys(array).forEach(key => {
                    if (key !== 'text' && key !== 'id' && key !== 'page') {
                        document.getElementById("dpacks_modal_topics").style.display = "block";
                        let node = document.createElement("li");
                        let node2 = document.createElement("button");
                        let node3 = document.createElement("button");
                        let liTextNode = document.createTextNode((key === 'tag_class' ? 'class' : key) + " = " + array[key]);
                        node.appendChild(liTextNode);
                        node2.innerText = "Update";
                        node3.innerText = "Delete";
                        node.setAttribute("id", "li_" + id + "_" + key);
                        node2.setAttribute("onclick", "updateAttr(\"" + id + "\", \"" + key + "\", \"" + array[key] + "\")");
                        node2.setAttribute("class", "attr-control-btn attr-control-btn-update");
                        node2.setAttribute("id", "update_btn_" + id + "_" + key);
                        node3.setAttribute("onclick", "deleteAttr(\"" + id + "\", \"" + key + "\")");
                        node3.setAttribute("class", "attr-control-btn attr-control-btn-del");
                        node3.setAttribute("id", "delete_btn_" + id + "_" + key);
                        val_select.append(node, node2, node3);
                    }
                });
            })
            .catch(function (err) {
                console.log('error: ' + err);
            });

    }).catch(function (error) {
        console.log(error);
    });

    attr_value_div.appendChild(val_select);
}

function updateAttr(id, key, value) {
    document.getElementById("dpacks_attr_key_" + id).value = key;
    document.getElementById("dpacks_attr_key_value_" + id).value = value;
}

function deleteAttr(id, key) {
    document.getElementById("delete_btn_" + id + "_" + key).innerText = "Deleting..."
    axios.put(API_URL + '/api/v1/json-single-key-remove', {
        id: id,
        page: pageId,
        key: key
    }, {
        headers: authHeader()
    }).then(function (response) {
        console.log(response);
        document.getElementById("delete_btn_" + id + "_" + key).style.display = "none";
        document.getElementById("update_btn_" + id + "_" + key).style.display = "none";
        document.getElementById("li_" + id + "_" + key).style.display = "none";
        window.location.reload();
    }).catch(function (error) {
        console.log(error);
    });
}

// -- Cleaner --
function cleaner(elementArray) {
    let formDataTest = {
        page: pageId,
        elementArray: elementArray
    }

    axios.post(API_URL + '/api/v1/json-cleaner',
        formDataTest, {
            headers: authHeader()
        }
    )
        .then(function (response) {
            console.log(response);
        })
        .catch(function (error) {
            console.log(error);
        });
}


// -- delete data from json (delete json file) --
function deleteData(id) {
    if (window.confirm('Are you sure you wanna delete all the data of this element?')) {
        axios.delete(API_URL + '/api/v1/json-delete/' + pageId + '/' + id, {
            headers: authHeader()
        }).then(function (response) {
            console.log(response);
        }).catch(function (error) {
            console.log(error);
        });
    } else {
        console.log("Deletion aborted")
    }
}