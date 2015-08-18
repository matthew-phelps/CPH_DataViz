// Heigh + width of svg
var height = 550,
	width = 850,
	padding = 80,
	topPadding = 30,
	legendHeight = 90,
	legendWidth = 200;

var defaultCircleRadius = 2;
	mouseCircleRadius = 7;

var caseColor = "#2477F3",
	deathColor = "#F46C75";

// CREATE SVG
var viz = d3.select('body')
	.append('svg')
		.attr('height', height + padding *2)
		.attr('width', width + padding *2)
	// add 'group' element
	.append('g')
		.attr('id', 'viz')
		.attr('transform',
				'translate(' + padding + "," + padding + ')');

// SCALE CONVERSIONS
var yScale = d3.scale.linear()
	.range([height, topPadding]);

var xScale = d3.time.scale()
	.range([0, width]);

// Circle radius scale
var rScale = d3.scale.linear()
	.range([5, 10]);

// SET UP AXES
var xAxis = d3.svg.axis().scale(xScale)
	.orient('bottom')
	.ticks(10);

var yAxis = d3.svg.axis().scale(yScale)
	.orient('left')
	.ticks(10);

var parseTime = d3.time.format("%d%m%Y");

var prettyTime = d3.time.format("%d %b")

// LINE GENERATING FUNCTIONS
var LineGenCases = d3.svg.line()
	.x(function(d) {
			return xScale(d.full_date);
	})
	.y(function(d) {
		return yScale(d.cholera_cases);
	});

var LineGenDeaths = d3.svg.line()
	.x(function(d) {
		return xScale(d.full_date);
	})
	.y(function(d) {
		return yScale(d.cholera_deaths);
	});

//CIRCLE RADIUS TO AREA CONVERSION
var solveForR = function(cholera_deaths) {
	// area of circle = pi * r * r
	area = cholera_deaths; //Math.abs corrects for potential negative values.
	r = Math.sqrt(area / Math.PI);
	return r;
};

// ADD TITLE
 var titleText = viz.append('text')
 	.text("Cholera epidemic 1853 Copenhagen")
 	.attr('x', (width) / 3)
 	.attr({'font-family': 'Roboto', 'font-size' : '20'});


// LOAD DATA /////////////////////////////////////////////
d3.csv('data/CPH_cholera_outbreak_1853.csv', function(data) {
	data.forEach(function(d) {
		d.full_date = parseTime.parse(d.full_date);
		d.cholera_cases = parseInt(d.cholera_cases);
		d.cholera_deaths = parseInt(d.cholera_deaths);
	});
	// SET DOMAINS //
	yDomain = d3.extent(data, function(element) {
		return element.cholera_cases;
	});

	xDomain = d3.extent(data, function(element) {
		return element.full_date;
	});

	rDomain = d3.extent(data, function(element) {
		return solveForR(element.cholera_deaths);
	});

	yScale.domain(yDomain);
	xScale.domain(xDomain);
	rScale.domain(rDomain);

	// ADDING LINE GRAPH ///////////////////////////
	viz.append('path')
		.attr('class', 'line cases')
		.attr('d', LineGenCases(data))
		.attr('stroke-width', 2)
		.attr('stroke', caseColor)
		.attr('fill', 'none');

	viz.append('path')
		.attr('class', 'line deaths')
		.attr('d', LineGenDeaths(data))
		.attr('stroke-width', 2)
		.attr('stroke', deathColor)
		.attr('fill', 'none')
		.attr('stroke-dasharray', '10,5')


	// LEGEND ///////

	var legend = viz.append('g')
		.attr('class', 'legend')
		.attr('transform', 'translate(' + (width - 300) + ',' + 200 + ')');

	legend.append('text')
		.attr('x', 115)
		.attr('y', 25)
		.attr('font-size', '16')
		.text("Cholera Cases")

	// ADD X AXIS
	var g_elements = viz.append('g')
		.attr('class', 'x axis')
		//create an attribute called "transform" with the data "translate(0,height) to move axis down to 0 on y axis - i.e. moves it "heigh" pixels away from y = 0, where 0 is the top in SVG coordinates.
		.attr('transform', 'translate(0,' + height + ")")
		.call(xAxis) //this invokes xAxis generator?
		/*This is same as viz.append("g") call above :
		xAxis(viz.append('g').attr('class', 'x axis') );
		*/

	// Format text on x Axis
	g_elements.selectAll('text')
		.attr('transform', function() {
			return "rotate(-65)"
		})
		.style('text-anchor', 'end')
		.style('font-size', '12px')
		.attr('dx', '-10px')
		.attr('dy', '10px');

	// ADD Y AXIS
	viz.append('g')
		.attr('class', 'y axis') //Does not need transformation because it will start at origin of svg.
		.call(yAxis);

	
	// DATA BINDING ////////////////
	// Bind data to 'g' elements, rather than circles themselves.
	
	//CASE DATA CIRCLES
	dots = viz.selectAll('g.dots')
		.data(data)
		.enter()
		.append('g')
		.attr('class', 'dots');

	dots.attr('transform', function(d) {
			// get x position
			var date = d.full_date;
			var x = xScale(date);
			// get y position
			var y = yScale(d.cholera_cases);
			return 'translate(' + x + ',' + y + ')'
		})
		.style({
			'stroke': caseColor,
			'fill': caseColor
		});

	dots.append('circle')
		.attr('r', defaultCircleRadius);

	// INVISIBLE CIRCLES to make mouseover events easier
	mouseCircles = viz.selectAll('g.mouseCircles')
		.data(data)
		.enter()
		.append('g')
		.attr('class', 'mouseCircles');

	mouseCircles.attr('transform', function(d) {
			// get x position
			var date = d.full_date;
			var x = xScale(date);
			// get y position
			var y = yScale(d.cholera_cases);
			return 'translate(' + x + ',' + y + ')'
		});
		
	mouseCircles.style({
		'stroke': caseColor,
		'fill': caseColor
		});

	mouseCircles.append('circle')
		.attr('r', mouseCircleRadius)
		.attr('opacity', 0);
	


	// MORTALITY CIRCLES
	dotsMort = viz.selectAll('g.dotsMort')
		.data(data)
		.enter()
		.append('g')
		.attr('class', 'dotsMort');

	dotsMort.attr('transform', function(d) {
		// Get x position.
		var date = d.full_date;
		var x = xScale(date);
		// Get y position.
		var y = yScale(d.cholera_deaths);
		return 'translate(' + x + "," + y + ")";
	})

	dotsMort.style({
		'stroke': deathColor,
		'fill': deathColor
	});

	dotsMort.append('circle')
		.attr('r', defaultCircleRadius);

	// MORTALITY INVISIBLE CIRCLES
	mouseCirclesMortality = viz.selectAll('g.mouseCirclesMortality')
		.data(data)
		.enter()
		.append('g')
		.attr('class', 'mouseCirclesMortality');

	mouseCirclesMortality.attr('transform', function(d) {
			// get x position
			var date = d.full_date;
			var x = xScale(date);
			// get y position
			var y = yScale(d.cholera_deaths);
			return 'translate(' + x + ',' + y + ')'
		});
		
	mouseCirclesMortality.style({
		'stroke': deathColor,
		'fill': deathColor
		});

	mouseCirclesMortality.append('circle')
		.attr('r', mouseCircleRadius)
		.attr('opacity', 0);



	// INTERACTIVITY /////////////////////////
	// 2nd parameter of ".on" method is event listener function.
	
	// CASES ENTER
	mouseCircles.on('mouseenter', function(d) { //d = datum of current element | i = index of the data.
		var xPosition = xScale(d.full_date) + 10;
		var yPosition = yScale(d.cholera_cases) - padding - topPadding + 100; // 'padding' elements to make sure that as we adjust the padding we don't have to keep adjusting the position on the toolTips
		d3.select('#caseTooltip')
			.style('left', xPosition + 'px')
			.style('top', yPosition + 'px');
		d3.select("#caseValue").text(d.cholera_cases);
		d3.select('#dayIndexCase').text(d.day_index);
		d3.select('#dateCase').text(prettyTime(d.full_date));
		d3.select('#caseTooltip')
			.transition()
			.style('opacity', 0.9);
		radius = solveForR(d.cholera_cases);
		dot = d3.select(this);
		dot.select('circle')
			.transition()
			.duration(100)
			.attr('r', rScale(radius))
			.attr('opacity', 0.9);
	});

	// CASES EXIT
	mouseCircles.on('mouseleave', function(d, i) {
		dot = d3.select(this);
		d3.select('#caseTooltip')
			.transition()
			.style('opacity', 0);
		dot.select('circle')
			.transition()
			.duration(150)
			.attr('r', mouseCircleRadius)
			.attr('opacity', 0);
	});

	// MORTALITY ENTER
	mouseCirclesMortality.on('mouseenter', function(d) { //d = datum of current element | i = index of the data.
		var xPosition = xScale(d.full_date) + 10;
		var yPosition = yScale(d.cholera_deaths)  - padding - topPadding + 100;
		d3.select('#deathTooltip')
			.style('left', xPosition + 'px')
			.style('top', yPosition + 'px');
		d3.select("#deathValue").text(d.cholera_deaths);
		d3.select('#dayIndexDeath').text(d.day_index);
		d3.select('#dateDeath').text(prettyTime(d.full_date));
		d3.select('#deathTooltip')
			.transition()
			.style('opacity', 0.9);
		radius = solveForR(d.cholera_deaths);
		dot = d3.select(this);
		dot.select('circle')
			.transition()
			.duration(100)
			.attr('r', rScale(radius))
			.attr('opacity', 0.9);
	});

	mouseCirclesMortality.on('mouseleave', function(d, i) {
		dot = d3.select(this);
		d3.select('#deathTooltip')
			.transition()
			.style('opacity', 0);
		dot.select('circle')
			.transition()
			.duration(150)
			.attr('r', mouseCircleRadius)
			.attr('opacity', 0);
	});

});