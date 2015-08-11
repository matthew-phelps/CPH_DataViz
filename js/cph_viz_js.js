// Heigh + width of svg
var height = 700,
	width = 700,
	padding = 200;

var defaultCircleRadius = 2;

var caseColor = "#0066FF",
	deathColor = "#F3535E";

// CREATE SVG
var viz = d3.select('body')
	.append('svg')
		.attr('height', height + padding * 2)
		.attr('width', width + padding * 2)
	// add 'group' element
	.append('g')
		.attr('id', 'viz')
		.attr('transform',
				'translate(' + padding + "," + padding + ')');

// SCALE CONVERSIONS
var yScale = d3.scale.linear()
	.range([height, 0]);

var xScale = d3.time.scale()
	.range([0, width]);

// Circle radius scale
var rScale = d3.scale.linear()
	.range([3, 8]);

// SET UP AXES
var xAxis = d3.svg.axis().scale(xScale)
	.orient('bottom')
	.ticks(5);

var yAxis = d3.svg.axis().scale(yScale)
	.orient('left')
	.ticks(10);

var parseTime = d3.time.format("%d%m%Y");

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

	// DATA BINDING // Bind data to 'g' elements, rather than circles themselves.
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

/*	dots.append('text')
		.text(function(d) {
			return "Cases: " + d.cholera_cases + " at day: " + d.day_index;
		})*/
/*		.attr('transform', function(d) { // move the labels (relative to the position of the 'g' elements!)
			var x = 20
				// get y position
			var y = 5
			return 'translate(' + x + ',' + y + ')';
		})
		.style({
			'stroke': 'none',
			'fill': 'black',
			'font-family': 'arial',
			'background-color': 'white'
		}) //Removes formatting given to circles element & changes font family.
		.style('display', 'none'); //Text will exist but invisible by default.*/

	// Add Mortality data
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

	dotsMort.append('text')
		.text(function(d) {
			return "Deaths " + d.cholera_deaths + " @ day: " + d.day_index;
		})
		.attr('transform', function(d) { // move the labels (relative to the position of the 'g' elements!)
			var x = 20
				// get y position
			var y = 5
			return 'translate(' + x + ',' + y + ')';
		})
		.style({ //Removes formatting given to circles element & changes font family.
			'stroke': 'none',
			'fill': 'black',
			'font-family': 'arial',
			'background-color': 'white'
		})
		.style('display', 'none'); //Text will exist but invisible by default.



	// INTERACTIVITY /////////////////////////

	// 2nd parameter of ".on" method is event listener function.
	dots.on('mouseenter', function(d) { //d = datum of current element | i = index of the data.
		d3.select("#caseValue").text(d.cholera_cases);
		d3.select('#dayIndexCases').text(d.day_index);
		d3.select('#dateCases').text(d.full_date);
		d3.select('#caseTooltip').classed("hidden", false);
		radius = solveForR(d.cholera_cases);
		dot = d3.select(this);
		dot.select('circle')
			.transition()
			.duration(100)
			.attr('r', rScale(radius));
	});

	dots.on('mouseleave', function(d, i) {
		dot = d3.select(this);
		d3.select('#caseTooltip').classed("hidden", true);
		dot.select('circle')
			.transition()
			.duration(150)
			.attr('r', defaultCircleRadius);
	});

	dotsMort.on('mouseenter', function(d, i) { //d = datum of current element | i = index of the data.
		radius = solveForR(d.cholera_deaths);
		dot = d3.select(this); //"this" is the html element that contains the listener. Using "this" we turn d3 element into a selection. So here we turnt he 'g' element into a d3 selection.
		dot.select('text') // use sub-selection of 'g' elemented selected above to select 'text'.
			.style('display', 'block');
		dot.select('circle')
			.transition()
			.duration(100)
			.attr('r', rScale(radius));
	});

	dotsMort.on('mouseleave', function(d, i) {
		dot = d3.select(this);
		dot.select('text')
			.style('display', 'none');
		dot.select('circle')
			.transition()
			.duration(150)
			.attr('r', defaultCircleRadius);
	});

});