const searchForm = document.querySelector("#search-form");
const inputElement = document.getElementById('searchInput')
const select = document.querySelector("[name='select-option']");
const psicTable = document.querySelector("#psicTable");
const thElement = psicTable.querySelectorAll("th");
const resultCounter = document.querySelector("#resultCounter");
const aboutPageModal = document.querySelector("#about");
const clearText = document.querySelector("#clear-text");
const container = document.querySelector(".container");

let prevActiveTH = null
let searchTimeout;

function closeAboutPage() {
    aboutPageModal.classList.add("hidden");
    container.classList.remove("hidden");
}

function openAboutPage() {
    aboutPageModal.classList.remove("hidden");
    container.classList.add("hidden");
}

async function fetchDescriptors() {
    const response = await fetch("./bnDescriptors.json");
    const descriptors = await response.json();
    return descriptors;
}

async function changeKeyName() {
    const descriptorsObj = await fetchDescriptors();
    
    const keyMapping = {
        "PSIC_SEC_DESC": "sector",
        "PSIC_DIV_DESC": "division",
        "PSIC_GRP_DESC": "group",
        "PSIC_CLS_DESC": "class",
        "BND_VALUE": "bnValue"
    };

    const newKeysMapped = await descriptorsObj.map((item) => {
        const entries = Object.entries(item).map(([key, value]) => {
            const newKey = keyMapping[key];
            return [newKey, value];
        });
        return Object.fromEntries(entries);
    });

    return newKeysMapped;
}

function isValidKeyword(keyword) {
    return keyword.length >= 3;
}

function deleteExistingTbody(tbody) {
    if (psicTable.contains(tbody)) {
        psicTable.removeChild(tbody);
    }
}

async function handleInput() {
    inputElement.value = inputElement.value.toUpperCase();

    if (inputElement.value !== '') {
        clearText.classList.remove("hidden");
    } else {
        clearText.classList.add("hidden");
    }

    if (inputElement.value.trim() === '') {
        return;
    }

    const reconstructedDescriptors = await changeKeyName();
    const selectedOption = select.value;
    const keyword = searchForm.keyword.value;

    if (resultCounter.textContent) {
        resultCounter.textContent = "";
    };

    const existingTbody = psicTable.querySelector("tbody");

    if (searchTimeout) {
        clearTimeout(searchTimeout);
    };

    searchTimeout = setTimeout(async () => {
        if (isValidKeyword(keyword)) {
            deleteExistingTbody(existingTbody);
            await displayResults(reconstructedDescriptors, keyword, selectedOption);
        } else {
            deleteExistingTbody(existingTbody);
        }
    
        highlightActiveHeader();
        scrollToResults();
    }, 300)
}

function highlightActiveHeader() {
    const selectedOptionText = select.options[select.selectedIndex].text;
    const activeTH = Array.from(thElement).find(th => th.textContent === selectedOptionText);
    if (activeTH) {
        if (prevActiveTH) {
            prevActiveTH.classList.remove("font-bold", "text-white");
            prevActiveTH.classList.add("bg-white");
        }
        activeTH.classList.add("font-bold", "text-white");
        activeTH.classList.remove("bg-white");
        prevActiveTH = activeTH;
    }
}

function highlightActiveCells(select, tbody) {
    const selectedOptionIndex = select.selectedIndex;

    const rows = tbody.querySelectorAll(".result-row");
    rows.forEach(row => {
        const td = row.querySelectorAll("td");
        td.forEach((cell, index) => {
            if (index === selectedOptionIndex) {
                cell.classList.add("font-semibold", "bg-[rgba(255,255,255,0.1)]");
            } else {
                cell.classList.remove("font-semibold", "bg-[rgba(255,255,255,0.1)]");
            }
        });
    });
}

function showresultCounter(select, tbody, keyword) {
    const selectedOptionText = select.options[select.selectedIndex].text;
    const rows = tbody.getElementsByTagName("tr");
    if (isValidKeyword(keyword)) {
        if (rows.length > 0) {
            resultCounter.textContent = `${selectedOptionText} found: ${rows.length}`;
        } else {
            return resultCounter.textContent = "No result found."
        }
    }
}

async function filterByKeyword(array, keyword, option) {
    const result = await array.filter(item => item[`${option}`].includes(keyword.toUpperCase()));
    return result;
}

async function displayResults(array, keyword, option) {
    const filteredArr = await filterByKeyword(array, keyword, option);

    const html = await filteredArr.map((item, index) =>
        `<tr class=result-row>
          <td class="px-2 py-1">${item.bnValue}</td>
          <td class="px-2 py-1">${item.class}</td>
          <td class="px-2 py-1">${item.group}</td>
          <td class="px-2 py-1">${item.division}</td>
          <td class="px-2 py-1">${item.sector}</td>
        </tr>`
        );
    
    const newTbody = document.createElement("tbody");
    newTbody.innerHTML = await html.join("");
    psicTable.appendChild(newTbody);

    showresultCounter(select, newTbody, keyword);
    highlightActiveCells(select, newTbody);
}

function scrollToResults() {
    searchForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function onClearText() {
    if (inputElement.value !== '') {
        inputElement.value = '';
        clearText.classList.add("hidden");
    }
}

let isMenuClicked = false;
function toggleNav() {
    isMenuClicked = !isMenuClicked

    const hr1 = document.querySelector("#hr1");
    const hr2 = document.querySelector("#hr2");
    const hr3 = document.querySelector("#hr3");
    const mobileNav = document.querySelector("#mobile-nav");

    if (isMenuClicked) {
        hr1.classList.add("rotate-[40deg]", "top-1/2");
        hr2.classList.add("opacity-0");
        hr3.classList.add("-rotate-[40deg]", "top-1/2");
        hr1.classList.remove("top-0");
        hr3.classList.remove("top-full");
        mobileNav.classList.remove("translate-x-full");
        mobileNav.classList.add("translate-x-0");
    } else {
        hr1.classList.remove("rotate-[40deg]", "top-1/2");
        hr2.classList.remove("opacity-0");
        hr3.classList.remove("-rotate-[40deg]", "top-1/2");
        hr1.classList.add("top-0");
        hr3.classList.add("top-full");
        mobileNav.classList.add("translate-x-full");
        mobileNav.classList.remove("translate-x-0");
    }
}

function startSearching() {
    setTimeout(() => {
        inputElement.focus();
    }, 300);
}

searchForm.addEventListener("input", handleInput);
inputElement.addEventListener("click", function() {this.select()})

window.addEventListener("submit", e => e.preventDefault());