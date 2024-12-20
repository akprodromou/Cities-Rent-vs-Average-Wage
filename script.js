const containerWidth = 950;
const containerHeight = 1000; 

// Set dimensions and margins
const margin = { top: 150, right: 40, bottom: 60, left: 150 };
const width = containerWidth - margin.left - margin.right;
const height = containerHeight - margin.top - margin.bottom;

// Lollipop chart 

// Parse the Data
d3.csv("https://raw.githubusercontent.com/akprodromou/Cities-Rent-vs-Average-Wage/refs/heads/main/cities_data_wide.csv")
  .then(function (data) {

    // Parse data
    const chartData = data.map(d => ({
      monthly_income: parseFloat(d.monthly_income),
      rent: parseFloat(d.rent),
      city: d.city 
    }));

    // Append the SVG object to the #dataviz_lollipop element
    const svg_lollipop = d3.select("#dataviz_lollipop")
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const y = d3.scaleBand()
      .range([0, height - margin.bottom / 2]) 
      .domain(chartData.map(d => d.city))
      .padding(0.1);

    const x = d3.scaleLinear()
      .range([0, width]) 
      .domain([0, d3.max(chartData, d => Math.ceil((Math.max(d.rent, d.monthly_income) / 1000)) * 1000)]);

    // Add left y-axis
    svg_lollipop.append('g')
      .attr("class", "y-axis")
      .call(d3.axisLeft(y)
        .tickSizeInner(0)
        .tickSizeOuter(0)
        // Set the axis distance from the grid
        .tickPadding(105)
      );

    // Add top x-axis
    svg_lollipop.append('g')
    .attr("class", "x-axis")
      .attr('transform', `translate(0,${0})`) 
      .call(d3.axisTop(x)
      .tickSizeInner(0)
      .tickSizeOuter(0)
      .tickPadding(5)
      .tickFormat(d => `€${d}`)
    );

    // Add horizontal gridlines (aligned with y-axis)
    svg_lollipop.append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(y)
      .tickSize(-width) // Extend the gridlines across the width
      .tickFormat("") // Remove tick labels
      );
      
    // Add vertical gridlines (aligned with x-axis)
    svg_lollipop.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${10})`) 
      .call(d3.axisTop(x) 
        .tickSize(-(height - margin.bottom / 2) + 20)
        .tickFormat("") 
      );

    // Add lollipops for monthly income
    svg_lollipop.selectAll('.income-lollipop')
      .data(chartData)
      .enter().append('line')
      .attr('class', 'income-lollipop')
      .attr('x1', d => x(d.rent))
      .attr('x2', d => x(d.monthly_income))
      .attr('y1', d => y(d.city) + y.bandwidth() / 2)
      .attr('y2', d => y(d.city) + y.bandwidth() / 2)
      .attr('stroke', '#666670');

    // Add circles for rent
    svg_lollipop.selectAll('.rent-circle')
      .data(chartData)
      .enter().append('circle')
      .attr('class', 'rent-circle')
      .attr('cx', d => x(d.rent))
      .attr('cy', d => y(d.city) + y.bandwidth() / 2)
      .attr('r', 7)
      .attr('fill', '#E62923');

    // Add circles for monthly income
    svg_lollipop.selectAll('.income-circle')
      .data(chartData)
      .enter().append('circle')
      .attr('class', 'income-circle')
      .attr('cx', d => x(d.monthly_income))
      .attr('cy', d => y(d.city) + y.bandwidth() / 2)
      .attr('r', 7)
      .attr('fill', '#222A71');
      
    // Add title
    const lollipop_main_title = svg_lollipop.append("text")
      .attr("class", "lollipop-title")
      .attr("text-anchor", "start")
      .attr("x", -105)
      .attr("y", -75)
      .append("tspan")
      .text("Average wage ")
      .style("fill", "#222A71");
  
    lollipop_main_title
      .append("tspan")
      .text("relative to ")
      .style("fill", "black");

    lollipop_main_title
      .append("tspan")
      .text("rent")
      .style("fill", "#E62923");

    lollipop_main_title
      .append("tspan")
      .attr("class", "lollipop-subtitle")
      .attr("x", -104) // Align with the title
      .attr("dy", "1.2em") // Relative vertical spacing
      .text("Selected European cities, 2023")
      .style("fill", "black");

    // Add footnote
    svg_lollipop.append("text")
      .attr("x", 0) 
      .attr("y", height - 15) 
      .attr("class", "referenceText")
      .attr("text-anchor", "start")
      .selectAll("tspan")
      .data([
        { text: "* Eurostat, Mean equivalised net income per country (whole population), 2023", url: "https://ec.europa.eu/eurostat/databrowser/view/ilc_di03__custom_14767290/default/table?lang=en" },
        { text: "Eurostat, Average rent per month in cities, one-bedroom flats (EU officials and pensioners), 2023", url: "https://ec.europa.eu/eurostat/databrowser/view/prc_colc_rents/default/table?lang=en" }
      ])
      .enter()
      .append("a") // Append an <a> element
      .attr("xlink:href", d => d.url) // Set the URL
      .attr("target", "_blank") // Open the link in a new tab
      .append("tspan")
      .attr("x", (d, i) => -105 + i * 10)
      .attr("dy", "1.4em") 
      .text(d => d.text);
  
    // Add tooltip
    const tooltip = d3.select("#dataviz_lollipop")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    function showTooltip(event, d) {
      tooltip
        .transition()
        .duration(200)
        .style("opacity", 1);
    
      tooltip.html(`
        <div><b>${d.city}</b></div>
        <div>Average Rent: €${d.rent.toFixed()}</div>
        <div>Average Wage: €${d.monthly_income.toFixed()}</div>
      `)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY + 10) + "px");
    }

    function hideTooltip() {
      tooltip
        .transition()
        .duration(500)
        .style("opacity", 0);
    }

    // Add event listeners
    svg_lollipop.selectAll('.income-circle, .rent-circle')
    .on("mouseover", function(event, d) { showTooltip(event, d); })
    .on("mouseout", hideTooltip);
  }
);


// Map chart

d3.csv("https://raw.githubusercontent.com/akprodromou/Cities-Rent-vs-Average-Wage/main/cities_lat_long.csv")
  .then(function (data) {
    // Process the data
    const cities = data
      .filter(d => d.variable === "rent" || d.variable === "monthly_income") // Include both rent and monthly_income
      .map(d => ({
        city: d.city,
        coords: [parseFloat(d.long), parseFloat(d.lat)], // Use the lat and long columns
        rent: d.variable === "rent" ? +d.value : null, // Only set rent value for rent variable
        income: d.variable === "monthly_income" ? +d.value : null, // Only set income value for monthly_income variable
      }));

    // Create an array of cities with both rent and monthly income, and calculate the ratio
    const citiesWithRatio = cities.reduce((acc, d) => {
      const existingCity = acc.find(city => city.city === d.city);
      if (existingCity) {
        // Update existing city data with rent and income
        if (d.rent !== null) existingCity.rent = d.rent;
        if (d.income !== null) existingCity.income = d.income;

        // Calculate the ratio if both rent and income are available
        if (existingCity.rent && existingCity.income) {
          existingCity.ratio = existingCity.rent / existingCity.income;
        }
      } else {
        // Add new city data
        acc.push(d);
      }
      return acc;
    }, []);

    // Get the min and max ratio values
    const ratios = citiesWithRatio.map(d => d.ratio).filter(d => d != null); // Filter out null ratios
    const minRatio = Math.min(...ratios);
    const maxRatio = Math.max(...ratios);

    // Select the SVG element for the map
    const svg_map = d3.select("#map");

    // Define width and height
    const mapWidth = +svg_map.attr("width");
    const mapHeight = +svg_map.attr("height");

    // Define a projection (e.g., Mercator)
    const projection = d3.geoMercator()
      .center([10, 51]) // Longitude and latitude to center on
      .scale(790) // Zoom scale
      .translate([mapWidth / 2, mapHeight / 2]); // Center the map in the SVG

    // Define a path generator
    const path = d3.geoPath().projection(projection);

    // Create a tooltip
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("opacity", 0);

    // Load GeoJSON data
    d3.json("https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson")
      .then(function (geojson) {
        // Draw the map
        svg_map.selectAll("path")
          .data(geojson.features)
          .enter().append("path")
          .attr("d", path)
          .attr("fill", "#E0DED8")
          .attr("stroke", "white")
          .attr("stroke-width", 1);

        // Create a color scale based on the ratio using the calculated min and max
        const colorScale = d3.scaleSequential(d3.interpolateViridis)
          .domain([minRatio, maxRatio]);  // Use the dynamic min and max ratio values

        // Add city points to the map
        svg_map.selectAll("circle")
          .data(citiesWithRatio)
          .enter()
          .append("circle")
          .attr("cx", d => {
            const [x, y] = projection(d.coords);
            return x;
          })
          .attr("cy", d => {
            const [x, y] = projection(d.coords);
            return y;
          })
          .attr("r", 7) // Radius of the circle
          .attr("fill", d => d.ratio ? colorScale(d.ratio) : "gray") // Use ratio to set the fill color
          .attr("stroke", "none")
          .attr("stroke-width", 0.5)
          .on("mouseover", (event, d) => {
            // Show tooltip or highlight on hover
            d3.select(event.target).attr("r", 10); // Enlarge circle on hover
            tooltip.transition().duration(200).ease(d3.easeCubicInOut).style("opacity", 1);
            tooltip.html(`<strong>${d.city}</strong><br>Average Rent: €${d.rent.toFixed()}<br>Average Wage: €${d.income.toFixed()}<br>Ratio: ${d.ratio.toFixed(2)}`)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY + 10) + "px");
          })
          .on("mouseout", (event) => {
            // Reset circle size and hide tooltip
            d3.select(event.target).attr("r", 7);
            tooltip.transition().duration(500).style("opacity", 0);
          });

        // Add the color legend
        const legendWidth = 150;
        const legendHeight = 15;

        // Create a linear color scale for the legend
        const legendColorScale = d3.scaleSequential(d3.interpolateViridis)
          .domain([minRatio, maxRatio]); // Same as the color scale for circles

        // Create a gradient for the legend
        const legend = svg_map.append("g")
        .attr("transform", `translate(${37.5}, ${100}) rotate(90)`);

        legend.append("defs").append("linearGradient")
          .attr("id", "legend-gradient")
          .attr("x1", "0%")
          .attr("x2", "100%")
          .attr("y1", "0%")
          .attr("y2", "0%")
          .selectAll("stop")
          .data(legendColorScale.ticks(10).map(function(t, i, n) { 
            return { offset: `${(100 * i) / (n.length - 1)}%`, color: legendColorScale(t) }; 
          }))
          .enter().append("stop")
          .attr("offset", d => d.offset)
          .attr("stop-color", d => d.color);

        // Append a rectangle to represent the legend
        legend.append("rect")
          .attr("width", legendWidth)
          .attr("height", legendHeight)
          .style("fill", "url(#legend-gradient)");

        // Add text labels for the legend
        legend.selectAll("text")
          .data(["Most affordable", "Less affordable"])
          .enter().append("text")
          .attr("class", "legend")
          .attr("transform", `rotate(-90) translate(-${legendHeight / 2}, ${11})`)
          .attr("x", 15) // Position the text at the left edge of the rotated element
          .attr("y", (d, i) => i === 0 ? 0 : legendWidth * 0.835)
          .append("tspan")
          .text(d => d.split(" ")[0])
          .append("tspan")
          .attr("x", 15)
          .attr("dy", "1em")
          .text(d => d.split(" ")[1]);

        // // Add title and subtitle
        const title = svg_map.append("text")
          .attr("class", "lollipop-title")
          .attr("text-anchor", "start")
          .attr("x", 20)
          .attr("y", 55); // Base position for the title

        title.append("tspan")
          .text("European cities by affordability")
          .style("fill", "#222A71");

        // Add subtitle as a separate <tspan>
        title.append("tspan")
          .attr("class", "lollipop-subtitle")
          .attr("x", 20) // Align with the title
          .attr("dy", "1.2em") // Relative vertical spacing
          .text("Average wage relative to rent, 2023");
        
        // Add footnote
        svg_map.append("text")
          .attr("x", 20) 
          .attr("y", height - 40) 
          .attr("class", "referenceText")
          .attr("text-anchor", "start")
          .selectAll("tspan")
          .data([
            { text: "* Eurostat, Mean equivalised net income per country (whole population), 2023", url: "https://ec.europa.eu/eurostat/databrowser/view/ilc_di03__custom_14767290/default/table?lang=en" },
            { text: "Eurostat, Average rent per month in cities, one-bedroom flats (EU officials and pensioners), 2023", url: "https://ec.europa.eu/eurostat/databrowser/view/prc_colc_rents/default/table?lang=en" }
          ])
          .enter()
          .append("a") 
          .attr("xlink:href", d => d.url) // Set the URL
          .attr("target", "_blank") // Open the link in a new tab
          .append("tspan")
          .attr("x", (d, i) => 15 + i * 10)
          .attr("dy", "1.4em") 
          .text(d => d.text);
        })
      .catch(error => {
        console.error("Error loading GeoJSON data:", error);
      });
  });


// Create individual line charts for each city over time

d3.csv("https://raw.githubusercontent.com/akprodromou/Cities-Rent-vs-Average-Wage/refs/heads/main/cities_data_long.csv", d => ({
  city: d.city,
  time_period: parseInt(d.time_period), // Ensure value is an integer
  variable: d.variable, // Either "rent" or "monthly_income"
  value: parseFloat(d.value) // Ensure value is a float
})).then(data => {
  // Reshape data to wide format
  const reshapedData = Array.from(d3.group(data, d => d.city), ([city, cityData]) => {
    const timeData = cityData.reduce((acc, d) => {
      if (!acc[d.time_period]) {
        acc[d.time_period] = { time_period: d.time_period };
      }
      acc[d.time_period][d.variable] = d.value;
      return acc;
    }, {});
    return { city, data: Object.values(timeData) };
  });

  // Sort data by city name in alphabetical order
  reshapedData.sort((a, b) => a.city.localeCompare(b.city));

  const cell_width = 150;
  const cell_height = 150;
  const padding = 20;
  const margin = { top: 50, right: 50, bottom: 50, left: 60 };

  const svg_title = d3.select("#dataviz_facet_title")
  .append("svg")
  .attr("width", 1035) 
  .attr("height", 95); 

  // Add title
  const facet_main_title = svg_title.append("text")
    .attr("class", "lollipop-title")
    .attr("text-anchor", "start")
    .attr("x", 0) 
    .attr("y", 50) 
    .html(`<tspan style="fill:#222A71;">Average wage </tspan>
          <tspan style="fill:black;">relative to </tspan>
          <tspan style="fill:#E62923;">rent</tspan>`);

  // Add subtitle as a separate <tspan>
  facet_main_title.append("tspan")
    .attr("class", "lollipop-subtitle")
    .attr("x", 1) // Align with the title
    .attr("dy", "1.2em") // Relative vertical spacing
    .text("Selected European cities, 2023");

  // Set up SVG for each city
  const svg_facet = d3.select("#dataviz_facet")
    .selectAll("uniqueChart")
    .data(reshapedData)
    .enter()
    .append("svg")
    .attr("transform", "translate(0,0)")
    .attr("width", cell_width + margin.left + margin.right)
    .attr("height", cell_height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)

  // Add X axis (time_period)
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.time_period))
    .range([0, cell_width]);

  svg_facet.append("g")
    .attr("transform", `translate(0, ${cell_height})`)
    .call(d3.axisBottom(x).ticks(3).tickFormat(d3.format("d")));

  // Add Y axis and draw lines
  svg_facet.each(function(cityData) {
    const y = d3.scaleLinear()
      .domain([
        0,
        d3.max(cityData.data, d => Math.max(d.rent || 0, d.monthly_income || 0))
      ])
      .range([cell_height, 0]);
  
    d3.select(this)
      .append("g")
      .call(
        d3.axisLeft(y)
          .ticks(5) 
          .tickFormat(d => `€${d}`) // Add the € symbol 
      );

    // Add a background rectangle
    d3.select(this)
      .append("rect")
      .attr("x", -margin.left - padding) // Set x to 0 to align with the chart area
      .attr("y", -margin.bottom - padding) // Set y to 0 to align with the top of the chart
      .attr("width", cell_width + (margin.right + margin.left + padding )) // Set width to match the chart width
      .attr("height", cell_height + (margin.bottom + margin.top + padding * 2)) // Set height to match the chart height
      .attr("fill", "lightgray") // Set your desired background color
      .attr("opacity", 0.2); // Add some transparency (optional)

    // Add city title
    d3.select(this)
      .append("text")
      .attr("class", "facet-titles")
      .attr("text-anchor", "start")
      .attr("y", -20)
      .attr("x", -37.5)
      .text(cityData.city);
    
    // Draw rent line
    d3.select(this)
      .append("path")
      .datum(cityData.data)
      .attr("fill", "none")
      .attr("stroke", "#E62923")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(d => x(d.time_period))
        .y(d => y(d.rent))
      );

    // Draw monthly income line
    d3.select(this)
      .append("path")
      .datum(cityData.data)
      .attr("fill", "none")
      .attr("stroke", "#222A71")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(d => x(d.time_period))
        .y(d => y(d.monthly_income))
      );
  });
  
      // Add X-axis label
      svg_facet.append("text")
      .attr("class", "axis-label-facet")
      .attr("x", cell_width / 2) // Center along the X-axis
      .attr("y", cell_height + margin.bottom - 15) 
      .attr("text-anchor", "middle") // Center alignment
      .text("Year");
});