const searchForm = document.querySelector(".search-form");
const select = document.querySelector("[name='select-option']")
const psicTable = document.querySelector(".psicTable");
const thElement = psicTable.querySelectorAll("th");
const resultCountDiv = document.querySelector(".resultCount");

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

    const changedDescriptors = descriptors.map((item) => {
        return Object.fromEntries(
            Object.entries(item).map(([key, value]) => {
                const newKey = keyMapping[key];
                return [newKey, value];
            })
        );
    });

    return changedDescriptors;
}

async function handleInput() {
    // Delete existing result
    const existingTbody = psicTable.querySelector("tbody");
    if (existingTbody) {
        psicTable.removeChild(existingTbody);
    }

    const selectedOption = select.value;
    const keyword = searchForm.keyword.value;
    const descArray = await changeKeyName();
    
    if (keyword.length >= 3) {
    await displayResults(descArray, keyword, selectedOption);
    }
}

let prevActiveTH = null;

function highlightActiveOption(select, tbody) {
    const selectedOptionText = select.options[select.selectedIndex].text;
    const selectedOptionIndex = select.selectedIndex;
    // Highlight the background of active table header
    const activeTH = Array.from(thElement).find(th => th.textContent === selectedOptionText);
    if (activeTH) {
        if (prevActiveTH) {
            prevActiveTH.style.background = "";
        }
        activeTH.style.background = "black";
        prevActiveTH = activeTH;
    }

    // Highlight the text of the active table data
    const rows = tbody.querySelectorAll(".result-row");
    rows.forEach(row => {
        const td = row.querySelectorAll("td");
        td.forEach((cell, index) => {
            if (index === selectedOptionIndex) {
                // Add a class to the active cell
                cell.classList.add("active-cell");
            } else {
                // Remove the class from other cells
                cell.classList.remove("active-cell");
            }
        });
    });
}

function showResultCount(select, tbody) {
    const selectedOptionText = select.options[select.selectedIndex].text;
    const rows = tbody.getElementsByTagName("tr");
    resultCountDiv.textContent = "";
    if (rows.length > 0) {
        resultCountDiv.textContent = `${selectedOptionText} found: ${rows.length}`;
    }
}

function filterByKeyword(array, keyword, option) {
    const result = array.filter(item => item[`${option}`].includes(keyword.toUpperCase()));
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
    showResultCount(select, newTbody);
    highlightActiveOption(select, newTbody);
}

searchForm.addEventListener("input", handleInput);