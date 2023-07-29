const svg_id = '#global-warming-chart';
const svg_id_with_legend = 'legend';
const svg_id_with_legend_hash = '#legend';
const svg_width = 800;
const svg_height = 500;
const chart_title_pre_1778 = "Population estimates prior to 1778";
const chart_title_1796_1836 = "Recorded Population 1796 - 1836";
const chart_title_1850_1950 = "Hawaiian/U.S. Population Census Data 1850 - 1950";
const chart_title_1960_2020 = "U.S. Population Census Data 1960 - 2020";
const chart_title_full = "Full Recorded Population Data Timeline";
const energy_consumption_chart_title = "Energy Consumption in the World from Different Sources"
const co2_chart_title = "CO2 Emissions by Fuel/Industry"
var start_year;
var end_year;
var current_chart = 'energy_cons';

function clearChart(svg_id) {
    const svg = d3.select(svg_id);
    svg.selectAll("*").remove();
    if (document.getElementById(svg_id_with_legend) != null) {
        const elementToRemove = document.getElementById(svg_id_with_legend);
        elementToRemove.remove(); 
        const parentElement = document.querySelector(".flex-box-charts");
        const svg_new = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg_new.setAttribute("id","legend");
        svg_new.setAttribute("align-items", "flex-end");
        parentElement.appendChild(svg_new);
    }
}

function selectStartYear() {
    const selectedStartYear = document.getElementById("start-years").value;
    if (selectedStartYear) {
        start_year = selectedStartYear;
    }
}

function selectEndYear() {
    const selectedEndYear = document.getElementById("end-years").value;
    if (selectedEndYear) {
        end_year = selectedEndYear;
    }
}

function initChart(startYear, endYear, currentChart) {
    if (currentChart === 'energy_cons') {
        init_energy_cons(svg_width, svg_height, startYear, endYear, svg_id)
    } else if (currentChart === 'c02') {
        init_c02(svg_width, svg_height, startYear, endYear, svg_id)
    } else if (currentChart === '1850_1950') {
        init_1850_1950(svg_width, svg_height, startYear, endYear, svg_id_with_legend_hash)
    } else if (currentChart === '1960_2020') {
        init_1960_2020(svg_width, svg_height, startYear, endYear, svg_id)
    } else if (currentChart === 'full') {
        init_entire_timeline(svg_width, svg_height, startYear, endYear, svg_id)
    }
}

function loadH2Element(text) {
    const h2Element = document.getElementById("chart-text");
    if (h2Element) {
        h2Element.textContent = text;
    }
}

function loadPElement(text) {
    const pElement = document.getElementById("chart-paragraph");
    if (pElement) {
        pElement.textContent = text;
    }
}

function clearYears() {
    start_year = undefined;
    end_year = undefined;
}

function populateDropdownFull(dropDownId, data) {
    const dropdown = document.getElementById(dropDownId)
    dropdown.innerHTML = '<option value="">-- Select Year --</option>'

    const minValue = d3.min(data, d => +d.year);
    const maxValue = d3.max(data, d => +d.year);

    data.forEach(d => {
        if (d.year <= maxValue && d.year >= minValue) {
            const option = document.createElement("option");
            option.value = Number(d.year);
            option.textContent = d.year;
            dropdown.appendChild(option);
        }
    })
}

function populateDropdownFilterStart(dropDownId, data) {
    const dropdown = document.getElementById(dropDownId)
    dropdown.innerHTML = '<option value="">-- Select Year --</option>'

    const minValue = d3.min(data, d => +d.year);
    const maxValue = d3.max(data, d => +d.year);

    data.forEach(d => {
        if (d.year <= maxValue && d.year > minValue) {
            const option = document.createElement("option");
            option.value = Number(d.year);
            option.textContent = d.year;
            dropdown.appendChild(option);
        }
    })
}

function populateDropdownFilterEnd(dropDownId, data) {
    const dropdown = document.getElementById(dropDownId)
    dropdown.innerHTML = '<option value="">-- Select Year --</option>'

    const minValue = d3.min(data, d => +d.year);
    const maxValue = d3.max(data, d => +d.year);

    data.forEach(d => {
        if (d.year < maxValue && d.year >= minValue) {
            const option = document.createElement("option");
            option.value = Number(d.year);
            option.textContent = d.year;
            dropdown.appendChild(option);
        }
    })
}