async function init_co2(svg_width, svg_height, start_year = 1850, end_year = 2020,region='World', svg_id = '#global-warming-chart') {
    const width = svg_width;
    const height = svg_height;
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const default_start_year = 1850;
    const default_end_year = 2020;
    const default_region = 'World';
    const default_region_dropdown_val = '<option value="' + region + '">' + region + '</option>';
    // Retrieve data
    //const filePath = "././data/co2-emissions-by-fuel-line.csv"
    let raw_data = await d3.csv("././data/co2-emissions-by-fuel-line.csv")
    // Parse the data into appropriate types
    columns = raw_data.columns;
    data = raw_data.filter(d => d.entity == region).filter(d => Number(d.year) >= start_year).filter(d => Number(d.year) <= end_year);

    data.forEach(d => {
        d.year = Number(d.year);
        d.coal = Number(d.coal)/1000000000;
        d.oil = Number(d.oil)/1000000000;
        d.gas = Number(d.gas)/1000000000;
        d.cement = Number(d.cement)/1000000000;
        d.flaring = Number(d.flaring)/1000000000;
        d.others = Number(d.others)/1000000000;
    });

    var source = columns.slice(3).map(function (id) {
        return {
            id: id,
            values: data.map(function (d) {
                return { year: d.year, co2: Number(d[id]) };
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
        var list = [];
        data.forEach(d => {
            list.push(Number(d.coal));
            list.push(Number(d.oil));
            list.push(Number(d.gas));
            list.push(Number(d.cement));
            list.push(Number(d.flaring));
            list.push(Number(d.others));
        })
    console.log(list);
    const yScale = d3
    .scaleLinear()
    .domain(d3.extent(list))
    .range([chartHeight, 0]);

    // color palette

    var res = ["coal","gas","oil","cement","flaring","others"];
    var color = d3.scaleOrdinal()
            .domain(res)
            .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#f781bf', '#ffff33'])

    // Append the line path
    const path = svg.selectAll(".line")
        .data(source)
        .enter()
        .append('path')
        .attr("d", function (d) {
            return d3.line()
                .x(function (d) { return margin.left + xScale(Number(d.year)); })
                .y(function (d) { return margin.top + yScale(Number(d.co2)); })
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
        .call(d3.axisLeft(yScale).tickFormat(d3.format(".2f")));

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
        .text("CO2 emissions (Billion Tonnes)");

    var chartData = source.map(function (d) {
        return { name: d.id, color: color(d.id) };
    })

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
            label: "Fossil fuels being used for energy generation has led to unprecendeted levels of CO2 emissions which is one of the main greenhouse gases",
            title: "Fossil Fuels Producing Highest CO2 Emissions",
            wrap: 400
        },
        subject: {
            radius: 50,         // circle radius
            radiusPadding: 0   // white space around circle befor connector
          },
        x: xScale(2010) + margin.left,
        y: yScale(12) + margin.top,
        dx: -127,
        dy: -5,
    },{
        type: d3.annotationXYThreshold,
        note: {
            title: "Kyoto Protocol",
            label: "In 1997, first agreement between nations to mandate the reduction of greenhouse gases was taken - to reduce emissions by 5% by 2008-12",
            wrap: 250
          },
        subject: {
            y1: yScale(0) + margin.top,
            y2: yScale(20) + margin.top,
        },
        x: xScale(1997) + margin.left,
        y: yScale(6) + margin.top,
        dy: -15,
        dx: -170,
    }].map(function(d){ d.color = "#FF4500"; return d})

      const makeAnnotations = d3.annotation()
        .annotations(annotations)

    svg.append("g")
    .attr("class", "annotation-group")
    .call(makeAnnotations)
}
