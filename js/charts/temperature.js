async function init_temperature(svg_width, svg_height, start_year = 1850, end_year = 2020, region = 'World', svg_id = '#global-warming-chart') {
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
    const filePath = "././data/warming-fossil-fuels-land-use.csv"
    let raw_data = await d3.csv("././data/warming-fossil-fuels-land-use.csv")
    // Parse the data into appropriate types
    //data = data.filter(d => Number(d.year) >= start_year).filter(d => Number(d.year) <= end_year);
    columns = raw_data.columns;
   
    data = raw_data.filter(d => d.entity == region).filter(d => Number(d.year) >= start_year).filter(d => Number(d.year) <= end_year);

    data.forEach(d => {
        d.year = Number(d.year);
        d.change_by_fossil_fuel = parseFloat(d.change_by_fossil_fuel).toFixed(4);
        d.change_by_agriculture_land_use = parseFloat(d.change_by_agriculture_land_use).toFixed(4);
    });

    var source = columns.slice(3).map(function (id) {
        return {
            id: id,
            values: data.map(function (d) {
                return { year: d.year, temp: Number(d[id]) };
            })
        };
    });



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

    populateRegion('regions', raw_data, default_region_dropdown_val);



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
        list.push(Number(d.change_by_fossil_fuel));
        list.push(Number(d.change_by_agriculture_land_use));
    })
    const yScale = d3
        .scaleLinear()
        .domain(d3.extent(list))
        .range([chartHeight, 0]);

    // color palette
    var res = source.map(function (d) { return d.id }) // list of group names
    var color = d3.scaleOrdinal()
        .domain(res)
        .range(['#e41a1c', '#377eb8'])

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
        .text("Global Mean Surface Temperature Change (°C)");

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
        .text(d => d.name.replaceAll("_"," "));

    const annotations = [{
        type: d3.annotationXYThreshold,
        note: {
            title: "1°C Breach",
            label: "The world has recently breached the 1°C temperature rise and if this continues we will soon breach the 1.5°C mark and the impact on the world would be highly irreversible as per the Paris Conference",
            wrap: 250
          },
        subject: {
            x1: xScale(1850) + margin.left,
            x2: xScale(2020) + margin.left,
        },
        x: xScale(1880) + margin.left,
        y: yScale(1) + margin.top,
        dy: 100,
        dx: 162,
    },].map(function (d) { d.color = "#FF4500"; return d })

    const makeAnnotations = d3.annotation()
        .annotations(annotations);

    svg.append("g")
        .attr("class", "annotation-group")
        .call(makeAnnotations);

    var line = d3.line()
        .x(function (d) {
            return margin.left + xScale(Number(d.year));
        })
        .y(function (d) {
            return margin.top + yScale(Number(d.temp));
        });

    var sourceData = svg.selectAll(".sourceData")
        .data(source)
        .enter().append("g")
        .attr("class", "sourceData");

    sourceData.append("path")
        .attr("class", "line")
        .attr("d", function (d) {
            return line(d.values);
        })
        .style("stroke", function (d) {
            return color(d.id);
        })
        .attr('stroke-width', 2)
        .attr('fill', 'none');

    var mouseG = svg.append("g")
        .attr("class", "mouse-over-effects");

    mouseG.append("path") // this is the black vertical line to follow mouse
        .attr("class", "mouse-line")
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .style("opasourceData", "0");

    var lines = document.getElementsByClassName('lines');

    var mousePerLine = mouseG.selectAll('.mouse-per-line')
        .data(source)
        .enter()
        .append("g")
        .attr("class", "mouse-per-line");

    mousePerLine.append("circle")
        .attr("r", 7)
        .style("stroke", function (d) {
            return color(d.id);
        })
        .style("fill", "none")
        .style("stroke-width", "1px")
        .style("opasourceData", "0");

    mousePerLine.append("text")
        .attr("class","text-1");
        

    mousePerLine.append("text")
        .attr("class","text-2");

    mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
        .attr('width', width) // can't catch mouse events on a g element
        .attr('height', height)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('mouseout', function () { // on mouse out hide line, circles and text
            d3.select(".mouse-line")
                .style("opasourceData", "0");
            d3.selectAll(".mouse-per-line circle")
                .style("opasourceData", "0");
            d3.selectAll(".mouse-per-line text")
                .style("opasourceData", "0");
        })
        .on('mouseover', function () { // on mouse in show line, circles and text
            d3.select(".mouse-line")
                .style("opasourceData", "1");
            d3.selectAll(".mouse-per-line circle")
                .style("opasourceData", "1");
            d3.selectAll(".mouse-per-line text")
                .style("opasourceData", "1");
        })
        .on('mousemove', function () { // mouse moving over canvas
            var mouse = d3.mouse(this);

            d3.selectAll(".mouse-per-line")
                .attr("transform", function (d, i) {

                    var xDate = xScale.invert(mouse[0] - margin.left),
                        bisect = d3.bisector(function (d) { return d.year; }).left;
                    
                    idx = bisect(d.values, xDate);
                    xyear = xScale.invert(xScale(d.values[idx].year)).toFixed(0);
                    translatex = 10;
                    translatey = 3;
                    //position tooltip based on which part of chart the mouse is on
                    if(xyear > (default_end_year-(default_end_year-default_start_year)/2)){
                        translatex = -translatex-margin.left-margin.right;
                    }

                    d3.select(this).select('.text-1')
                        .attr("transform", "translate("+translatex+","+translatey+")")
                        .text(function(d) {
                            return "Temp: "+yScale.invert(yScale(d.values[idx].temp)).toFixed(4);
                        });

                   d3.select(this).select('.text-2')
                        .attr("transform", "translate("+translatex+","+(translatey+20)+")")
                        .text("Date:" + xScale.invert(xScale(d.values[idx].year)).toFixed(0));


                    d3.select(".mouse-line")
                        .attr("d", function () {
                            var data = "M" + (margin.left + xScale(d.values[idx].year)) + "," + (height - margin.top);
                            data += " " + (margin.left + xScale(d.values[idx].year)) + "," + 0;
                            return data;
                        });
                    return "translate(" + (margin.left + xScale(d.values[idx].year)) + "," + (margin.top + yScale(d.values[idx].temp)) + ")";
                });
        });
}
