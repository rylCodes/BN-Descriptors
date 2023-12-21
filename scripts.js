const searchForm = document.querySelector(".search-form");
const inputElement = document.getElementById('searchInput')
const select = document.querySelector("[name='select-option']");
const psicTable = document.querySelector(".psicTable");
const thElement = psicTable.querySelectorAll("th");
const resultCounter = document.querySelector(".resultCounter");
const aboutPageModal = document.querySelector(".aboutPage-modal");

let prevActiveTH = null
let searchTimeout;

function closeAboutPage() {
    aboutPageModal.classList.add("hidden");
}

function openAboutPage() {
    aboutPageModal.classList.remove("hidden");
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
    // Transform the input text to uppercase first.
    inputElement.value = inputElement.value.toUpperCase();

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
            prevActiveTH.classList.remove("active-header");
        }
        activeTH.classList.add("active-header");
        prevActiveTH = activeTH;
    }
}

function highlightActiveCells(select, tbody) {
    const selectedOptionIndex = select.selectedIndex;

    // Highlight the text of the active table data
    const rows = tbody.querySelectorAll(".result-row");
    rows.forEach(row => {
        const td = row.querySelectorAll("td");
        td.forEach((cell, index) => {
            if (index === selectedOptionIndex) {
                cell.classList.add("active-column");
            } else {
                cell.classList.remove("active-column");
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
          <td>${item.bnValue}</td>
          <td>${item.class}</td>
          <td>${item.group}</td>
          <td>${item.division}</td>
          <td class="psic-sector">${item.sector}</td>
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

searchForm.addEventListener("input", handleInput);

window.addEventListener("submit", e => e.preventDefault());