async function init_temperature(svg_width, svg_height, start_year = 1850, end_year = 2020,region = 'World', svg_id = '#global-warming-chart') {
    const width = svg_width;
    const height = svg_height;
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const default_start_year = 1850;
    const default_end_year = 2020;
    const default_region = 'World';
    const default_region_dropdown_val = '<option value="'+region+'">'+region+'</option>';
    // Retrieve data
    const filePath = "././data/warming-fossil-fuels-land-use.csv"
    let raw_data = await d3.csv("././data/warming-fossil-fuels-land-use.csv")
    // Parse the data into appropriate types
    //data = data.filter(d => Number(d.year) >= start_year).filter(d => Number(d.year) <= end_year);
    columns = raw_data.columns;
    console.log('Region',region);
    data = raw_data.filter(d => d.entity==region).filter(d => Number(d.year) >= start_year).filter(d => Number(d.year) <= end_year);
    console.log("Data New",data);

    data.forEach(d => {
        d.year = Number(d.year);
        d.change_fossil_fuel = parseFloat(d.change_fossil_fuel).toFixed(4);
        d.change_agri_land_use = parseFloat(d.change_agri_land_use).toFixed(4);
    });
    console.log('Data: ', data, columns);

    var source = columns.slice(3).map(function (id) {
        return {
            id: id,
            values: data.map(function (d) {
                return { year: d.year, temp: Number(d[id]) };
            })
        };
    });

    console.log("Source", source);


    if (start_year !== default_start_year && end_year !== default_end_year) {
        console.log("Please reset chart!")
    } else if (end_year !== default_end_year) {
        populateDropdownFilterEndYear('start-years', data);
    } else if (start_year !== default_start_year) {
        populateDropdownFilterStartYear('end-years', data);
    } else {
        populateDropdownFullYear('start-years', data);
        populateDropdownFullYear('end-years', data);
    }

    populateRegion('regions',raw_data, default_region_dropdown_val);



    // Create the SVG element
    const svg = d3
        .select(svg_id)
        .append('g')
        .attr('width', width)
        .attr('height', height);

    const transitionPath = d3
        .transition()
        .duration(2500)
        .ease(d3.easeSin);

    // Create a scale for the x-axis
    const xScale = d3
        .scaleLinear()
        .domain([start_year, end_year])
        .range([0, chartWidth])

    // Create a scale for the y-axis
    var list = [];
    data.forEach( d => {
        list.push(Number(d.change_fossil_fuel));
        list.push(Number(d.change_agri_land_use));
    })
    const yScale = d3
    .scaleLinear()
    .domain(d3.extent(list))
    .range([chartHeight, 0]);

    // color palette
    var res = source.map(function (d) { return d.id }) // list of group names
    console.log(res);
    var color = d3.scaleOrdinal()
        .domain(res)
        .range(['#e41a1c', '#377eb8'])



    // Append the line path
    const path = svg.selectAll(".line")
        .data(source)
        .enter()
        .append('path')
        .attr("d", function (d) {
            return d3.line()
                .x(function (d) { return margin.left + xScale(Number(d.year)); })
                .y(function (d) { return margin.top + yScale(Number(d.temp)); })
                (d.values)

        })
        .attr('fill', 'none')
        .attr("stroke", function (d) { return color(d.id) })
        .attr('stroke-width', 2)
        ;

    /**const path_oil = svg.append('path')
        .datum(data)
        .attr('d', line_oil)
        .attr('fill', 'none')
        .attr('stroke', 'blue')
        .attr('stroke-width', 2);

    const pathLengthOil = path_oil.node().getTotalLength();
    
    path_oil
    .attr("stroke-dashoffset", pathLengthOil)
    .attr("stroke-dasharray", pathLengthOil)
    .transition(transitionPath)
    .attr("stroke-dashoffset", 0);

    const pathLength = path.node().getTotalLength();
    
    path
    .attr("stroke-dashoffset", pathLength)
    .attr("stroke-dasharray", pathLength)
    .transition(transitionPath)
    .attr("stroke-dashoffset", 0);**/

    /**svg.append('g')
        .selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
            .attr('cx', (d) => margin.left + xScale(d.year))
            .attr('cy', (d) => margin.top + yScale(d.population))
            .attr('r', 5)
            .style('fill', 'steelblue')
            .style('stroke', 'black')
            .on("mouseover", (d) => {
                // Show the tooltip on mouseover
                const tooltip = svg.append("g")
                .attr("class", "tooltip")
                .attr("transform", "translate(" + (xScale(d.year) + 10) + "," + (yScale(d.population) - 20) + ")");

                tooltip.append("text")
                    .attr("y", 15)
                    .text("Year: " + d.year);

                tooltip.append("text")
                    .attr("y", 30)
                    .text("Population: " + d.population);
            })
            .on("mouseout", (d,i) => {
                // Remove the tooltip on mouseout
                svg.select(".tooltip").remove();
            })
            **/

    // Append X-axis
    svg.append('g')
        .attr("transform", `translate(${margin.left}, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format('~d')))

    // Append Y-axis
    svg.append('g')
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .call(d3.axisLeft(yScale).tickFormat(d3.format(".4f")));

    // Append x-axis label
    svg.append("text")
        .attr("y", height)
        .attr("x", width / 2)
        .style("text-anchor", "middle")
        .style("fill", "black")
        .text("Year");

    // Append y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("x", -(height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("fill", "black")
        .text("Global Mean Surface Temperature Change (C)");

    var chartData = source.map(function (d) {
        return { name: d.id, color: color(d.id) };
    })
    console.log(chartData);

    //Initialize legend
    var legendItemSize = 12;
    var legendSpacing = 4;
    var xOffset = 10;
    var yOffset = 10;
    var legend = d3
        .select('#legend')
        .append('svg')
        .selectAll('.legendItem')
        .data(chartData);

    //Create legend items
    legend
        .enter()
        .append('rect')
        .attr('class', 'legendItem')
        .attr('width', legendItemSize)
        .attr('height', legendItemSize)
        .style('fill', d => d.color)
        .attr('transform',
            (d, i) => {
                var x = xOffset;
                var y = yOffset + (legendItemSize + legendSpacing) * i;
                return `translate(${x}, ${y})`;
            });

    //Create legend labels
    legend
        .enter()
        .append('text')
        .attr('x', xOffset + legendItemSize + 5)
        .attr('y', (d, i) => yOffset + (legendItemSize + legendSpacing) * i + 12)
        .text(d => d.name);

    /*const annotations = [{
        type: d3.annotationCalloutElbow,
        connector: { end: "arrow" },
        note: { 
            label: "resulted in 5,000–175,000 deaths, spread through contact with foreigners",
            title: "Oku‘u (pestilence)",
            wrap: 300
        },
        x: xScale(1804) + margin.left,
        y: yScale(210000) + margin.top,
        dx: 127,
        dy: -50,
    }].map(function(d){ d.color = "#E8336D"; return d})

      const makeAnnotations = d3.annotation()
        .annotations(annotations)

    svg.append("g")
    .attr("class", "annotation-group")
    .call(makeAnnotations)*/
}
