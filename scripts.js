const searchForm = document.querySelector("#search-form");
const inputElement = document.getElementById('searchInput')
const select = document.querySelector("[name='select-option']");
const psicTable = document.querySelector("#psicTable");
const thElement = psicTable.querySelectorAll("th");
const resultCounter = document.querySelector("#resultCounter");
const aboutPage = document.querySelector("#about");
const faqsPage = document.querySelector("#faqs");
const resourcesPage = document.querySelector("#resources");
const clearText = document.querySelector("#clear-text");
const container = document.querySelector(".container");
const questionDiv = document.querySelector("#questions-div");
const mobileNav = document.querySelector("#mobile-nav");

let prevActiveTH = null
let searchTimeout;

function closePage(page) {
    document.querySelector(page).classList.add("hidden");
    container.classList.remove("hidden");
    mobileNav.classList.remove("hidden");
}

async function openPage(page) {
    document.querySelector(page).classList.remove("hidden");
    container.classList.add("hidden");
    mobileNav.classList.add("hidden");

    if (page === '#faqs') {
        await initializeFaqs();
    }
}

let faqs;

function toggleAnswer(e) {
    const index = e.currentTarget.dataset.index;
    const icon1 = document.querySelectorAll('.icon1')[index];
    const icon2 = document.querySelectorAll('.icon2')[index];
    const answer = document.querySelectorAll('.answer')[index];
    const question = document.querySelectorAll('.question')[index];
    const questionText = document.querySelectorAll('.question-text')[index];


    const faq = faqs[index]
    faq.isActive = !faq.isActive;
    
    if (faq.isActive) {
        icon1.classList.add("hidden");
        icon2.classList.remove("hidden", "group-hover:text-white");
        icon2.classList.add("text-white");
        answer.classList.add("flex");
        answer.classList.remove("hidden");
        question.classList.add("bg-[#9A338E]", "text-white");
        question.classList.remove("hover:bg-[#00B6D0]", "hover:text-white", "bg-white");
        questionText.classList.remove("text-[#344B47]");
    } else {
        icon1.classList.remove("hidden");
        icon2.classList.add("hidden", "group-hover:text-white");
        icon2.classList.remove("text-white");
        answer.classList.remove("flex");
        answer.classList.add("hidden");
        question.classList.remove("bg-[#9A338E]", "text-white");
        question.classList.add("hover:bg-[#00B6D0]", "hover:text-white", "bg-white");
        questionText.classList.add("text-[#344B47]");
    }
}

async function displayFaqs() {
    const html = await faqs.map((faq, index) => `
        <div tabindex="0" class="border border-white shadow-lg">
            <div data-index="${index}" class="question flex justify-between items-center gap-2 w-full px-4 py-2 cursor-pointer group border-transparent bg-white hover:bg-[#00B6D0] transition-all duration-500">
                <p class="question-text text-[#344B47] text-xs group-hover:text-white sm:text-base transition-all duration-500">
                    ${faq.question}
                </p>
                <i class="icon1 fa-solid fa-circle-plus text-[#00B6D0] group-hover:text-white text-xl transition-all duration-500"></i>
                <i class="icon2 hidden fa-solid fa-circle-minus text-[#9A338E] group-hover:text-white text-xl transition-all duration-500"></i>
            </div>
            <div class="answer hidden justify-between items-center w-full px-4 py-2">
                <p class="text-xs group-hover:text-white sm:text-base transition-all duration-500">
                    ${faq.answer}
                </p>
            </div>
        </div>
    `);

    questionDiv.innerHTML = html.join("");

    const questions = document.querySelectorAll(".question");
    questions.forEach(question => {
        question.addEventListener("click", toggleAnswer)
    });
    questions.forEach(question => {
        question.addEventListener("keyup", (e) => {
            if (e.key === "Enter") {
                toggleAnswer(e);
            }
        });
    });
}

async function initializeFaqs() {
    const selectCategory = document.querySelector("[name='select-category']");
    const removeFilter = document.querySelector("#remove-filter");
    const filterIndicator = document.querySelector("#filter-indicator");
    selectCategory.value = '';

    if (!removeFilter.classList.contains("hidden") && !filterIndicator.classList.contains("hidden")) {
        removeFilter.classList.add("hidden");
        filterIndicator.classList.add("hidden");
    };

    faqs = await fetchFaqs();

    selectCategory.addEventListener("change", async function() {
        faqs = await fetchFaqs();

        if (selectCategory.value) {
            removeFilter.classList.remove("hidden");
            filterIndicator.classList.remove("hidden");
            faqs =  faqs.filter(faq => faq.category === selectCategory.value);
            await displayFaqs();
        } else {
            removeFilter.classList.add("hidden");
            await displayFaqs();
        }
    });

    removeFilter.addEventListener("click", async function() {
        faqs = await fetchFaqs();
        await displayFaqs();
        removeFilter.classList.add("hidden");
        filterIndicator.classList.add("hidden");
        selectCategory.value = '';
    });

    await displayFaqs();
}

async function fetchDescriptors() {
    const response = await fetch("./data/bnDescriptors.json");
    const descriptors = await response.json();
    return descriptors;
}

async function fetchFaqs() {
    const response = await fetch("./data/faqs.json");
    const faqs = await response.json();
    return faqs;
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
            prevActiveTH.classList.remove("font-bold", "text-white", "cstm-txt-shadow");
            prevActiveTH.classList.add("bg-white");
        }
        activeTH.classList.add("font-bold", "text-white", "cstm-txt-shadow");
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
                cell.classList.add("font-semibold", "bg-[rgba(255,255,255,0.1)]", "cstm-txt-shadow");
            } else {
                cell.classList.remove("font-semibold", "bg-[rgba(255,255,255,0.1)]", "cstm-txt-shadow");
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

    const html = await filteredArr.map((item) =>
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

if (window.location.hash === "#about") {
    openPage('#about');
}

if (window.location.hash === "#resources") {
    openPage('#resources');
};

if (window.location.hash === "#faqs") {
    openPage('#faqs');
};

searchForm.addEventListener("input", handleInput);
inputElement.addEventListener("click", function() {this.select()})

window.addEventListener("submit", e => e.preventDefault());