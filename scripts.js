const searchForm = document.querySelector(".search-form");
const inputElement = document.getElementById('searchInput')
const select = document.querySelector("[name='select-option']");
const psicTable = document.querySelector(".psicTable");
const thElement = psicTable.querySelectorAll("th");
const resultCountDiv = document.querySelector(".resultCount");

let prevActiveTH = null

async function fetchDescriptors() {
    const response = await fetch("./bnDescriptors.json");
    const descriptors = await response.json();
    return descriptors;
}

async function changeKeyName() {
    const descriptors = await fetchDescriptors();
    
    const keyMapping = {
        "PSIC_SEC_DESC": "sector",
        "PSIC_DIV_DESC": "division",
        "PSIC_GRP_DESC": "group",
        "PSIC_CLS_DESC": "class",
        "BND_VALUE": "bnValue"
    };

    const reconstructDescriptors = descriptors.map((item) => {
        return Object.fromEntries(
            Object.entries(item).map(([key, value]) => {
                const newKey = keyMapping[key];
                return [newKey, value];
            })
        );
    });

    return reconstructDescriptors;
}

function isValidKeyword(keyword) {
    return keyword.length >= 3;
}

async function handleInput() {
    const selectedOption = select.value;
    const keyword = searchForm.keyword.value;

    // Transform the input text to uppercase
    inputElement.value = inputElement.value.toUpperCase();

    // Delete existing result
    const existingTbody = psicTable.querySelector("tbody");
    if (existingTbody) {
        psicTable.removeChild(existingTbody);
    }

    if (resultCountDiv.textContent) {
        resultCountDiv.textContent = "";
    }

    const descArray = await changeKeyName();
    
    if (isValidKeyword(keyword)) {
        await displayResults(descArray, keyword, selectedOption);
    }
    highlightActiveHeader();
}

function handleChange() {
    if (prevActiveTH) {
        prevActiveTH.style.background = "";
    }

    highlightActiveHeader();
}

function highlightActiveHeader() {
    const selectedOptionText = select.options[select.selectedIndex].text;
    const activeTH = Array.from(thElement).find(th => th.textContent === selectedOptionText);
    if (activeTH) {
        if (prevActiveTH) {
            prevActiveTH.style.background = "";
        }
        activeTH.style.background = "rgb(20, 20, 20)";
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
                cell.classList.add("active-cell");
            } else {
                cell.classList.remove("active-cell");
            }
        });
    });
}

function showResultCount(select, tbody, keyword) {
    const selectedOptionText = select.options[select.selectedIndex].text;
    const rows = tbody.getElementsByTagName("tr");
    if (isValidKeyword(keyword)) {
        if (rows.length > 0) {
            resultCountDiv.textContent = `${selectedOptionText} found: ${rows.length}`;
        } else {
            return resultCountDiv.textContent = "No result found."
        }
    }
}

async function filterByKeyword(array, keyword, option) {
    const result = await array.filter(item => item[`${option}`].includes(keyword.toUpperCase()));
    return result;
}

async function displayResults(array, keyword, option) {
    const filteredArr = await filterByKeyword(array, keyword, option);
    const newTbody = document.createElement("tbody");

    const html = filteredArr.map(item =>
        `<tr class=result-row>
          <td>${item.bnValue}</td>
          <td>${item.class}</td>
          <td>${item.group}</td>
          <td>${item.division}</td>
        </tr>`
        );
    newTbody.innerHTML = html.join("");
    psicTable.appendChild(newTbody);
    showResultCount(select, newTbody, keyword);
    highlightActiveCells(select, newTbody);
}

searchForm.addEventListener("input", handleInput);
select.addEventListener("change", handleChange);