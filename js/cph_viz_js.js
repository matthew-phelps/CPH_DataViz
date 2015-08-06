// Heigh + width of svg
var height = 800,
	width = 500;

var padding = 50;

var viz = d3.select('#viz-wrapper')
			.append('svg')
			.attr('id', 'viz')
			.attr('height', height)
			.attr('width', width);

// Scale conversion
var yScale = d3.scale.linear()
							.range([height, 0]);

var xScale = d3.time.scale()
							.range([0, width]);

var parseTime = d3.time.format("%d%m%Y");


// LOAD DATA
d3.csv('data/CPH_cholera_outbreak_1853.csv', function(data){
	yDomain = d3.extent(data, function(element) {
		return parseInt(element.cholera_cases);
	});

	xDomain = d3.extent(data, function(element) {
		return parseTime.parse(element.full_date)
	});

	yScale.domain(yDomain);
	xScale.domain(xDomain);

	dots = viz.selectAll('circle')
					.data(data)
					.enter()
					.append('circle');

	dots.attr('r', 5)
			.attr('cx', function(d) {
				date = parseTime.parse(d.full_date);
				return xScale(date)
			})
			.attr('cy', function(d) {
				cases = parseInt(d.cholera_cases);
				return yScale(cases)
			})
			.style('stroke', 'red')
			.style('fill', 'blue');


});


