const wordOfDay = 'https://words.dev-apis.com/word-of-the-day';

let tryCount = 0;
let prevTurn;

function loadingAnimation(theBool) {
    let loading = document.querySelector('.loading');
    if (theBool === true) {
        loading.style.display = 'flex';
    }
    else {
        loading.style.display = 'none';
    }
}

function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

async function getWordOfDay() {
    const promise = await fetch(wordOfDay);
    const response = await promise.json();
    //console.log(response.word);
    return response
}


function gameBoardInit() {
    const gameBoard = document.querySelector('.game-board');
    for (let i = 0; i < 6; i++) {
        let row = document.createElement('div');
        row.setAttribute('class', `r${i} row`);
        gameBoard.appendChild(row);
        for (let j = 0; j < 5; j++) {
            let element = document.createElement('div');
            element.setAttribute('id', `${i}${j}`);
            element.setAttribute('class', 'box');
            row.appendChild(element);
        }
    }
}

function keyboardInit() {
    const keys = document.querySelectorAll('.key');
    for (key of keys) {
        key.style.backgroundColor = '#444444';
    }
}
function keyboardEdit(letter, state) {
    const keys = document.querySelectorAll('.key');
    for (key of keys) {
        if (key.value === letter) {
            if (state === 'green') {key.style.backgroundColor='green';}
            else if (state === 'orange') {key.style.backgroundColor='orange';}
            else if (state === 'darken') {key.style.backgroundColor='#202020';}
        }
    }
}

function findTurn() {
    const boxes = document.querySelectorAll('.box');
    for (const box of boxes) {
        if (box.innerText === '') {
            box.tabIndex = -1;
            box.focus();
            return box;
        }
    }
}

function getTry(bloc_id) {
    let row = bloc_id[0];
    const rowWord = document.querySelector(`.r${row}`);
    let children = rowWord.children;
    let theWord = '';
    for (const child of children) {
        theWord = theWord + child.innerText;
    }
    return theWord;
}

// Validate Word API Call
async function fetchPost(theWord) {
    try {
        const url = "https://words.dev-apis.com/validate-word";
        const data = { word: theWord };
        const settings = {
            method: "POST",
            headers: {
                Accept: "application/json",
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };
        
        const fetchRes = await fetch(url, settings);
        const res = await fetchRes.json();
        return res;
    } catch (error) {}
};

// Check if word is an accepted word
async function checkTheWord(theWord, bloc_id) {
    loadingAnimation(true);
    let response = await fetchPost(theWord);

    if (response.validWord === false) {

        loadingAnimation(false);
        // Jiggles Word
        const currentDiv = document.querySelector(`.r${bloc_id[0]}`);
        currentDiv.classList.remove("apply-shake");
        setTimeout(function () {
            currentDiv.classList.add("apply-shake");
        }, 10)
        // Adds message
        let messages = document.querySelector('.messages-div');
        messages.style.color = 'red';
        messages.innerText = "Not a Valid Word."
        messages.style.opacity = 1;
        // Fades out text shortly after
        setTimeout(function() {
            let timerId = setInterval(function() {
                let opacity = messages.style.opacity;
                if (opacity == 0) {
                    clearInterval(timerId);
                } else {
                    messages.style.opacity = opacity - 0.05;
                }
            }, 100);
        }, 3000);
        
        return;
    }

    compareWord(theWord.toUpperCase());
}

async function compareWord(guess) {
    const obj = await getWordOfDay();
    
    let wordOfTheDay = obj.word;
    wordOfTheDay = wordOfTheDay.toUpperCase();
    console.log(wordOfTheDay);
    let exactMatches = [0,0,0,0,0];
    let letterCorrects = [0,0,0,0,0];
    for (let i=0; i < 5; i++) {
        let letter = guess[i];
        if (letter === wordOfTheDay[i]) {
            exactMatches[i] = 1;
            keyboardEdit(letter, 'green');
            
        } else {
            if (wordOfTheDay.includes(letter)) {
                letterCorrects[i] = 1;
                keyboardEdit(letter, 'orange');
                continue;
            }
            keyboardEdit(letter, 'darken');
        }
    }
    adjustGameBoard(exactMatches, letterCorrects);
}

function adjustGameBoard(exactMatches, letterCorrects) {

    const rowDiv = document.querySelector(`.r${tryCount}`);
    const childDivs = rowDiv.getElementsByTagName('div');
    
    // Changes the divs colors
    for (let i=0; i<5; i++) {
        let div = childDivs[i];
        if (exactMatches[i] === 1) {
            div.style.backgroundColor = 'green';
        } else if (letterCorrects[i] === 1) {
            div.style.backgroundColor = 'orange';
        }
    }
    loadingAnimation(false);
    // WIN CASE!
    if (exactMatches.every(function(element) {
        return element === 1;})) {
        console.log('YOU WIN!');
        let messages = document.querySelector('.messages-div');
        messages.style.color = 'green';
        messages.innerText = "You Win!"
        messages.style.opacity = 1;
        let header = document.querySelector('.heading');
        header.setAttribute('id', 'winClass');
    }
    // LOSE CASE 
    else if(tryCount === 5) {
        console.log('SORRY YOU LOSE!');
        let messages = document.querySelector('.messages-div');
        messages.style.color = 'red';
        messages.innerText = "Sorry You Lose, Try Again."
        messages.style.opacity = 1;
        let header = document.querySelector('.heading');
        header.style.color = '#ee6055';
    }

    tryCount++;
    prevTurn = undefined;
    findTurn();
}

// On page refresh
addEventListener("DOMContentLoaded", (event) => {
    event.preventDefault();

    loadingAnimation(false);
    // Initialize empty game board 
    gameBoardInit();
    // Initialize Keyboard
    keyboardInit();
    // Find first position
    findTurn();

    document.body.addEventListener("click", function(event) {
        const keyboard = document.querySelector('.keyboard');
        if (event.target !== keyboard && !keyboard.contains(event.target)) {
            event.preventDefault();
            reFocus();
        }
    });

    // //Finds position when re-clicking back to page
    // window.addEventListener('blur', (e) => {
    //     e.preventDefault();
    //     hasFocus = false;
    // });
    // window.addEventListener('focus', (e) => {
    //     e.preventDefault();
    //     hasFocus = true;
    //     reFocus();
    // });


    function reFocus() {

        const row = document.querySelector(`.r${tryCount}`);
        const boxes = row.querySelectorAll('div');
        for (box of boxes) {
            if (box.innerText !== '' && box.id[1] === '4') {
                box.focus();
                return;
            }
            else if (box.innerText === '') {
                box.focus();
                return;
            }
            
        }

    }

    // For typing with on screen keyboard
    document.querySelectorAll('.key').forEach( (key)  => {key.addEventListener('click', main )});

    // Handles entry of letter/words
    document.querySelector('.game-board').addEventListener("keydown", main );
});






function main(event) {

    const bloc = event.target;
    
    // Check whether of not event is from the on screen keyboard or typed
    if (bloc.value !== undefined) {
        if (prevTurn !== undefined && prevTurn !== null) {

            if(prevTurn.id[1] === '4' && bloc.value !== '8' && prevTurn.innerText !== '') {
                if (bloc.value === '13' && prevTurn.innerText !== '') {
                    let theWord = getTry(prevTurn.id);
                    checkTheWord(theWord.toLowerCase(), prevTurn.id);
                    return;
                }
                prevTurn.focus();
                return;
            }

            else if (bloc.value === '8') {
                let back_letter = prevTurn;
                back_letter.innerText = '';
                back_letter.focus();
                prevTurn = prevTurn.previousElementSibling;
                return;
            }
        }
        let box = findTurn();
        if (box.id[0] == tryCount) {
            if (bloc.value !== '13' && bloc.value !== '8') {
                prevTurn = box;
                box.innerText = bloc.value;
                return;
            }
            else {
                if (bloc.value === '8' && box.id[1] !== '0') {
                    prevTurn = box;
                    let back_letter = box.previousElementSibling;
                    back_letter.innerText = '';
                    back_letter.focus();
                    return;
                }
            }
        }
        return;
        
    }

    // prevents non-letters except for backspace
    if (!isLetter(event.key) && event.keyCode !== 8 && event.keyCode !== 13) {
        event.preventDefault();
    }
    // handles backspace
    else if (event.keyCode === 8) {
        // return if in column 0
        if (bloc.id[1] === '0') {return}
        // if backspace is on column 4
        if (bloc.id[1] === '4' && bloc.innerText != '') {
            bloc.innerText = '';
            return;
        }
        let back_letter = bloc.previousElementSibling;
        back_letter.innerText = '';
        back_letter.focus();
    }
    else {
        if (bloc.id[1] === '4') {
            if (event.keyCode === 13 && bloc.innerText !== '') {

                let theWord = getTry(bloc.id);

                checkTheWord(theWord.toLowerCase(), bloc.id);

            }
            else if (event.keyCode !== 13 && bloc.innerText === '') {
                bloc.innerText = event.key.toUpperCase();
            }
            return;
        }
        else if (event.keyCode !== 13) {
            bloc.innerText = event.key.toUpperCase();
            findTurn();
        }
    }
}
