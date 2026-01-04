const display = document.getElementById("display");
const buttons = document.querySelectorAll("button");

buttons.forEach(button => {
    button.addEventListener("click", () => {
        const value = button.innerText;

        if (value === "C") {
            clearDisplay();
        }
        else if (value === "=") {
            calculate();
        }
        else {
            appendValue(value);
        }
    });
});

function appendValue(value) {
    switch (value) {
        case "÷":
            display.value += "/";
            break;
        case "×":
            display.value += "*";
            break;
        case "π":
            display.value += "Math.PI";
            break;
        case "√":
            display.value += "Math.sqrt(";
            break;
        case "x²":
            display.value += "**2";
            break;
        case "sin":
            display.value += "Math.sin(";
            break;
        case "cos":
            display.value += "Math.cos(";
            break;
        case "tan":
            display.value += "Math.tan(";
            break;
        case "log":
            display.value += "Math.log10(";
            break;
        default:
            display.value += value;
    }
}

function clearDisplay() {
    display.value = "";
}

function calculate() {
    try {
        let result = eval(display.value);
        display.value = result;
    } catch (error) {
        display.value = "Error";
    }
}