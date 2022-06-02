// -- class checker --
let file_path_2 = document.getElementById("dpack_script").src;
let the_arr_2 = file_path_2.split('/');
the_arr_2.pop();

const user_normal_check = JSON.parse(localStorage.getItem('user'));
if (!user_normal_check) {
    dpacks()
}

function dpacks() {
    // let tagsList = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'b', 'strong', 'i', 'em', 'mark', 'small', 'del', 'ins', 'sub', 'sup'];
    let tagsList = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const jsonData = document.querySelectorAll(tagsList);
    for (let i = 0; i < jsonData.length; i++) {

        // -- id declaration --
        let id = jsonData[i].id;

        axios.get(API_URL + '/api/v1/cid', {
                headers: {
                    siteId: dpacks_key,
                    page: pageId,
                    element: id
                }
            }
        ).then(function (response) {
            if (response.data !== "default_start") {
                // -- check if data file exists --
                let xhr = new XMLHttpRequest();
                xhr.responseType = 'json';
                xhr.open('GET', 'https://gateway.pinata.cloud/ipfs/' + response.data);
                xhr.send();
                xhr.onload = function (e) {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 404) {
                            // 404
                        } else if (xhr.status === 200) {
                            // 200
                            // append data to webpage
                            fetch('https://gateway.pinata.cloud/ipfs/' + response.data)
                                .then(function (response) {
                                    return response.json();
                                })
                                .then(function (data) {
                                    appendData(data);
                                })
                                .catch(function (err) {
                                    console.log('error: ' + err);
                                });
                        } else {
                            // other error codes
                            console.log('Network status: ' + xhr.status)
                        }
                    }
                };
            }
        }).catch(function (error) {
            console.log(error);
        });

        // -- append data from data files (view fetch) - function --
        function appendData(data) {
            /*if (data[0].page == pageId && data[0].id == id) {
                let mainContainer = document.getElementById(id);
                mainContainer.innerText = data[0].text;
            }*/
            let atrArray = data[0];
            let mainContainer = document.getElementById(id);
            mainContainer.innerText = atrArray.text;
            Object.keys(atrArray).forEach(key => {
                if (key == 'tag_class') {
                    mainContainer.setAttribute("class", atrArray[key]);
                } else if (key != 'text' && key != 'id' && key != 'page') {
                    mainContainer.removeAttribute(key);
                    mainContainer.setAttribute(key, atrArray[key]);
                }
            });
        }
    }
}