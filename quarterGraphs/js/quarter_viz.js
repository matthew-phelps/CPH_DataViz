// HEIGHT & WIDTH OF SVG
var margin = { top: 40, right: 20, bottom: 50, left: 50 },
	     width = 960 - margin.left - margin.right,
	     height = 640 - margin.top - margin.bottom;


	 
var viz = d3.select('body')
	.append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
			.attr('id', 'viz')
	    	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// TITLE
var titleText = viz.append('text')
	.text("Cholera Cases by neighborhood")
	.attr('x', width/2)
	.attr('y', -10)
	.attr('class', 'title')


// SCALES ///
var yScale = d3.scale.linear()
	.range([height, 10]);

var xScale = d3.time.scale()
	.range([0, width])

var colorScale = d3.scale.category20();

// PARSE DATE
var parseTime = d3.time.format("%Y-%m-%d").parse;
var	prettyTime = d3.time.format("%d %b");

// AXIS //
var xAxis = d3.svg.axis().scale(xScale)
	.orient('bottom')
	.ticks(10);

var yAxis = d3.svg.axis().scale(yScale)
	.orient('left')
	.ticks(5);

// LINE FUNCTIONS //
var lineGen = d3.svg.line()
	.x(function(d) {return xScale(d.startDate); })
	.y(function(d) {return yScale(d.sick_total_week); });

// LOAD DATA ///////////
d3.csv('data/quarter_eng.csv', function(error, data) {
	data.forEach(function(d){
		d.startDate = parseTime(d.startDate);
		d.sick_total_week = +d.sick_total_week;
	});

	// SCALE DOMAIN OF DATA TO RANGE //
	xScale.domain(d3.extent(data, function(d) { return d.startDate;} ));
	yScale.domain([0, d3.max(data, function(d) { return d.sick_total_week;} )]);

	
	// NEST DATA
	var dataNest = d3.nest()
		.key(function(d) { return d.quarter;} )
		.entries(data);

	var legendSpace = height / dataNest.length; // space for legend

	dataNest.forEach(function(d, i) {
		viz.append('path')
			.attr('class', 'line')
			.style('stroke', function() { // add color dynamically
				return colorScale(d.key); })
			.attr('id', 'tag'+d.key.replace(/\s+/g, '')) //Assign ID for interactivity
			.attr('d', lineGen(d.values))


		// ADD LEGEND
		var legend = viz.selectAll('g')
			.data(d)
			.enter()
		.append('g')
			.attr('class', 'legend')
			.attr('transform', 'translate(' + (width - 200) + ',' + 0 + ')');

		legend.append('circle')
			.attr('x', 0)
			.attr('y', (i * legendSpace / 1.8))
			.attr('r', 5)
			.style('fill', function() {
				return  colorScale(d.key)
			})
			.on('click', function(){
				// Determine if line is currently visible
				var active = d.active ? false : true,
				newOpacity = active ? 0: 1;
				//Hide or show elements based on ID
				d3.select("#tag"+d.key.replace(/\s+/g, ''))
					.transition().duration(150)
					.style('opacity', newOpacity)
				//Update whether or not the elements are active
				d.active = active;
			});

		legend.append('text')
		.attr('x', 10)
		.attr('y', i * legendSpace/1.8)
			.style('fill', function() {
				return d.colorScale = colorScale(d.key);
			})

			.text(d.key)

		
		});

		
		
			

	// ADD AXES
	viz.append('g')
		.attr('class', 'x axis')
		.attr('transform', 'translate(' + 0 + ',' + height + ')')
		.call(xAxis);

	viz.append('g')
		.attr('class', 'y axis')
		.call(yAxis);

});

