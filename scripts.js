import bnValueArr from "./data/descriptors.js";
import psicClassArr from "./data/psicClass.js";
import psicGroupArr from "./data/psiccGroup.js";
import psicDivArr from "./data/psicDiv.js";

const searchForm = document.querySelector(".search-form");
const select = document.querySelector("[name='select-option']")
const psicTable = document.querySelector(".psicTable");
const tbody = psicTable.querySelector("tbody");
const thElement = psicTable.querySelectorAll("th");
const allArray = compileArrays(bnValueArr, psicClassArr, psicGroupArr, psicDivArr);

function compileArrays(arr1, arr2, arr3, arr4) {
    const compiledArr = arr1.map((bnValue, index) => ({
        bnValue,
        class: arr2[index],
        group: arr3[index],
        division: arr4[index]
    }));
    return compiledArr;
}

function handleInput() {
    const selectedOption = select.value;
    const keyword = searchForm.keyword.value;
    tbody.innerHTML = "";
    if (keyword.length >= 3) {
        displayResults(keyword, selectedOption);
    }
    highlightActiveOption();
}

let prevActiveTH = null;

function highlightActiveOption() {
    const selectedOptionText = select.options[select.selectedIndex].text;
    const activeTH = Array.from(thElement).find(th => th.textContent === selectedOptionText);
    if (activeTH) {
        if (prevActiveTH) {
            prevActiveTH.style.background = "";
        }
        activeTH.style.background = "black";
        prevActiveTH = activeTH;
    }
}

function filterByKeyword(array, keyword, option) {
    const result = array.filter(item => item[`${option}`].includes(keyword.toUpperCase()));
    return result;
}

function displayResults(keyword, option) {
    const filteredArr = filterByKeyword(allArray, keyword, option);
    const html = filteredArr.map(item =>
        `<tr>
          <td>${item.bnValue}</td>
          <td>${item.class}</td>
          <td>${item.group}</td>
          <td>${item.division}</td>
        </tr>`
        );
    tbody.innerHTML = html.join("");
}

searchForm.addEventListener("input", handleInput);
console.log(psicTable);