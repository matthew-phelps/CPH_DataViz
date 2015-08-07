// Heigh + width of svg
var height = 700,
	width = 700;

var padding = 200;

var defaultCircleRadius = 2;

var viz = d3.select('#viz-wrapper')
	.append('svg')
	//addtion to separate axes from parent graph element.
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

//CIRCLE RADIUS TO AREA CONVERSION
var solveForR = function(cholera_deaths) {
	// area of circle = pi * r * r
	area = parseInt(cholera_deaths); //Math.abs corrects for potential negative values.
	r = Math.sqrt(area / Math.PI);
	return r;
};



// LOAD DATA /////////////////////////////////////////////
d3.csv('data/CPH_cholera_outbreak_1853.csv', function(data) {

	// SET DOMAINS //
	yDomain = d3.extent(data, function(element) {
		return parseInt(element.cholera_cases);
	});

	xMin = d3.min(data, function(element) {
		var time = parseTime.parse(element.full_date);
		time.setDate(time.getDate() - 3);
		return time
	});

	xMax = d3.max(data, function(element) {
		var time = parseTime.parse(element.full_date);
		time.setDate(time.getDate() + 3);
		return time
	});

	rDomain = d3.extent(data, function(element) {
		return solveForR(parseInt(element.cholera_deaths));
	});


	/* SIMPLE WAY TO GET X DOMAIN EXTENTS
	xDomain = d3.extent(data, function(element) {
		return parseTime.parse(element.full_date)
	});
	*/
	yScale.domain(yDomain);
	xScale.domain([xMin, xMax]);
	rScale.domain(rDomain);

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
			var date = parseTime.parse(d.full_date);
			var x = xScale(date);
			// get y position
			var y = yScale(d.cholera_cases);
			return 'translate(' + x + ',' + y + ')'
		})
		.style({
			'stroke': '#1250C3',
			'fill': '#00008A'
		});

	dots.append('circle')
		.attr('r', defaultCircleRadius);

	dots.append('text')
		.text(function(d) {
			return "Cases " + d.cholera_cases + " @ day: " + d.day_index;
		})
		.attr('transform', function(d) { // move the labels (relative to the position of the 'g' elements!)
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
		.style('display', 'none'); //Text will exist but invisible by default.

	// Add Mortality data
	dotsMort = viz.selectAll('g.dotsMort')
		.data(data)
		.enter()
		.append('g')
		.attr('class', 'dotsMort');

	dotsMort.attr('transform', function(d) {
		// Get x position.
		var date = parseTime.parse(d.full_date);
		var x = xScale(date);
		// Get y position.
		var y = yScale(d.cholera_deaths);
		return 'translate(' + x + "," + y + ")";
	})

	dotsMort.style({
		'stroke': '#C32F12',
		'fill': '#C32F12'
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
		.style({
			'stroke': 'none',
			'fill': 'black',
			'font-family': 'arial',
			'background-color': 'white'
		}) //Removes formatting given to circles element & changes font family.
		.style('display', 'none'); //Text will exist but invisible by default.

	// ADDING LINE GRAPH
	var LineGen = d3.svg.line()
		.x(function(d) {
			return xScale(d.full_date);
		})
		.y(function(d) {
			return yScale(d.cholera_cases);
		});

	viz.append('svg:path')
		.attr('d', LineGen(data))
		.attr('stroke', 'green')
		.attr('stroke-width', 2)
		.attr('fill', 'none');


	// INTERACTIVITY
	// 2nd parameter of ".on" method is event listener function.
	dots.on('mouseenter', function(d, i) { //d = datum of current element | i = index of the data.
		radius = solveForR(parseInt(d.cholera_cases));
		dot = d3.select(this); //"this" is the html element that contains the listener. Using "this" we turn d3 element into a selection. So here we turnt he 'g' element into a d3 selection.
		dot.select('text') // use sub-selection of 'g' elemented selected above to select 'text'.
			.style('display', 'block');
		dot.select('circle')
			.attr('r', rScale(radius));
	});

	dots.on('mouseleave', function(d, i) {
		dot = d3.select(this);
		dot.select('text')
			.style('display', 'none');
		dot.select('circle')
			.attr('r', defaultCircleRadius);
	});

	dotsMort.on('mouseenter', function(d, i) { //d = datum of current element | i = index of the data.
		radius = solveForR(parseInt(d.cholera_deaths));
		dot = d3.select(this); //"this" is the html element that contains the listener. Using "this" we turn d3 element into a selection. So here we turnt he 'g' element into a d3 selection.
		dot.select('text') // use sub-selection of 'g' elemented selected above to select 'text'.
			.style('display', 'block');
		dot.select('circle')
			.attr('r', rScale(radius));
	});

	dotsMort.on('mouseleave', function(d, i) {
		dot = d3.select(this);
		dot.select('text')
			.style('display', 'none');
		dot.select('circle')
			.attr('r', defaultCircleRadius);
	});

});