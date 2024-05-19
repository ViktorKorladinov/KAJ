class StackAnimation {
    // Create the stack
    constructor(arr, name, element = document.body) {
        this.arr = arr;
        this.name = name;
        this.audio = localStorage.getItem('audio') == 1;
        if (audio) {
            this.appendSound = new Audio('insert.mp3');
            this.popSound = new Audio('pop.mp3')
        }
        document.addEventListener(`${this.name}stackcreated`, () => {
            this.#constructStack();
        }, { once: true });
        this.#createSVG(element);

    }
    // Pop the first element - Queue
    popFirst = () => {
        return new Promise((resolve, reject) => {
            // Selectors
            const itemsParent = document.querySelector(`#${this.name} #items`);
            const indicesParent = document.querySelector(`#${this.name} #indices`);
            const dividersParent = document.querySelector(`#${this.name} #dividers`);
            const container = document.querySelector(`#${this.name} #container`);

            // Once the numbers are translated and the container is shrunk, 
            // rewrite the x value and remove the translation, so the code is reusable. 
            // Just setting X does not trigger transition.
            itemsParent.addEventListener("transitionend", (event) => {
                if (!event.target.classList.contains('moveLeft'))
                    return
                itemsParent.classList.toggle('notransition')
                itemsParent.classList.toggle('moveLeft')
                for (const child of itemsParent.children) {
                    child.setAttribute("x", child.getAttribute('x') - 50)
                }

                setTimeout(() => {
                    itemsParent.classList.toggle('notransition')
                    resolve()
                }, 0);
            }, { once: true });

            setTimeout(() => {
                if (this.audio) {
                    this.popSound.play()
                }
            }, 10)
            // Remove the first element
            itemsParent.removeChild(itemsParent.children[0]);

            // Remove the last orphaned index
            indicesParent.removeChild(indicesParent.children[indicesParent.children.length - 1]);

            // Remove the last orphaned divider
            if (dividersParent.children.length)
                dividersParent.removeChild(dividersParent.children[dividersParent.children.length - 1]);

            // Shrink the container
            if (itemsParent.children.length > 0)
                container.setAttribute("width", `${parseInt(container.getAttribute("width")) - 50}px`);

            itemsParent.classList.toggle('moveLeft');
        })
    }

    // Pop the last element - Stack
    popLast = () => {
        // Selectors
        const itemsParent = document.querySelector(`#${this.name} #items`);
        const indicesParent = document.querySelector(`#${this.name} #indices`);
        const dividersParent = document.querySelector(`#${this.name} #dividers`);
        const container = document.querySelector(`#${this.name} #container`);
        return new Promise((resolve, reject) => {
            container.addEventListener('transitionend', () => {
                setTimeout(() => resolve(), 10)
            }, { once: true })

            itemsParent.removeChild(itemsParent.lastElementChild);
            indicesParent.removeChild(indicesParent.lastElementChild);
            dividersParent.removeChild(dividersParent.lastElementChild);
            // Shrink container
            if (parseInt(container.getAttribute("width")) == 50) {
                // Dispatch event without shrinking the container - empty container has one spot, not 0,
                // so we need not shrink on last pop.
                container.dispatchEvent(new Event("transitionend"));
            } else {
                container.setAttribute("width", `${parseInt(container.getAttribute("width")) - 50}px`);
            }

        })
    }
    // Append an element to the stack
    append = (itemValue) => {
        return new Promise((resolve, reject) => {
            // Selectors
            const itemsParent = document.querySelector(`#${this.name} #items`)
            const indicesParent = document.querySelector(`#${this.name} #indices`)
            const dividersParent = document.querySelector(`#${this.name} #dividers`)
            const container = document.querySelector(`#${this.name} #container`)

            // Once the container is expanded, add the element.
            container.addEventListener('transitionend', () => {
                let start = 35 + 50 * itemsParent.children.length
                // Append the item itself
                const item = document.createElementNS("http://www.w3.org/2000/svg", "text");
                item.setAttribute("class", "array-element");
                item.setAttribute("x", start);
                item.setAttribute("y", "25");
                item.setAttribute("font-family", "Arial");
                item.setAttribute("font-size", "14");
                item.setAttribute("text-anchor", "middle");
                item.textContent = itemValue.toLocaleString(undefined, { maximumFractionDigits: 2 });
                itemsParent.appendChild(item);

                // Create new index
                const index = document.createElementNS("http://www.w3.org/2000/svg", "text");
                index.setAttribute("x", start);
                index.setAttribute("y", "45");
                index.setAttribute("font-family", "Arial");
                index.setAttribute("font-size", "10");
                index.setAttribute("text-anchor", "middle");
                index.textContent = itemsParent.children.length - 1;
                indicesParent.appendChild(index);

                // Create new divider
                start -= 25
                const divider = document.createElementNS("http://www.w3.org/2000/svg", "line");
                divider.setAttribute("x1", start);
                divider.setAttribute("y1", "5");
                divider.setAttribute("x2", start);
                divider.setAttribute("y2", "55");
                divider.setAttribute("stroke-width", "1.5");
                dividersParent.appendChild(divider)
                resolve()
            }, { once: true })

            // Expand container
            if (parseInt(container.getAttribute("width")) == 50 && itemsParent.children.length == 0) {
                // Dispatch event without expanding the container - empty container has one spot, not 0,
                // so we need not expand on first call.
                container.dispatchEvent(new Event("transitionend"));
            } else {
                container.setAttribute("width", `${parseInt(container.getAttribute("width")) + 50}px`);
            }
            setTimeout(() => {
                if (this.audio) {
                    this.appendSound.play()
                }
            }, 10)
        })
    }

    // Construct the stack from this.arr
    #constructStack = () => {
        // Selectors
        const itemsParent = document.querySelector(`#${this.name} #items`)
        const indicesParent = document.querySelector(`#${this.name} #indices`)
        const dividersParent = document.querySelector(`#${this.name} #dividers`)
        const container = document.querySelector(`#${this.name} #container`)
        // Once the container is expanded, add in the elements.
        container.addEventListener('transitionend', () => {
            // Load in the items & indices
            for (let i = 0; i < this.arr.length; i++) {
                const start = 35 + itemsParent.children.length * 50
                // Items
                const item = document.createElementNS("http://www.w3.org/2000/svg", "text");
                item.setAttribute("class", "array-element");
                item.setAttribute("x", start);
                item.setAttribute("y", "25");
                item.setAttribute("font-family", "Arial");
                item.setAttribute("font-size", "14");
                item.setAttribute("text-anchor", "middle");
                item.textContent = this.arr[i];
                itemsParent.appendChild(item);

                //Indices
                const index = document.createElementNS("http://www.w3.org/2000/svg", "text");
                index.setAttribute("x", start);
                index.setAttribute("y", "45");
                index.setAttribute("font-family", "Arial");
                index.setAttribute("font-size", "10");
                index.setAttribute("text-anchor", "middle");
                index.textContent = i;
                indicesParent.appendChild(index);
            }
            // Set up dividers
            for (let i = 0; i < this.arr.length - 1; i++) {
                const start = 60 + dividersParent.children.length * 50
                const divider = document.createElementNS("http://www.w3.org/2000/svg", "line");
                divider.setAttribute("x1", start);
                divider.setAttribute("y1", "5");
                divider.setAttribute("x2", start);
                divider.setAttribute("y2", "55");
                divider.setAttribute("stroke-width", "1.5");
                dividersParent.appendChild(divider)
            }
            const initialized = new Event(`${this.name}stackinitialized`);
            document.dispatchEvent(initialized)
        }, { once: true })

        // Animate the container expanding
        setTimeout(() => {
            container.setAttribute("width", `${Math.max(50, parseInt(this.arr.length * 50))}px`)
        }, 10)

        // Fake the event if no need for expansion
        if (this.arr.length === 1) {
            container.dispatchEvent(new Event('transitionend'))
        }
    }

    // Create the HTML skeleton this.constructStack() needs. 
    // Append it to the element provided as parameter
    #createSVG = (element) => {
        // Create SVG element
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("height", "60px");
        svg.setAttribute("viewbox", "790 60")
        svg.setAttribute("id", this.name)

        // Array container
        const container = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        container.setAttribute("id", "container");
        container.setAttribute("x", "10");
        container.setAttribute("y", "5");
        container.setAttribute("width", "50");
        container.setAttribute("height", "50");
        container.setAttribute("stroke-width", "2");
        svg.appendChild(container);

        // Array elements group
        const itemsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        itemsGroup.setAttribute("id", "items");
        svg.appendChild(itemsGroup);

        // Array indexes group
        const indicesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        indicesGroup.setAttribute("id", "indices");
        svg.appendChild(indicesGroup);

        // Dividers group
        const dividersGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        dividersGroup.setAttribute("id", "dividers");
        svg.appendChild(dividersGroup);

        // Append SVG to the DOM
        element.appendChild(svg);
        setTimeout(() => {
            const created = new Event(`${this.name}stackcreated`);
            document.dispatchEvent(created)
        }, 0)
    }

}
export default StackAnimation;