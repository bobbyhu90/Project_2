var us_x_axes = [
	{
		option: "views",
		label: "Total Video Views (US)"
	}
];
var us_y_axes = [
	{
		option: "likes",
		label: "Total Video Likes"
	},
	{
		option: "dislikes",
		label: "Total Video Dislikes"
	},
	{
		option: "comment_count",
		label: "Total Comment Count"
	}
];
var gb_x_axes = [
	{
		option: "views",
		label: "Total Video Views (UK)"
	}
];
var gb_y_axes = [
	{
		option: "likes",
		label: "Total Video Likes"
	},
	{
		option: "dislikes",
		label: "Total Video Dislikes"
	},
	{
		option: "comment_count",
		label: "Total Comment Count"
	}
];
var curr_us_x_axis = us_x_axes[0].option;
var curr_us_y_axis = us_y_axes[0].option;

var curr_gb_x_axis = gb_x_axes[0].option;
var curr_gb_y_axis = gb_y_axes[0].option;

var width = 820; 
var height = 400;

var us_svg = d3
	.select("#us_scatter")
	.append("svg")
	.attr("width", 960)
	.attr("height", 500);

var gb_svg = d3
	.select("#gb_scatter")
	.append("svg")
	.attr("width", 960)
	.attr("height", 500);

var us_chart = us_svg.append("g")
	.attr("transform", `translate(${100}, ${20})`);

var gb_chart = gb_svg.append("g")
	.attr("transform", `translate(${100}, ${20})`);

function get_xScale(data, curr_x_axis) {
    return d3.scaleLinear()
        .domain([d3.min(data, d => d[curr_x_axis]) * (1 - 0.2),
        d3.max(data, d => d[curr_x_axis]) * (1 + 0.2)])
        .range([0, width]);
}

function get_yScale(data, curr_y_axis) {
	return d3.scaleLinear()
		.domain([0, d3.max(data, d => d[curr_y_axis]) * (1 + 0.2)])
		.range([height, 0]);
}

function renderXAxis(newXAxis, xAxis) {
	var us_bottom_axis = d3.axisBottom(newXAxis);
	xAxis.transition()
		.duration(1000)
		.call(us_bottom_axis);
	//
	return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxis(newYAxis, yAxis) {
	var us_left_axis = d3.axisLeft(newYAxis);
	// shift axis
	yAxis.transition()
		.duration(1000)
		.call(us_left_axis);
	//
	return yAxis;
}

function renderCircles(circles, newXAxis, newYAxis, curr_x_axis, curr_y_axis){
	circles.selectAll("circle")
		.transition()
		.duration(1000)
		.attr("cx", d => newXAxis(d[curr_x_axis]))
		.attr("cy", d => newYAxis(d[curr_y_axis]));
	// use a transition to shift the circles' text
	circles.selectAll("text")
		.transition()
		.duration(1000)
		.attr("x", d => newXAxis(d[curr_x_axis]))
		.attr("y", d => newYAxis(d[curr_y_axis]));
	//
	return circles;
}

function formatToolTipText(label, number) {
	var line = `${label.split(" (")[0]}: `;
	if (label.includes("%")) {
		line += `${number}%`
    }
	else if (label.includes("USD")) {
		line += `$${number.toLocaleString()}`;
    }
	else {
        line += number;
    }
	return line;
}

function updateCircles(curr_x_axis, curr_y_axis, circles, x_axes_list, y_axes_list) {
	var xLabel = "";
	var yLabel = "";
	// loop thru the x axes to get the matching option
	for (var i = 0; i < x_axes_list.length; i++)
		if (curr_x_axis == x_axes_list[i].option)
			xLabel = x_axes_list[i].label;
	// loop thru the y axes to get the matching option
	for (var i = 0; i < y_axes_list.length; i++)
		if (curr_y_axis == y_axes_list[i].option)
			yLabel = y_axes_list[i].label;
	// add a tooltip
	var toolTip = d3.tip()
		.attr("class", "tooltip")
		.offset([110, 0])
		.html(d => [
			d.state,
			formatToolTipText(xLabel, d[curr_x_axis]),
			formatToolTipText(yLabel, d[curr_y_axis])
		].join("<br>"));
	// add the callback
	circles.call(toolTip);
	// add the mouse over event
	circles
		.on("mouseover", (data, index, element) => toolTip.show(data, element[index]))
		.on("mouseout", (data, index, element) => toolTip.hide(data, element[index]));
	//
	return circles;
}

Promise.all([
	d3.csv("static/data/USvideos_between_1_and_80M_views_likes_dislikes_comments.csv"),
	d3.csv("static/data/GBvideos_between_1_and_80M_views_likes_dislikes_comments.csv"),
]).then(function (video_files, err) {
	if (err) throw err;
	us_video_data = video_files[0]
	gb_video_data = video_files[1]
    // video_id,trending_date,title,channel_title,category_id,publish_time,tags,views,likes,dislikes,comment_count,thumbnail_link,comments_disabled,ratings_disabled,video_error_or_removed,description
	us_video_data.forEach(function (data) {
		data.id = +data.video_id;
		data.views = +data.views;
		data.likes = +data.likes;
		data.dislikes = +data.dislikes;
		data.comment_count = +data.comment_count;
	});
	gb_video_data.forEach(function (data) {
		data.id = +data.video_id;
		data.views = +data.views;
		data.likes = +data.likes;
		data.dislikes = +data.dislikes;
		data.comment_count = +data.comment_count;
	});

	var us_x_scale = get_xScale(us_video_data, curr_us_x_axis);
	var us_y_scale = get_yScale(us_video_data, curr_us_y_axis);

	var gb_x_scale = get_xScale(gb_video_data, curr_gb_x_axis);
	var gb_y_scale = get_yScale(gb_video_data, curr_gb_y_axis);

	var us_left_axis = d3.axisLeft(us_y_scale);
	var us_bottom_axis = d3.axisBottom(us_x_scale);

	var gb_left_axis = d3.axisLeft(gb_y_scale);
	var gb_bottom_axis = d3.axisBottom(gb_x_scale);

	var us_x_axis = us_chart.append("g").classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(us_bottom_axis);

	var gb_x_axis = gb_chart.append("g").classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(gb_bottom_axis);

	var us_y_axis = us_chart.append("g").classed("y-axis", true).call(us_left_axis);
    var us_circles = us_chart.selectAll("g>circle").data(us_video_data).enter().append("g");

	var gb_y_axis = gb_chart.append("g").classed("y-axis", true).call(gb_left_axis);
    var gb_circles = gb_chart.selectAll("g>circle").data(gb_video_data).enter().append("g");

    var us_labels = us_chart.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

	var gb_labels = gb_chart.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var us_x_labels = [];
	var us_y_labels = [];

	var gb_x_labels = [];
	var gb_y_labels = [];

    us_circles.append("circle")
    .attr("cx", d => us_x_scale(d[curr_us_x_axis]))
    .attr("cy", d => us_y_scale(d[curr_us_y_axis]))
    .attr("r", 3)
    .attr("fill", "#B57EDC");

	gb_circles.append("circle")
    .attr("cx", d => gb_x_scale(d[curr_gb_x_axis]))
    .attr("cy", d => gb_y_scale(d[curr_gb_y_axis]))
    .attr("r", 3 )
    .attr("fill", "#B5DCDC");

    us_circles.append("text")
    .attr("x", d => us_x_scale(d[curr_us_x_axis]))
    .attr("y", d => us_y_scale(d[curr_us_y_axis]))
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("font-size", `${10}px`)
    .attr("fill", "white")
    .text(d => d.abbr);

	gb_circles.append("text")
    .attr("x", d => us_x_scale(d[curr_gb_x_axis]))
    .attr("y", d => us_y_scale(d[curr_gb_y_axis]))
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("font-size", `${10}px`)
    .attr("fill", "white")
    .text(d => d.abbr);

    for (var i = 0; i < us_x_axes.length; i++)
    us_x_labels.push(us_labels.append("text")
        .attr("x", 0)
        .attr("y", (i + 1) * 17)
        .attr("value", us_x_axes[i].option)
        .classed("active", us_x_axes[i].option === curr_us_x_axis)
        .classed("inactive", us_x_axes[i].option !== curr_us_x_axis)
        .text(us_x_axes[i].label));

	for (var i = 0; i < gb_x_axes.length; i++)
    gb_x_labels.push(gb_labels.append("text")
        .attr("x", 0)
        .attr("y", (i + 1) * 17)
        .attr("value", gb_x_axes[i].option)
        .classed("active", gb_x_axes[i].option === curr_gb_x_axis)
        .classed("inactive", gb_x_axes[i].option !== curr_gb_x_axis)
        .text(gb_x_axes[i].label));

    for (var i = 0; i < us_y_axes.length; i++)
		us_y_labels.push(us_labels.append("text")
			.attr("transform", "rotate(-90)")
			.attr("x", height * 0.5)
			.attr("y", -width * 0.5 - (i + 2) * 17)
			.attr("value", us_y_axes[i].option)
			.classed("active", us_y_axes[i].option === curr_us_y_axis)
			.classed("inactive", us_y_axes[i].option !== curr_us_y_axis)
			.text(us_y_axes[i].label));

	for (var i = 0; i < gb_y_axes.length; i++)
		gb_y_labels.push(gb_labels.append("text")
			.attr("transform", "rotate(-90)")
			.attr("x", height * 0.5)
			.attr("y", -width * 0.5 - (i + 2) * 17)
			.attr("value", gb_y_axes[i].option)
			.classed("active", gb_y_axes[i].option === curr_gb_y_axis)
			.classed("inactive", gb_y_axes[i].option !== curr_gb_y_axis)
			.text(gb_y_axes[i].label));

    var us_circles = updateCircles(curr_us_x_axis, curr_us_y_axis, us_circles, us_x_axes, us_y_axes);
    var gb_circles = updateCircles(curr_gb_x_axis, curr_gb_y_axis, gb_circles, gb_x_axes, gb_y_axes);

    us_labels.selectAll("text")
    .on("click", function () {
        // get selection
        var value = d3.select(this).attr("value");
        var is_x_axis = false;
        // update value
        for (var i = 0; i < us_x_axes.length; i++)
            if (us_x_axes[i].option === value) {
                is_x_axis = true;
                break;
            }
        // dont do unless it actually changed
        if ((is_x_axis && value !== curr_us_x_axis) || (is_x_axis === false && value !== curr_us_y_axis)) {

            if (is_x_axis) {
                curr_us_x_axis = value
            }
            else {
                curr_us_y_axis = value;
            }
            //refresh the x and y scales
            us_x_scale = get_xScale(us_video_data, curr_us_x_axis);
            us_y_scale = get_yScale(us_video_data, curr_us_y_axis);

            // re-render x and y scales
            us_x_axis = renderXAxis(us_x_scale, us_x_axis);
            us_y_axis = renderYAxis(us_y_scale, us_y_axis);

            // updates us_circles with new x and y values
            us_circles = renderCircles(us_circles, us_x_scale, us_y_scale, curr_us_x_axis, curr_us_y_axis);

            // updates tooltips with new info
            us_circles = updateCircles(curr_us_x_axis, curr_us_y_axis, us_circles, us_x_axes, us_y_axes);

            // switch up classes to emphasize active x and y
            for (var i = 0; i < us_x_axes.length; i++)
                us_x_labels[i]
                    .classed("active", curr_us_x_axis === us_x_axes[i].option)
                    .classed("inactive", curr_us_x_axis !== us_x_axes[i].option);
            for (var i = 0; i < us_y_axes.length; i++)
                us_y_labels[i]
                    .classed("active", curr_us_y_axis === us_y_axes[i].option)
                    .classed("inactive", curr_us_y_axis !== us_y_axes[i].option);
        }
    });

	gb_labels.selectAll("text")
    .on("click", function () {
        // get selection
        var value = d3.select(this).attr("value");
        var is_x_axis = false;
        // update value
        for (var i = 0; i < gb_x_axes.length; i++)
            if (gb_x_axes[i].option === value) {
                is_x_axis = true;
                break;
            }
        // dont do unless it actually changed
        if ((is_x_axis && value !== curr_gb_x_axis) || (is_x_axis === false && value !== curr_gb_y_axis)) {

            if (is_x_axis) {
                curr_gb_x_axis = value
            }
            else {
                curr_gb_y_axis = value;
            }
            //refresh the x and y scales
            gb_x_scale = get_xScale(gb_video_data, curr_gb_x_axis);
            gb_y_scale = get_yScale(gb_video_data, curr_gb_y_axis);

            // re-render x and y scales
            gb_x_axis = renderXAxis(gb_x_scale, gb_x_axis);
            gb_y_axis = renderYAxis(gb_y_scale, gb_y_axis);

            // updates gb_circles with new x and y values
            gb_circles = renderCircles(gb_circles, gb_x_scale, gb_y_scale, curr_gb_x_axis, curr_gb_y_axis);

            // updates tooltips with new info
            gb_circles = updateCircles(curr_gb_x_axis, curr_gb_y_axis, gb_circles, gb_x_axes, gb_y_axes);

            // switch up classes to emphasize active x and y
            for (var i = 0; i < gb_x_axes.length; i++)
                gb_x_labels[i]
                    .classed("active", curr_gb_x_axis === gb_x_axes[i].option)
                    .classed("inactive", curr_gb_x_axis !== gb_x_axes[i].option);
            for (var i = 0; i < gb_y_axes.length; i++)
                gb_y_labels[i]
                    .classed("active", curr_gb_y_axis === gb_y_axes[i].option)
                    .classed("inactive", curr_gb_y_axis !== gb_y_axes[i].option);
        }
    });

}).catch(function (error) {
	console.log(error);
});
