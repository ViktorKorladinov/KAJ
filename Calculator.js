import ExpressionManipulator from "./ExpressManipulator.js";
import SettingsDialog from "./SettingsDialog.js";

class Calculator {

    // Create the calculator buttons and add their functionality
    loadButtons() {
        this.input = document.querySelector('#expression-input');
        this.expressionManipulator = new ExpressionManipulator();
        this.buttonLabels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '<=', '=', '.', '+', '-', '*', '/', 'x^y', '(', ')'];
        this.setupButtons();
        this.modifySubmit();
    }

    setupButtons() {
        const numContainer = document.querySelector('.num-container');
        const opsContainer = document.querySelector('.ops-container');

        this.buttonLabels.forEach((label, index) => {
            const button = document.createElement('button');
            button.textContent = label;
            button.type = label === '=' ? 'submit' : 'button';
            const className = this.getButtonClass(label)
            if (className)
                button.classList.add(className);
            button.addEventListener('click', () => this.handleButtonClick(label));
            if (index > 11) {
                button.classList.add("operand-btn");
                opsContainer.appendChild(button);
            } else {
                numContainer.appendChild(button);
            }
        });
    }

    getButtonClass(label) {
        const buttonClasses = {
            "=": "equals-btn",
            "x^y": "power",
            "operand": "operand-btn"
        };
        return buttonClasses[label] || '';
    }

    handleButtonClick(label) {
        let newValue = '';
        switch (label) {
            case '=':                       // prevent = from showing in the input field
                newValue = '';
                break;
            case '<=':                       // prevent = from showing in the input field
                this.input.value = this.input.value.substring(0, this.input.value.length - 1);
                return;
            case 'x^y':                     // force ^ instead of x^y in the input field
                newValue = '^';
                break;
            default:
                newValue = label;           // display the pressed character as-is in the input field
                break;
        }
        this.input.value += newValue;
    }

    // Make sure the expression contains only allowed characters, then pass along
    evaluateExpression() {
        const container = document.querySelector('body article > section');
        container.textContent = ''
        const expression = this.input.value;
        for (let char of expression) {
            if (!this.buttonLabels.includes(char) && char != '^') {
                alert(`Invalid characters in expression ${expression}: ${char}`);
                return;
            }
        }
        const [postf_stack, postf_str] = this.expressionManipulator.translateToPostfix(expression);
        const rev_stack = postf_stack.slice().reverse();
        this.expressionManipulator
            .evaluate(rev_stack, localStorage.getItem('animation') === '1')
            .then(res => {
                document.querySelector('#expression-input').value = res;
                container.textContent = '';
            })
            .catch(err => alert(err + " " + postf_str))
    }

    modifySubmit() {
        const form = document.querySelector('.calc-form');
        form.addEventListener('submit', e => {
            e.preventDefault();
            this.evaluateExpression();
        });
    }
}

const calculator = new Calculator();
calculator.loadButtons();
const settings = new SettingsDialog();
settings.loadSettings();