async function init_energy_cons(svg_width, svg_height, start_year = 1850, end_year = 2020, svg_id = '#global-warming-chart') {
    const width = svg_width;
    const height = svg_height;
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const default_start_year = 1850;
    const default_end_year = 2020;
    // Retrieve data
    const filePath = "././data/global-energy-substitution.csv"
    let data = await d3.csv("././data/global-energy-substitution.csv")
    // Parse the data into appropriate types
    columns = data.columns;
    data = data.filter(d => Number(d.year) >= start_year).filter(d => Number(d.year) <= end_year);

    data.forEach(d => {
        d.year = Number(d.year);
    });

    var source = columns.slice(3).map(function (id) {
        return {
            id: id,
            values: data.map(function (d) {
                return { year: d.year, energy: d[id] };
            })
        };
    });


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
    const yScale = d3
        .scaleLinear()
        .domain([0, 60000])
        .range([chartHeight, 0]);

    // color palette
    var res = ["coal", "gas", "oil", "biofuels", "solar", "wind", "hydropower", "nuclear", "traditional biomass", "other renewable"];
    var color = d3.scaleOrdinal()
        .domain(res)
        .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#74FF33', '#ffff33', '#a65628', '#f781bf', '#999999', '#000fff'])



    // Append the line path
    const path = svg.selectAll(".line")
        .data(source)
        .enter()
        .append('path')
        .attr("d", function (d, i) {
            return d3.line()
                .x(function (d) { return margin.left + xScale(d.year); })
                .y(function (d) { return margin.top + yScale(d.energy); })
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


    // Append X-axis
    svg.append('g')
        .attr("transform", `translate(${margin.left}, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format('~d')))

    // Append Y-axis
    svg.append('g')
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .call(d3.axisLeft(yScale).tickFormat(d3.format('~s')))

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
        .text("Energy Consumption in TWh");

    var chartData = source.map(function (d) {
        return { name: d.id, color: color(d.id) };
    });

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

    const annotations = [{
        type: d3.annotationCalloutCircle,
        connector: { end: "arrow" },
        note: { 
            label: "In recent years the amount of fossil fuels being burned for generating energy has gone up compared to other sources",
            title: "Fossil Fuel Usage",
            wrap: 300
        },
        subject: {
            radius: 80,         // circle radius
            radiusPadding: 10   // white space around circle befor connector
          },
        x: xScale(2005) + margin.left,
        y: yScale(40000) + margin.top,
        dx: -127,
        dy: -50,
    },{
        type: d3.annotationCalloutCircle,
        connector: { end: "arrow" },
        note: { 
            label: "Rise in energy demands due to second indutrial revolution",
            title: "Industrial Revolution",
            wrap: 300
        },
        subject: {
            radius: 40,         // circle radius
            radiusPadding: 10   // white space around circle befor connector
          },
        x: xScale(1910) + margin.left,
        y: yScale(5000) + margin.top,
        dx: 20,
        dy: -80,
    }].map(function(d){ d.color = "#FF4500"; return d})

      const makeAnnotations = d3.annotation()
        .annotations(annotations)

    svg.append("g")
    .attr("class", "annotation-group")
    .call(makeAnnotations)

}
