const svg_id = '#global-warming-chart';
const svg_id_with_legend = 'legend';
const svg_id_with_legend_hash = '#legend';
const svg_width = 800;
const svg_height = 500;
const energy_consumption_chart_title = "Energy Consumption in the World from Different Sources"
const co2_chart_title = "CO2 Emissions by Fuel/Industry"
const temperature_chart_title = "Global Warming Contributions from fossil fuels and land use"
var start_year;
var end_year;
var region;
var current_chart = 'energy_cons';

function clearChart(svg_id) {
    const svg = d3.select(svg_id);
    svg.selectAll("*").remove();
    if (document.getElementById(svg_id_with_legend) != null) {
        const elementToRemove = document.getElementById(svg_id_with_legend);
        elementToRemove.remove(); 
    }
        const parentElement = document.querySelector(".flex-box-charts");
        const svg_new = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg_new.setAttribute("id","legend");
        svg_new.setAttribute("width","200");
        svg_new.setAttribute("height","200");
        svg_new.setAttribute("style","align-self: flex-end;" );
        parentElement.appendChild(svg_new);
    
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

function selectRegion() {
    const selectedRegion = document.getElementById("regions").value;
    if (selectedRegion) {
        region = selectedRegion;
    }
}

function initChart(startYear, endYear,region, currentChart) {
    if (currentChart === 'energy_cons') {
        init_energy_cons(svg_width, svg_height, startYear, endYear, svg_id)
    } else if (currentChart === 'co2') {
        init_co2(svg_width, svg_height, startYear, endYear,region, svg_id)
    } else if (currentChart === 'temperature') {
        init_temperature(svg_width, svg_height, startYear, endYear, region, svg_id)
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

function clearYearsAndRegion() {
    start_year = undefined;
    end_year = undefined;
    region = undefined;
}

function populateDropdownFullYear(dropDownId, data) {
    const dropdown = document.getElementById(dropDownId)
    dropdown.innerHTML = '<option value="">-- Select Year --</option>';

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

function populateDropdownFilterStartYear(dropDownId, data) {
    const dropdown = document.getElementById(dropDownId)
    dropdown.innerHTML = '<option value="">-- Select Year --</option>';

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

function populateDropdownFilterEndYear(dropDownId, data) {
    const dropdown = document.getElementById(dropDownId)
    dropdown.innerHTML = '<option value="">-- Select Year --</option>';

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

function populateRegion(dropDownId, data, initial_val) {
    const dropdown = document.getElementById(dropDownId)
    dropdown.innerHTML = !initial_val ? '<option value="">-- Select Region --</option>' : initial_val;

    const uniq_vals = new Set();
    
    data.forEach( d => {
        uniq_vals.add(d.entity);
    })

    uniq_vals.forEach( d => {
        const option = document.createElement("option");
        option.value = d;
        option.textContent = d;
        dropdown.appendChild(option);
    })
}