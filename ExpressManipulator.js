import StackAnimation from "./StackAnimator.js";

class ExpressionManipulator {
    constructor() {
        this.precedence = {
            '^': 3,
            '/': 2,
            '*': 2,
            '+': 1,
            '-': 1,
        };
    }

    splitExpression(expression) {
        const regex = /(\d+)\s*-\s*(\d+)/g;
        const minusParenthesesRegex = /-\s*\(([^)]+)\)/g;
        return expression
            .replace(minusParenthesesRegex, (match, p1) => { // -(4+5) => -1*(4+5)
                return `-1*(${p1})`;
            })
            .replace(regex, (match, p1, p2) => {             // 4-5 => 4+(-5)
                return `${p1}+(-${p2})`;
            })
            .match(/\-?\d+(\.\d+)?\b|[+\-*/^()]/g) || [];
    }

    translateToPostfix(expression) {
        const originalElements = this.splitExpression(expression);
        const postfix = [];
        const stack = [];

        for (const element of originalElements) {
            switch (element) {
                case '+':
                case '-':
                case '*':
                case '/':
                case '^':
                    while (stack.length !== 0 && this.precedence[stack[stack.length - 1]] >= this.precedence[element]) {
                        postfix.push(stack.pop());
                    }
                    stack.push(element);
                    break;
                case '(':
                    stack.push(element);
                    break;
                case ')':
                    while (stack.length !== 0 && stack[stack.length - 1] !== '(') {
                        postfix.push(stack.pop());
                    }
                    stack.pop();
                    break;
                default:
                    postfix.push(element);
                    break;
            }
        }
        while (stack.length !== 0) {
            postfix.push(stack.pop());
        }

        return [postfix, postfix.join(' ')];
    }

    async evaluate(stack, animate = true) {
        // Selectors
        const sectionParent = document.querySelector("body article>section");
        const res_stack = []
        if (animate) {
            var animated_initial = new StackAnimation(stack.slice().reverse(), "initial", sectionParent)
            var animated_result = new StackAnimation(res_stack, "result", sectionParent)
        }
        return new Promise((resolve, reject) => {
            // Once the to-be-animated stack has been initialized, we can start evaluating
            document.addEventListener('initialstackinitialized', async () => {
                // Manual mode
                const manualMode = localStorage.getItem('manual') == '1';
                if (animate && manualMode) {
                    if (!document.getElementById("stepper")) {
                        const btn = document.createElement("button");
                        btn.id = 'stepper'
                        btn.innerHTML = "Next Step";
                        sectionParent.appendChild(btn);
                        btn.addEventListener("click", async () => {
                            if (stack.length > 0) {
                                await evaluationStep(reject);
                            }
                            else if (res_stack.length == 1)
                                resolve(res_stack.pop());
                            else
                                reject("Error Code 1; Invalid expression");
                        });
                    }
                }
                // Automatic mode - speed determined by user's settings (persisted in local storage)
                else {
                    const speedMode = parseInt(localStorage.getItem('speed'));
                    while (stack.length > 0) {
                        await new Promise(resolve => setTimeout(resolve, speedMode/2))
                        await evaluationStep(reject);
                        await new Promise(resolve => setTimeout(resolve, speedMode/2))
                    }
                    if (res_stack.length == 1)
                        resolve(res_stack.pop());
                    else
                        reject("Error Code 2; Invalid expression");
                }

            }, { once: true })
            // No stack to be initialized if we disabled animations, so we fake-dispatch.
            if (!animate) {
                document.dispatchEvent(new Event('initialstackinitialized'));
            }
        })

        async function evaluationStep(reject) {
            const read_char = stack.pop();
            if (animate)
                await animated_initial.popFirst();
            let toAddToStack = null;
            if (isNaN(read_char)) {
                if (res_stack.length < 2)
                    reject("Invalid expression err #021");
                const a = parseFloat(res_stack.pop());
                const b = parseFloat(res_stack.pop());
                if (animate) {
                    await animated_result.popLast();
                    await animated_result.popLast();
                }
                switch (read_char) {
                    case '+':
                        toAddToStack = b + a;
                        break;
                    case '-':
                        toAddToStack = b - a;
                        break;
                    case '*':
                        toAddToStack = b * a;
                        break;
                    case '/':
                        toAddToStack = b / a;
                        break;
                    case '^':
                        toAddToStack = Math.pow(b, a);
                        break;
                    default:
                        break;
                }
            } else {
                toAddToStack = parseFloat(read_char);
            }
            if (animate)
                await animated_result.append(toAddToStack);
            res_stack.push(toAddToStack);
        }
    }
}



export default ExpressionManipulator