const currentDisplay = document.getElementById("current-display");
const previousDisplay = document.getElementById("previous-display");
const calculator = document.querySelector(".calculator");
const buttons = document.querySelector(".buttons");

let currentNumber = "0";
let previousNumber = null;
let currentOperator = null;
let waitingForNumber = false;
let calculationFinished = false;

function updateDisplay() {
  currentDisplay.textContent = formatNumber(currentNumber);
}

function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "Error";
  }

  const rounded = Number(number.toPrecision(12));

  const text = String(rounded);

  if (text.includes("e")) {
    return text.replace("e+", "e");
  }

  const parts = text.split(".");

  let integerPart = parts[0];

  const decimalPart = parts[1];

  const sign = integerPart.startsWith("-") ? "-" : "";

  if (sign) {
    integerPart = integerPart.substring(1);
  }

  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (decimalPart !== undefined) {
    return sign + integerPart + "." + decimalPart;
  }

  return sign + integerPart;
}

function enterNumber(number) {
  clearError();

  if (calculationFinished) {
    currentNumber = number;

    calculationFinished = false;

    previousDisplay.textContent = "";

    updateDisplay();

    return;
  }

  if (waitingForNumber) {
    currentNumber = number;

    waitingForNumber = false;

    updateDisplay();

    return;
  }

  if (currentNumber === "0") {
    currentNumber = number;
  } else {
    currentNumber += number;
  }

  updateDisplay();
}

function enterDecimal() {
  clearError();

  if (calculationFinished) {
    currentNumber = "0.";

    calculationFinished = false;

    previousDisplay.textContent = "";

    updateDisplay();

    return;
  }

  if (waitingForNumber) {
    currentNumber = "0.";

    waitingForNumber = false;

    updateDisplay();

    return;
  }

  /*
        Prevent multiple decimal points.
    */

  if (!currentNumber.includes(".")) {
    currentNumber += ".";
  }

  updateDisplay();
}

/* =====================================
   CHANGE POSITIVE / NEGATIVE
   ===================================== */

function toggleSign() {
  clearError();

  if (currentNumber === "0") {
    return;
  }

  if (currentNumber.startsWith("-")) {
    currentNumber = currentNumber.substring(1);
  } else {
    currentNumber = "-" + currentNumber;
  }

  updateDisplay();
}

/* =====================================
   PERCENTAGE
   ===================================== */

function percentage() {
  clearError();

  const number = Number(currentNumber);

  currentNumber = String(number / 100);

  updateDisplay();
}

/* =====================================
   DELETE / BACKSPACE
   ===================================== */

function deleteNumber() {
  clearError();

  if (calculationFinished) {
    calculationFinished = false;
  }

  if (waitingForNumber) {
    return;
  }

  if (currentNumber.length <= 1) {
    currentNumber = "0";
  } else {
    currentNumber = currentNumber.slice(0, -1);
  }

  /*
        Avoid leaving just "-"
    */

  if (currentNumber === "-" || currentNumber === "") {
    currentNumber = "0";
  }

  updateDisplay();
}

/* =====================================
   CLEAR EVERYTHING
   ===================================== */

function clearCalculator() {
  currentNumber = "0";

  previousNumber = null;

  currentOperator = null;

  waitingForNumber = false;

  calculationFinished = false;

  previousDisplay.textContent = "";

  clearError();

  updateDisplay();
}

/* =====================================
   CALCULATION ENGINE
   ===================================== */

function calculate(first, operator, second) {
  switch (operator) {
    case "+":
      return first + second;

    case "−":
      return first - second;

    case "×":
      return first * second;

    case "÷":
      /*
                Division by zero is not allowed.
            */

      if (second === 0) {
        return null;
      }

      return first / second;

    default:
      return second;
  }
}

/* =====================================
   SELECT OPERATOR
   ===================================== */

function selectOperator(operator) {
  clearError();

  const number = Number(currentNumber);

  /*
        If an operator is pressed twice,
        replace the previous operator.
        
        Example:
        10 + ×
        
        becomes:
        10 ×
    */

  if (currentOperator && waitingForNumber) {
    currentOperator = operator;

    updatePreviousDisplay();

    return;
  }

  /*
        First operator.
    */

  if (previousNumber === null) {
    previousNumber = number;
  } else if (currentOperator) {
    /*
        Chained calculation.
        
        Example:
        10 + 5 + 2
        
        When the second "+"
        is pressed:
        
        10 + 5 is calculated first.
    */
    const result = calculate(previousNumber, currentOperator, number);

    if (result === null) {
      showError();

      return;
    }

    previousNumber = result;

    currentNumber = String(result);
  }

  currentOperator = operator;

  waitingForNumber = true;

  calculationFinished = false;

  updatePreviousDisplay();

  updateDisplay();
}

/* =====================================
   UPDATE PREVIOUS DISPLAY
   ===================================== */

function updatePreviousDisplay() {
  if (previousNumber !== null && currentOperator) {
    previousDisplay.textContent = `${formatNumber(previousNumber)} ${currentOperator}`;
  } else {
    previousDisplay.textContent = "";
  }
}

/* =====================================
   EQUALS
   ===================================== */

function calculateResult() {
  clearError();

  /*
        Nothing to calculate.
    */

  if (previousNumber === null || currentOperator === null) {
    return;
  }

  const secondNumber = Number(currentNumber);

  const result = calculate(previousNumber, currentOperator, secondNumber);

  /*
        Division by zero.
    */

  if (result === null) {
    showError();

    return;
  }

  /*
        Show the complete calculation.
    */

  previousDisplay.textContent = `${formatNumber(previousNumber)} ${currentOperator} ${formatNumber(secondNumber)} =`;

  currentNumber = String(result);

  previousNumber = null;

  currentOperator = null;

  waitingForNumber = false;

  calculationFinished = true;

  updateDisplay();
}

/* =====================================
   SHOW ERROR
   ===================================== */

function showError() {
  currentNumber = "0";

  previousNumber = null;

  currentOperator = null;

  waitingForNumber = false;

  calculationFinished = false;

  currentDisplay.textContent = "Cannot divide by 0";

  previousDisplay.textContent = "";

  /*
        Restart the animation every time.
    */

  calculator.classList.remove("error");

  void calculator.offsetWidth;

  calculator.classList.add("error");
}

/* =====================================
   CLEAR ERROR STATE
   ===================================== */

function clearError() {
  calculator.classList.remove("error");
}

/* =====================================
   BUTTON CLICK EVENTS
   ===================================== */

buttons.addEventListener("click", function (event) {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  /*
            Add a small click animation.
        */

  button.classList.add("pressed");

  setTimeout(() => button.classList.remove("pressed"), 100);

  /*
            Number button
        */

  if (button.dataset.number) {
    enterNumber(button.dataset.number);

    return;
  }

  /*
            Operator button
        */

  if (button.dataset.operator) {
    selectOperator(button.dataset.operator);

    return;
  }

  /*
            Other buttons
        */

  const action = button.dataset.action;

  switch (action) {
    case "clear":
      clearCalculator();

      break;

    case "delete":
      deleteNumber();

      break;

    case "decimal":
      enterDecimal();

      break;

    case "percent":
      percentage();

      break;

    case "sign":
      toggleSign();

      break;

    case "equals":
      calculateResult();

      break;
  }
});

/* =====================================
   KEYBOARD SUPPORT
   ===================================== */

document.addEventListener("keydown", function (event) {
  const key = event.key;

  /*
            Numbers
        */

  if (/^[0-9]$/.test(key)) {
    enterNumber(key);

    return;
  }

  /*
            Decimal
        */

  if (key === ".") {
    enterDecimal();

    return;
  }

  /*
            Addition
        */

  if (key === "+") {
    selectOperator("+");

    return;
  }

  /*
            Subtraction
        */

  if (key === "-") {
    selectOperator("−");

    return;
  }

  /*
            Multiplication
        */

  if (key === "*") {
    selectOperator("×");

    return;
  }

  /*
            Division
        */

  if (key === "/") {
    event.preventDefault();

    selectOperator("÷");

    return;
  }

  /*
            Percentage
        */

  if (key === "%") {
    percentage();

    return;
  }

  /*
            Equals
        */

  if (key === "Enter" || key === "=") {
    event.preventDefault();

    calculateResult();

    return;
  }

  /*
            Backspace
        */

  if (key === "Backspace") {
    event.preventDefault();

    deleteNumber();

    return;
  }

  /*
            Escape / Delete = Clear
        */

  if (key === "Escape" || key === "Delete") {
    clearCalculator();

    return;
  }

  /*
            N = positive/negative
        */

  if (key.toLowerCase() === "n") {
    toggleSign();
  }
});

/* =====================================
   START CALCULATOR
   ===================================== */

updateDisplay();
