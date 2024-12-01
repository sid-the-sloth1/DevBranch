// ==UserScript==
// @name         Christmas Town Helper
// @namespace    hardy.ct.helper
// @version      3.0
// @description  Christmas Town Helper. Highlights Items, Chests, NPCs. And Games Cheat
// @author       Hardy [2131687]
// @match        https://www.torn.com/christmas_town.php*
// @grant        GM_addStyle
// @grant        unsafeWindow
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==
(function () {
    'use strict';
    ////
    const version = "3.0";
    const waitObj = {};
    const metadata = { "cache": { "spawn_rate": 0, "speed_rate": 0, "hangman": { "list": [], "chars": [], "len": false } }, "settings": { "games": { "wordFix": false } } };
    let saved;
    const options = { "checkbox": { "items": { "name": "Highlight Items", "def": "yes", "color": "#e4e461" }, "gold_chest": { "name": "Highlight Golden Chests", "def": "yes", "color": "#e4e461" }, "silver_chest": { "name": "Highlight Silver Chests", "def": "yes", "color": "#e4e461" }, "bronze_chest": { "name": "Highlight Bronze Chests", "def": "yes", "color": "#e4e461" }, "combo_chest": { "name": "Highlight Combination Chests", "def": "yes", "color": "#e4e461" }, "chest_keys": { "name": "Highlight Keys", "def": "yes", "color": "#e4e461" }, "highlight_santa": { "name": "Highlight Santa", "def": "yes", "color": "#ff6200" }, "highlight_npc": { "name": "Highlight Other NPCs", "def": "yes", "color": "#ff6200" }, "wreath": { "name": "Christmas Wreath Helper", "def": "yes" }, "snowball_shooter": { "name": "Snowball Shooter Helper", "def": "yes" }, "santa_clawz": { "name": "Santa Clawz Helper", "def": "yes" }, "word_fixer": { "name": "Word Fixer Helper", "def": "yes" }, "hangman": { "name": "Hangman Helper", "def": "yes" } } };

    const wordList = ["elf", "eve", "fir", "ham", "icy", "ivy", "joy", "pie", "toy", "gift", "gold", "list", "love", "nice", "sled", "star", "wish", "wrap", "xmas", "yule", "angel", "bells", "cider", "elves", "goose", "holly", "jesus", "merry", "myrrh", "party", "skate", "visit", "candle", "creche", "cookie", "eggnog", "family", "frosty", "icicle", "joyful", "manger", "season", "spirit", "tinsel", "turkey", "unwrap", "wonder", "winter", "wreath", "charity", "chimney", "festive", "holiday", "krampus", "mittens", "naughty", "package", "pageant", "rejoice", "rudolph", "scrooge", "snowman", "sweater", "tidings", "firewood", "nativity", "reindeer", "shopping", "snowball", "stocking", "toboggan", "trimming", "vacation", "wise men", "workshop", "yuletide", "chestnuts", "christmas", "fruitcake", "greetings", "mince pie", "mistletoe", "ornaments", "snowflake", "tradition", "candy cane", "decoration", "ice skates", "jack frost", "north pole", "nutcracker", "saint nick", "yule log", "card", "jolly", "hope", "scarf", "candy", "sleigh", "parade", "snowy", "wassail", "blizzard", "noel", "partridge", "give", "carols", "tree", "fireplace", "socks", "lights", "kings", "goodwill", "sugarplum", "bonus", "coal", "snow", "happy", "presents", "pinecone"];

    const original_fetch = unsafeWindow.fetch;
    const gameHelper = {
        "state": "Inactive",
        "html": "",
        "start": function () {
            if (!document.querySelector(".ctHelperGameBox")) {
                const node = document.createElement("div");
                node.className = "ctHelperGameBox";
                const reference = document.querySelector(".ct-wrap");
                reference.parentNode.insertBefore(node, reference);
            }
            document.querySelector(".ctHelperGameBox").innerHTML = `<div class="hardyCTHeader">${this.state} Helper</div><div class="hardyGameBoxContent"></div>`;
        },
        "fixWord": function () {
            if (metadata.settings.games.wordFix) {
                const jumbled = metadata.settings.games.wordFix;
                metadata.settings.games.wordFix = false;
                let wordSolution = "No solution found";
                for (const word of wordList) {
                    if (sortWord(word) === sortWord(jumbled)) {
                        wordSolution = word.toUpperCase();
                        break;
                    }
                }
                this.html = `<label class="ctHelperSuccess">${wordSolution}</label>`;
                this.update();
            }
        },
        "update": function () {
            const node = document.querySelector(".hardyGameBoxContent");
            if (node) {
                node.innerHTML = this.html;
                this.html = "";
            }
        },
        "stop": function () {
            const node = document.querySelector(".ctHelperGameBox");
            if (node) {
                node.remove();
            }
            if (this.state === "Word Fixer") {
                metadata.settings.games.wordFix = false;
            } else if (this.state === "Hangman") {
                metadata.cache.hangman.len = false;
                metadata.cache.hangman.list = [];
                metadata.cache.hangman.chars = [];
            }
            this.state = "Inactive";
            this.html = "";
        },
        "hangman_charLength": function () {
            const lengthList = metadata.cache.hangman.len;
            if (lengthList.length > 1) {
                const len_1 = lengthList[0];
                const len_2 = lengthList[1];
                const len = len_1 + len_2 + 1;
                const array = [];
                for (const word of wordList) {
                    if (word.length === len) {
                        if (word.split(" ")[1] && word.split(" ")[0].length == len_1 && word.split(" ")[1].length == len_2) {
                            array.push(word.toUpperCase());
                        }
                    }
                }
                metadata.cache.hangman.list = array;
            } else {
                const len = lengthList[0];
                const array = [];
                for (const word of wordList) {
                    if (word.length === len && !word.split(" ")[1]) {
                        array.push(word.toUpperCase());
                    }
                }
                metadata.cache.hangman.list = array;
            }
            this.hangman_suggestion();
        },
        "hangman_suggestion": function () {
            const obj = {};
            const list = metadata.cache.hangman.list;
            for (const word of list) {
                const letters = getUniqueLetter(word.replace(/\s/g, "").split(""));
                for (const letter of letters) {
                    if (obj[letter]) {
                        obj[letter] += 1;
                    } else {
                        obj[letter] = 1;
                    }
                }
            }
            const sortable = [];
            const list_len = list.length
            for (const key in obj) {
                sortable.push([key, obj[key], String(+((obj[key] / list_len) * 100).toFixed(2)) + "% chance"]);
            }
            sortable.sort(function (a, b) {
                return b[1] - a[1];
            });
            const lettersArray = [];
            const limit = Math.min(5, sortable.length);
            for (let mkl = 0; mkl < limit; mkl++) {
                const letter = sortable[mkl];
                lettersArray.push(`${letter[0].toUpperCase()} <label class="helcostrDoesntLikeGreenCommas">(${letter[2]})</label>`);
            }
            this.html = `<p style="font-weight: bold; font-size: 16px; margin: 8px; text-align: center;">Possible Solutions</p><p class="ctHelperSuccess">${list.join('<label class="helcostrDoesntLikeGreenCommas">, </label>')}</p><p style="font-weight: bold; font-size: 16px; margin: 8px; text-align: center;">Suggested Letters</p><p class="ctHelperSuccess">${lettersArray.join('<label class="helcostrDoesntLikeGreenCommas">, </label>')}</p>`;
            this.update();
        }
    }
    /////
    initiate();

    unsafeWindow.fetch = async (url, init) => {
        const response_ = await original_fetch(url, init)
        const response = response_.clone();
        response.json().then((data) => {
            if (url.includes("christmas_town.php?q=move") || url.includes("christmas_town.php?q=initMap")) {
                if (gameHelper.state !== "Inactive") {
                    gameHelper.stop();
                }
                if (data.mapData) {
                    if (data.mapData.items) {
                        let items = data.mapData.items;
                        if (items.length > 0) {
                            metadata.settings.count = 1;
                            const itemArray = [];
                            const chestArray = [];
                            for (const item of items) {
                                const { image, position } = item;
                                const info = ctHelperGetInfo(image.url);
                                if (["chests", "combo_chest"].includes(info.type)) {
                                    chestArray.push([info.name, position.x, position.y, info.index]);
                                } else {
                                    itemArray.push([info.name, position.x, position.y]);
                                }
                            }
                            chestArray.sort((a, b) => a[3] - b[3]);
                            ctHelperChangeHTML(itemArray, "hardyNearbyItems", "Nearby Items");
                            ctHelperChangeHTML(chestArray, "hardyNearbyChests", "Nearby Chests");
                            highlightItems();
                        } else {
                            if (metadata.settings.count == 1) {
                                document.querySelector(".hardyNearbyChests").innerHTML = '<label>Nearby Chests(0)</label><div class="content"></div>';
                                document.querySelector(".hardyNearbyItems").innerHTML = '<label>Nearby Items(0)</label><div class="content"></div>';
                                metadata.settings.count = 0;
                            }
                        }
                    }
                    if (data.mapData.inventory && data.mapData.inventory.length > 0) {
                        metadata.cache.spawn_rate = 0;
                        metadata.cache.speed_rate = 0;
                        for (const item of data.mapData.inventory) {
                            if (item.category === "ornaments") {
                                if (item.modifierType === "itemSpawn") {
                                    metadata.cache.spawn_rate += item.modifier;
                                } else if (item.modifierType === "speed") {
                                    metadata.cache.speed_rate += item.modifier;
                                }
                            }
                        }
                        updateModifierText();
                    }
                }
                highlightNPC();
            } else if (url.includes("christmas_town.php?q=miniGameAction")) {
                let body = false;
                if (init.body) {
                    body = JSON.parse(init.body);
                }
                if (body && body.action && body.action === "start") {
                    if (body.gameType) {
                        const gameType = body.gameType;
                        if (gameType === "gameWordFixer" && saved.checkbox["word_fixer"] === "yes") {
                            gameHelper.state = "Word Fixer";
                            gameHelper.start();
                            metadata.settings.games.wordFix = data.progress.word;
                            gameHelper.fixWord();
                        } else if (gameType === "gameHangman" && saved.checkbox["hangman"] === "yes") {
                            gameHelper.state = "Hangman";
                            gameHelper.start();
                            metadata.cache.hangman.len = data.progress.words;
                            gameHelper.hangman_charLength();
                        }
                    }
                } else {
                    if (gameHelper.state === "Word Fixer") {
                        if (data.finished) {
                            gameHelper.stop();
                        } else {
                            if (data.progress && data.progress.word) {
                                metadata.settings.games.wordFix = data.progress.word;
                                gameHelper.fixWord();
                            }
                        }
                    } else if (gameHelper.state === "Hangman") {
                        if (data.mistakes === 6 || data.message.startsWith("Congratulations")) {
                            gameHelper.stop();
                        } else {
                            const letter = body.result.character.toUpperCase();
                            metadata.cache.hangman.chars.push(letter);
                            if (data.positions.length === 0) {
                                const array = [];
                                for (const word of metadata.cache.hangman.list) {
                                    if (word.indexOf(letter) === -1) {
                                        array.push(word);
                                    }
                                }
                                metadata.cache.hangman.list = array;
                                gameHelper.hangman_suggestion();
                            } else {
                                const array = [];
                                const positions = data.positions;
                                const length = positions.length;
                                for (const word of metadata.cache.hangman.list) {
                                    let index = 0;
                                    for (const position of positions) {
                                        if (word[position] === letter) {
                                            index += 1;
                                        }
                                    }
                                    if (index === length && countLetter(word, letter) == length) {
                                        array.push(word);
                                    }
                                }
                                metadata.cache.hangman.list = createUniqueArray(array);
                                gameHelper.hangman_suggestion();
                            }
                        }
                    }
                }
            }
        });
        return response_;
    }
    ///////////////////functions/////////////////////
    function ctHelperGetInfo(link) {
        let type = "items";
        const categories = ["/keys/", "/chests/", "/combinationChest/"];
        for (const category of categories) {
            if (link.indexOf(category) !== -1) {
                const typetxt = category.replace(/\//g, "");
                if (typetxt === "combinationChest") type = "combo_chest";
                else if (typetxt === "keys") type = "chest_keys";
                else if (typetxt === "chests") type = "chests";
                break;
            }
        }
        let name, index;
        switch (type) {
            case "chest_keys":
                if (link.includes("bronze")) name = "Bronze Key";
                else if (link.includes("gold")) name = "Golden Key";
                else if (link.includes("silver")) name = "Silver Key";
                break;
            case "chests":
                if (link.includes("1.gif")) { name = "Gold Chest"; index = 0; }
                else if (link.includes("2.gif")) { name = "Silver Chest"; index = 1; }
                else if (link.includes("3.gif")) { name = "Bronze Chest"; index = 3; }
                break;
            case "combo_chest":
                name = "Combination Chest";
                index = 2;
                break;
            default:
                name = "Mystery Gift";
        }
        return { type, name, index };
    }
    function ctHelperChangeHTML(array, selector, label) {
        const length = array.length;
        const content = length ? array.map(element => `<p>${element[0]} at ${element[1]}, ${element[2]}&nbsp;</p>`).join("") : "";
        document.querySelector(`.${selector}`).innerHTML = `<label>${label}(${length})</label><div class="content">${content}</div>`;
    }
    function initiate() {
        createStorage();
        addBox();
        highlighter_css()
        gamesHelper_css();
    }
    function updateModifierText() {
        setTimeout(() => {
            document.querySelector(".ctHelperSpawnRate").innerHTML = `You have a spawn rate bonus of ${metadata.cache.spawn_rate}%.`;
            document.querySelector(".ctHelperSpeedRate").innerHTML = `You have a speed rate bonus of ${metadata.cache.speed_rate}%.`;
        }, 3000);
    }
    function addBox() {
        if (!document.querySelector(".hardyCTBox")) {
            waitForElement("#christmastownroot div[class^='appCTContainer']", 900, 999, "dhjdvefvasvduqwdufdevshacqweu").then((element) => {
                const newBox = createElement("div", { 'class': 'hardyCTBox' });
                newBox.innerHTML = `<div class="hardyCTHeader">Christmas Town Helper</div> <div class="hardyCTContent"> <div style="display: flex; align-items: center; justify-content: space-between;"> <div style="flex-grow: 1; text-align: center;"> <p class="ctHelperSpawnRate ctHelperSuccess">&nbsp;</p> <p class="ctHelperSpeedRate ctHelperSuccess">&nbsp;</p> </div> <button class="ctRecordLink"> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16"> <path fill="currentColor" d="M8 6a2 2 0 1 0 0 4a2 2 0 0 0 0-4ZM7 8a1 1 0 1 1 2 0a1 1 0 0 1-2 0Zm3.618-3.602a.708.708 0 0 1-.824-.567l-.26-1.416a.354.354 0 0 0-.275-.282a6.072 6.072 0 0 0-2.519 0a.354.354 0 0 0-.275.282l-.259 1.416a.71.71 0 0 1-.936.538l-1.359-.484a.355.355 0 0 0-.382.095a5.99 5.99 0 0 0-1.262 2.173a.352.352 0 0 0 .108.378l1.102.931a.704.704 0 0 1 0 1.076l-1.102.931a.352.352 0 0 0-.108.378A5.986 5.986 0 0 0 3.53 12.02a.355.355 0 0 0 .382.095l1.36-.484a.708.708 0 0 1 .936.538l.258 1.416c.026.14.135.252.275.281a6.075 6.075 0 0 0 2.52 0a.353.353 0 0 0 .274-.281l.26-1.416a.71.71 0 0 1 .936-.538l1.359.484c.135.048.286.01.382-.095a5.99 5.99 0 0 0 1.262-2.173a.352.352 0 0 0-.108-.378l-1.102-.931a.703.703 0 0 1 0-1.076l1.102-.931a.352.352 0 0 0 .108-.378A5.985 5.985 0 0 0 12.47 3.98a.355.355 0 0 0-.382-.095l-1.36.484a.71.71 0 0 1-.111.03Zm-6.62.58l.937.333a1.71 1.71 0 0 0 2.255-1.3l.177-.97a5.105 5.105 0 0 1 1.265 0l.178.97a1.708 1.708 0 0 0 2.255 1.3L12 4.977c.255.334.467.698.63 1.084l-.754.637a1.704 1.704 0 0 0 0 2.604l.755.637a4.99 4.99 0 0 1-.63 1.084l-.937-.334a1.71 1.71 0 0 0-2.255 1.3l-.178.97a5.099 5.099 0 0 1-1.265 0l-.177-.97a1.708 1.708 0 0 0-2.255-1.3L4 11.023a4.987 4.987 0 0 1-.63-1.084l.754-.638a1.704 1.704 0 0 0 0-2.603l-.755-.637a5.06 5.06 0 0 1 .63-1.084Z"></path> </svg> </button> </div> <div class="nearby-items-chests"> <div class="hardyNearbyItems"> <label>Nearby Items(0)</label> <div class="content"></div> </div> <div class="hardyNearbyChests"> <label>Nearby Chests(0)</label> <div class="content"></div> </div> </div> </div>`;
                element.insertBefore(newBox, element.firstChild.nextSibling);
                newBox.querySelector(".ctRecordLink").addEventListener("click", (event) => {
                    createPreferencesBox('#hardy_pref_box_q-links');
                })
                metadata.settings.spawn = 1;
                metadata.settings.speed = 1;
            }).catch(error => {
                console.log(error);
            });
        }
        let pageUrl = window.location.href;
        if (pageUrl.includes("mapeditor") || pageUrl.includes("parametereditor") || pageUrl.includes("mymaps")) {
            document.querySelector(".hardyCTBox").style.display = "none";
        } else {
            const box = document.querySelector(".hardyCTBox")
            if (box) {
                box.style.display = "block";
            }
        }
        //hideDoctorn(); TODOOO
    }
    function highlightItems() {
        const items = document.querySelectorAll(".items-layer .ct-item");
        const obj = { "Mystery Gift": "items", "Gold Chest": "gold_chest", "Silver Chest": "silver_chest", "Bronze Chest": "bronze_chest", "Combination Chest": "combo_chest", "Golden Key": "chest_keys", "Silver Key": "chest_keys", "Bronze Key": "chest_keys" };
        for (const item of items) {
            const link = item.querySelector("img").src;
            const info = ctHelperGetInfo(link);
            const name = info.name;
            const key = obj[name];
            if (key && saved.checkbox[key] === "yes") {
                item.setAttribute(`hardy_highlight_${key}`, "yes");
            }
        }
    }
    function highlighter_css() {
        const to_be_highlighted_items = [];
        const array = [];
        for (const element of ["items", "gold_chest", "combo_chest", "silver_chest", "bronze_chest", "chest_keys"]) {
            if (saved.checkbox[element] === "yes") {
                to_be_highlighted_items.push(`.items-layer .ct-item[hardy_highlight_${element}="yes"]`);
                array.push(element);
            }
        }
        if (to_be_highlighted_items.length > 0) {
            const elementsAll = to_be_highlighted_items.join(", ");
            const styleAll = ` {
                position: absolute;
                border-radius: 50%;
                animation: 2s ease-in-out infinite pulse;
            }
            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                    opacity: .5;
                }
                50% {
                    transform: scale(1.8);
                    opacity: .8;
                }
            }`;
            let styleString = ``;
            for (const element of array) {
                const color = saved.color[`color_${element}`];
                styleString += `
                .items-layer .ct-item[hardy_highlight_${element}="yes"] {
                    border: 30px solid ${color};
                }`;
            }
            styleString += `${elementsAll} ${styleAll}`;
            GM_addStyle(styleString);
        }
        const to_be_highlighted_npcs = [];
        if (saved.checkbox["highlight_santa"] === "yes") {
            to_be_highlighted_npcs.push(".ct-user[npctype='santa']");
        }
        if (saved.checkbox["highlight_npc"] === "yes") {
            to_be_highlighted_npcs.push(".ct-user[npctype='other']");
        }
        if (to_be_highlighted_npcs.length > 0) {
            const elementsAll = to_be_highlighted_npcs.join(", ");
            const styleAll = '{position:relative;z-index:10}';
            let styleString = `${elementsAll} ${styleAll}`;
            styleString += `.ct-user[npctype='santa']::before, .ct-user[npctype='other']::before `;
            styleString += ` {content:"";position:absolute;top:50%;left:50%;width:70px;height:70px;border-radius:50%;transform:translate(-50%,-50%);animation:1.5s ease-in-out infinite pulse-santa;pointer-events:none} @keyframes pulse-santa{0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.8}50%{transform:translate(-50%,-50%) scale(1.8);opacity:.4}}`;
            styleString += `.ct-user[npctype='santa']::before {border: 30px solid ${saved.color["color_highlight_santa"]};} .ct-user[npctype='other']::before {border: 30px solid ${saved.color["color_highlight_npc"]};}`;
            GM_addStyle(styleString);
        }
    }

    function highlightNPC() {
        const npcList = document.querySelectorAll(".ct-user.npc");
        for (const npc of npcList) {
            if (npc.querySelector("svg").getAttribute("fill").toUpperCase() === "#FA5B27") {
                if (saved.checkbox["highlight_santa"] === "yes") {
                    npc.setAttribute("npctype", "santa");
                }
            } else {
                if (saved.checkbox["highlight_npc"] === "yes") {
                    npc.setAttribute("npctype", "other");
                }
            }
        }
    }
    //For Hangman
    function getUniqueLetter(argArray) {
        const newArray = [];
        const array = createUniqueArray(argArray);
        for (const letter of array) {
            if (metadata.cache.hangman.chars.indexOf(letter) === -1) {
                newArray.push(letter);
            }
        }
        return newArray;
    }
    function countLetter(string, letter) {
        const array = string.split("");
        const obj = {};
        obj.count = 0;
        for (const element of array) {
            if (element === letter) {
                obj.count += 1;
            }
        }
        return obj.count;
    }
    /// pre-made functions
    function waitForElement(selector, duration, maxTries, identifier) {
        return new Promise(function (resolve, reject) {
            const value = Math.floor(Math.random() * 1000000000);
            waitObj[identifier] = value;
            let attempts = 0;
            const intervalId = setInterval(() => {
                if (attempts > maxTries) {
                    clearInterval(intervalId);
                    reject(`Selector Listener Expired: ${selector}, Reason: Dead bcoz u didnt cum on time!!!!`);
                } else if (waitObj[identifier] !== value) {
                    clearInterval(intervalId);
                    reject(`Selector Listener Expired: ${selector}, Reason: Dead coz u didnt luv me enough and got another SeLecTor!!!!`);
                }
                const element = document.querySelector(selector);
                if (element) {
                    clearInterval(intervalId);
                    resolve(element);
                }
                attempts += 1;
            }, duration);
        });
    }
    function createElement(tagName, attributes) {
        const element = document.createElement(tagName);
        for (const key in attributes) {
            element.setAttribute(key, attributes[key]);
        }
        return element;
    }
    function createStorage() {
        const info = GM_getValue("cthelper_hardy_prefs");
        if (!info) {
            saved = {};
            saved.color = {};
            for (const option in options) {
                const type = option;
                if (type === "checkbox") {
                    if (!saved.checkbox) {
                        saved.checkbox = {};
                    }
                    for (const checkbox in options.checkbox) {
                        saved.checkbox[checkbox] = options.checkbox[checkbox].def;
                        if (options.checkbox[checkbox].color) {
                            saved.color[`color_${checkbox}`] = options.checkbox[checkbox].color;
                        }
                    }
                }
            }
            savePrefs();
        } else {
            saved = JSON.parse(info);
            for (const title in options.checkbox) {
                if (!saved.checkbox[title]) {
                    saved.checkbox[title] = options.checkbox[title].def;
                }
                if (!saved.color[`color_${title}`] && options.checkbox[title].color) {
                    saved.color[`color_${title}`] = options.checkbox[title].color;
                }
            }
        }
    }

    function gamesHelper_css() {
        //christmas wreath
        if (saved.checkbox["wreath"] === "yes") {
            GM_addStyle(`img[alt='christmas wreath'] {display: none;}`);
        }
        //snowball shooter
        if (saved.checkbox["snowball_shooter"] === "yes") {
            GM_addStyle(`div[class^='moving-block'] img[alt^='santa'] {display: none;}`);
        }
        //santa clawz
        if (saved.checkbox["santa_clawz"] === "yes") {
            GM_addStyle(`[class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAADAFBMVEUAAADuy'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAADAFBMVEUAAADu4'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAADAFBMVEUAAADms'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAADAFBMVEUAAADjr'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAADAFBMVEUAAADj4'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAADAFBMVEUAAADSx'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAADAFBMVEUAAADPy'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAADAFBMVEUAAADOx'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAADAFBMVEUAAADLx'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAADAFBMVEUAAADKq'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAADAFBMVEUAAADCS'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAADAFBMVEUAAAD03'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAADAFBMVEUAAACun'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAADAFBMVEUAAACnk'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAADAFBMVEUAAACmg'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAADAFBMVEUAAACSe'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAADAFBMVEUAAACGL'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAADAFBMVEUAAAC1U'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAADAFBMVEUAAAC0w'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAADAFBMVEUAAAByX'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAADAFBMVEUAAABsX'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAADAFBMVEUAAAB7g'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAACzVBMVEUAAACTM'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC9FBMVEUAAADlw'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC9FBMVEUAAAD67'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC9FBMVEUAAACnR'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC91BMVEUAAADy2'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC91BMVEUAAADrw'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC91BMVEUAAADlt'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC91BMVEUAAADl5'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC91BMVEUAAADgp'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC91BMVEUAAADgo'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC91BMVEUAAADak'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC91BMVEUAAADKx'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC91BMVEUAAADJn'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC91BMVEUAAAD9+'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC91BMVEUAAAD57'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC91BMVEUAAAD16'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC91BMVEUAAAClR'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC91BMVEUAAACdN'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC91BMVEUAAAC0R'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC91BMVEUAAABxW'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC8VBMVEUAAADKe'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC8VBMVEUAAADKc'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC7lBMVEUAAACXN'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC/VBMVEUAAADy1'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC/VBMVEUAAADw7'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC/VBMVEUAAADvz'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC/VBMVEUAAADu6'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC/VBMVEUAAADsx'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC/VBMVEUAAADrx'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC/VBMVEUAAADr1'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC/VBMVEUAAADpv'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC/VBMVEUAAADnt'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC/VBMVEUAAADe6'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC/VBMVEUAAADc2'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC/VBMVEUAAADVg'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC/VBMVEUAAADOv'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC/VBMVEUAAADLh'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC/VBMVEUAAADFV'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC/VBMVEUAAADEx'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC/VBMVEUAAAD68'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC/VBMVEUAAAD28'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC/VBMVEUAAACup'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC/VBMVEUAAACQN'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC/VBMVEUAAAC0p'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC/VBMVEUAAAC0l'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC/VBMVEUAAABsX'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC/VBMVEUAAABpe'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC/VBMVEUAAAB2V'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC/VBMVEUAAAB/e'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC+lBMVEUAAADy1'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC+lBMVEUAAADt5'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC+lBMVEUAAADj4'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC+lBMVEUAAADf0'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC+lBMVEUAAADcr'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC+lBMVEUAAADal'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC+lBMVEUAAADLv'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC+lBMVEUAAADJx'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC+lBMVEUAAAD9+'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC+lBMVEUAAACnl'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC+lBMVEUAAACWM'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC+lBMVEUAAACMh'], [class^='cell'] img[src^='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAC+lBMVEUAAAC+Y'] {display: none;}`);
        }
    }
    function savePrefs() {
        GM_setValue("cthelper_hardy_prefs", JSON.stringify(saved));
    }
    function preferenceHandler(inpType, name, def, opt) {
        if (saved.checkbox[name]) {
            return saved.checkbox[name] === "yes" ? " checked" : "";
        } else {
            saved.checkbox[name] = def;
            return def === "yes" ? " checked" : "";
        }
    }
    function createPreferencesBox(selector) {
        const prefBox = document.querySelector(selector);
        if (!prefBox) {
            const box = createElement("div", { "id": selector, "class": "hardy_modal_dialog" });
            box.innerHTML = `<div class="hardy_modal"><div class="hardy_modal_header"><label>Christmas Town Helper Preferences</label></div><div style="text-align: right;"><button class="hardy_modal_close">Close</button></div><div style="overflow: auto;"><div class="hardy_modal_content"></div><div class="hardy_modal_msg"></div></div></div>`;
            box.querySelector(".hardy_modal_close").addEventListener("click", () => {
                box.remove();
            });
            let html = `<p>Highlighter</p>`;
            const checkboxes = saved.checkbox;
            for (const checkbox in checkboxes) {
                const info = options.checkbox[checkbox].name;
                const color = options.checkbox[checkbox].color;
                html += `<label>${info}: </label>${color ? `<input type="color" name="color_${checkbox}" value="${saved.color[`color_${checkbox}`]}">` : ''}<input type="checkbox" name="${checkbox}" ${preferenceHandler("checkbox", checkbox, options.checkbox[checkbox].def, "")}><br>`;
            }
            html += `<button class="hardy-save-prefs">Save</button>`;
            box.querySelector(".hardy_modal_content").innerHTML = html;
            const firstgameHelperLabel = box.querySelector('input[name="wreath"]').previousSibling;
            const p = createElement("p", {});
            p.innerText = "Games Helper"
            firstgameHelperLabel.parentNode.insertBefore(p, firstgameHelperLabel);
            document.body.insertBefore(box, document.body.firstChild);
            box.querySelectorAll('input[type="color"]').forEach((input) => {
                input.onchange = function () {
                    input.setAttribute("value", this.value); //this.value == this.value;
                };
            });

            box.querySelector(".hardy-save-prefs").addEventListener("click", () => {
                const inputs = box.querySelectorAll("input");
                for (const input of inputs) {
                    const inpType = input.getAttribute("type");
                    const name = input.getAttribute("name");
                    if (inpType === "checkbox") {
                        if (input.checked === true) {
                            saved.checkbox[name] = "yes";
                        } else {
                            saved.checkbox[name] = "no";
                        }
                    } else if (inpType === "color") {
                        saved.color[`${name}`] = document.querySelector(`input[name="${name}"]`).getAttribute("value");
                    }
                }
                savePrefs();
                box.querySelector(".hardy_modal_msg").innerHTML = `Preferences have been saved successfully!! Refresh page to ensure that the changes are synced properly.`;
            });
        }
    }
    function sortWord(word) {
        const array = word.toUpperCase().split("");
        array.sort();
        return array.join("");
    }
    function createUniqueArray(array) {
        const newArray = [];
        for (const element of array) {
            if (newArray.indexOf(element) === -1) {
                newArray.push(element);
            }
        }
        return newArray;
    }
    ///CSS

})();
