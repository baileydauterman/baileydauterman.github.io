const visuallyHidden = "visually-hidden";

function createDiv(textContent, attributes) {
    return createElement("div", textContent, attributes);
}

function createElement(elementName, textContent, attributes) {
    let elem = document.createElement(elementName);

    attributes.forEach(attr => {
        elem.classList.add(attr);
    })

    elem.textContent = textContent;
    return elem;
}

function createHStack() {
    return createDiv("", ["hstack", "gap-2"]);
}

function printResume() {
    let printHideArea = document.getElementById("printHideArea");
    printHideArea.classList.add(visuallyHidden);

    let main = document.getElementById("main");
    main.style.left = "0%";

    try {
        navigator.clipboard.writeText(jsonTextArea.value);
    } catch {

    }

    window.print()

    printHideArea.classList.remove(visuallyHidden);
    main.style.left = "55%";
}