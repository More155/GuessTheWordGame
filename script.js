const originalWords = ["Apple", "Guitar", "Flower", "Pen", "Rainbow", "Forest", "Puzzle", "Butterfly", "Elephant", "Vanilla"];

let availableWords = [...originalWords];  

let currentWord = "";         
let currentOriginal = "";    
let tries = 0;
let mistakes = [];
const maxErrors = 6;


const scrambledEl = document.getElementById("scrambled");
const inputsContainer = document.getElementById("inputs");
const triesEl = document.getElementById("tries");
const mistakesCountEl = document.getElementById("mistakes-count");
const mistakesListEl = document.getElementById("mistakes-list");

function scrambleWord(word) {
    const letters = word.split("");
    for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters.join("");
}

function createInputFields(length) {
    inputsContainer.innerHTML = "";
    for (let i = 0; i < length; i++) {
        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = 1;
        input.dataset.index = i;
        input.addEventListener("input", handleInput);
        input.addEventListener("keydown", handleBackspace);
        inputsContainer.appendChild(input);
    }
}

function handleInput(e) {
    const input = e.target;
    input.value = input.value.toLowerCase();

    if (input.value) {
        const nextInput = input.nextElementSibling;
        if (nextInput) nextInput.focus();
    }
    checkCompletion();
}

function handleBackspace(e) {
    if (e.key === "Backspace" && !e.target.value) {
        const prev = e.target.previousElementSibling;
        if (prev) prev.focus();
    }
}

function giveHint() {
    const inputs = inputsContainer.querySelectorAll("input");
    for (let i = 0; i < currentWord.length; i++) {
        if (inputs[i].value.toLowerCase() !== currentWord[i]) {
            inputs[i].value = currentWord[i];
            tries++;
            triesEl.textContent = tries;
            checkCompletion();
            return;
        }
    }
    Swal.fire("Almost there!", "All visible letters are correct.", "info");
}

async function checkCompletion() {
    const inputs = inputsContainer.querySelectorAll("input");
    let correctCount = 0;
    let hasWrong = false;

    inputs.forEach((input, i) => {
        const letter = input.value.toLowerCase();
        if (letter) {
            if (letter === currentWord[i]) {
                correctCount++;
            } else {
                hasWrong = true;
                if (!currentWord.includes(letter) && !mistakes.includes(letter)) {
                    mistakes.push(letter);
                    mistakesListEl.textContent = mistakes.join(" ").toUpperCase();
                    mistakesCountEl.textContent = mistakes.length;
                }
            }
        }
    });

    if (correctCount === currentWord.length) {
        inputs.forEach(inp => inp.disabled = true);

        const index = availableWords.indexOf(currentOriginal);
        if (index > -1) {
            availableWords.splice(index, 1);
        }

        await Swal.fire({
            title: "Awesome! 🎉",
            text: `You guessed "${currentOriginal}"!\n${availableWords.length} words left.`,
            icon: "success",
            confirmButtonText: availableWords.length > 0 ? "Next" : "Start Over"
        });

        if (availableWords.length > 0) {
            generateNewWord();
        } else {
            await Swal.fire({
                title: "Congratulations! 🏆",
                html: "<p>You completed all the words!</p>",
                icon: "success",
                confirmButtonText: "Play Again"
            });
            availableWords = [...originalWords];
            generateNewWord();
        }
        return;
    }

    if (hasWrong) {
        tries++;
        triesEl.textContent = tries;
    }

    if (tries >= maxErrors || mistakes.length >= maxErrors) {
        inputs.forEach(inp => inp.disabled = true);
        await Swal.fire({
            title: "😞",
            text: `The word was: ${currentOriginal}`,
            icon: "error",
            confirmButtonText: "Next"
        });
        generateNewWord();
    }
}

function generateNewWord() {
    if (availableWords.length === 0) {
        availableWords = [...originalWords];
    }

    currentOriginal = availableWords[Math.floor(Math.random() * availableWords.length)];
    currentWord = currentOriginal.toLowerCase();  

    scrambledEl.textContent = scrambleWord(currentWord).toUpperCase();
    createInputFields(currentWord.length);

    tries = 0;
    mistakes = [];
    triesEl.textContent = 0;
    mistakesCountEl.textContent = 0;
    mistakesListEl.textContent = "";

    inputsContainer.querySelectorAll("input").forEach(inp => {
        inp.disabled = false;
        inp.value = "";
    });
    inputsContainer.querySelector("input")?.focus();
}

function resetGame() {
    availableWords = [...originalWords];
    generateNewWord();
}

document.getElementById("randomButton").addEventListener("click", generateNewWord);
document.getElementById("resetButton").addEventListener("click", resetGame);
document.getElementById("hintButton").addEventListener("click", giveHint);

generateNewWord();