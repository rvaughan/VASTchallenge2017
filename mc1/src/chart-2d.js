'use strict';

class Chart2D {
    constructor(svg, width, height, options) {
        this.svg = svg;
        this.svg.selectAll('*').remove();

        this.width = width;
        this.height = height;

        if (!options) {
            options = {};
        }

        this.options = options;
        if (!this.options.margin) {
            this.options.margin = {top: 20, right: 20, bottom: 50, left: 70};
        }

        // let margin = this.options.margin;

        // this.svg.attr("width", width + margin.left + margin.right)
        //     .attr("height", height + margin.top + margin.bottom)
        // ;

        // set the ranges
        this.x = !!this.options.timeChart ? d3.scaleTime().range([0, width]) :  d3.scaleLinear().range([0, width]);
        this.y = d3.scaleLinear().range([height, 0]);

        if (!this.options.defaultLineWidth) {
            this.options.defaultLineWidth = 0.2;
        }

        this.filters = {};

    }

    setEventHandler(eventHandler) {
        this.eventHandler = eventHandler;
    }

    addData(context, dataArray, xKey, yKey) {

        if (!this.lineData) {
            this.lineData = [];
        }

        // if (!xKey) {
        //     xKey = 'x';
        // }
        //
        // if (!yKey) {
        //     yKey = 'y';
        // }

        if (!context) {
            context = {};
        }


        if (!context.color) {
            context.color = '#000000';
        }

        let self = this;

        let valueLine = d3.line()
                .x(function(d, idx) {
                    return !!xKey ? self.x(d[xKey]) : self.x(idx);
                })
                .y(function(d, idx) {
                    return !!yKey ? self.y(d[yKey]) : self.y(idx); })
            ;

        self.lineData.push( {valueLine: valueLine, data: dataArray, context: context, x: xKey, y: yKey});
    }

    renderChart(events) {

        let self = this;

        self.myLine = this.svg.selectAll('.line-graph').data(this.lineData).enter()
            .append('g')
            .attr('class', function (l) {
                return 'line-graph car-id-' + l.context.carId;
            })
            .style('visibility', function (line) {
                return line.visibility = 'visible';
            })
        ;

        self.myLine
            .append('path')
            .attr("class", function (line) {
                return "line line-multi-visit-" + (!!line.context.multiEnterExit ? 1 : 0)
            })
            .attr("d", function (line) {
                return line.valueLine(line.data);
            })
            .style('stroke-width', self.options.defaultLineWidth)
            .style('stroke', '#000000')
            .style('fill', 'none')
        ;

        if (!!events && events.length > 0) {
            events.forEach(function (e) {
                self.myLine.on(e.name, function (l, index) {
                    // e.callback(e.params, l, index);

                    let event = {
                        name: e.name,
                        line: l
                    };

                    if (!!e.handler && typeof e.handler === 'function') {
                        e.handler.apply(e.context, [event]);
                    }

                    if (!!self.eventHandler) {
                        self.eventHandler.fireEvent(event);
                    }
                });
            })
        }
    }

    renderAxis(bottomLabel, leftLabel, format) {

        let height = this.height;
        let width = this.width;
        let margin = this.options.margin;

        let bottom = d3.axisBottom(this.x);

        if (this.options.timeChart && !!format) {
            bottom = d3.axisBottom(this.x).tickFormat(d3.timeFormat(format))

        }
        // Add the x Axis
        this.svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(bottom)
        ;

        // text label for the x axis
        if (!!bottomLabel) {
            this.svg.append("text")
                .attr("transform",
                    "translate(" + (width/2) + " ," +
                    (height + margin.top + 20) + ")")
                .style("text-anchor", "middle")
                .text(bottomLabel)
            ;
        }

        // Add the y Axis
        this.svg.append("g")
            .call(d3.axisLeft(this.y));

        if (!!leftLabel) {
            // text label for the y axis
            this.svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left)
                .attr("x",0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text(leftLabel)
            ;
        }
    }

    setXDomain(min, max) {
        this.x.domain([min, max]);
    }

    setYDomain(min, max) {
        this.y.domain([min, max]);
    }

    getVisibleLines() {

        let myVisits = [];
        this.myLine.each(function (line) {
            if (line.visibility == 'visible' && line.opacity == 1) {
                myVisits.push(line);
            }
        });

        console.log('visible lines: ' + myVisits.length);
        return myVisits;
    }
}


//
//
// var Chart2D = function Chart2D(svg, width, height, options) {
//
// };
//
// Chart2D.prototype.setEventHandler = function setEventHandler(eventHandler) {
//     this.eventHandler = eventHandler;
// };
//
//
// Chart2D.prototype.getSvg = function getSvg() {
//     return this.svg;
// };
//
// /**
//  *
//  * Set data before rendering the chart
//  *
//  * @param context: context information
//  * @param dataArray data array, containing [ [{x: xValue1, y: yValue1}, {x: xValue2, y: yValue2}], [{}]]
//  * @param xKey: key to get data for x axis. Default is x
//  * @param yKey: key to get data for y axis. Default is y
//  */
// Chart2D.prototype.addData = function addData(context, dataArray, xKey, yKey) {
//
//     if (!this.lineData) {
//         this.lineData = [];
//     }
//
//     if (!xKey) {
//         xKey = 'x';
//     }
//
//     if (!yKey) {
//         yKey = 'y';
//     }
//
//     if (!context) {
//         context = {};
//     }
//
//
//     if (!context.color) {
//         context.color = '#000000';
//     }
//
//     let self = this;
//
//     let valueLine = d3.line()
//             .x(function(d) {
//                 return self.x(d[xKey]);
//             })
//             .y(function(d) {
//                 return self.y(d[yKey]); })
//         ;
//
//     self.lineData.push( {valueLine: valueLine, data: dataArray, context: context, x: xKey, y: yKey});
// };
//
// Chart2D.prototype.setXDomain = function setXDomain(min, max) {
//     this.x.domain([min, max]);
// };
//
// Chart2D.prototype.setYDomain = function setYDomain(min, max) {
//     this.y.domain([min, max]);
// };
//
//
// Chart2D.prototype.getVisibleLines = function getVisibleLines() {
//
//     let myVisits = [];
//     this.myLine.each(function (line) {
//         if (line.visibility == 'visible') {
//             myVisits.push(line);
//         }
//     });
//
//     console.log('visible lines: ' + myVisits.length);
//     return myVisits;
// };
// /**
//  *
//  * Render axis with label for bottom and left axis
//  *
//  * @param bottomLabel
//  * @param leftLabel
//  * @param format (time for mat if time chart
//  */
// Chart2D.prototype.renderAxis = function renderAxis(bottomLabel, leftLabel, format) {
//
//     let height = this.height;
//     let width = this.width;
//     let margin = this.options.margin;
//
//     let bottom = d3.axisBottom(this.x);
//
//     if (this.options.timeChart && !!format) {
//         bottom = d3.axisBottom(this.x).tickFormat(d3.timeFormat(format))
//
//     }
//     // Add the x Axis
//     this.svg.append("g")
//         .attr("transform", "translate(0," + height + ")")
//         .call(bottom)
//     ;
//
//     // text label for the x axis
//     if (!!bottomLabel) {
//         this.svg.append("text")
//             .attr("transform",
//                 "translate(" + (width/2) + " ," +
//                 (height + margin.top + 20) + ")")
//             .style("text-anchor", "middle")
//             .text(bottomLabel)
//         ;
//     }
//
//     // Add the y Axis
//     this.svg.append("g")
//         .call(d3.axisLeft(this.y));
//
//     if (!!leftLabel) {
//         // text label for the y axis
//         this.svg.append("text")
//             .attr("transform", "rotate(-90)")
//             .attr("y", 0 - margin.left)
//             .attr("x",0 - (height / 2))
//             .attr("dy", "1em")
//             .style("text-anchor", "middle")
//             .text(leftLabel)
//         ;
//     }
// };
//
//
// Chart2D.prototype.renderChart = function renderChart(events) {
//
//     let self = this;
//
//     self.myLine = this.svg.selectAll('.line-graph').data(this.lineData).enter()
//         .append('g')
//         .attr('class', function (l) {
//             return 'line-graph car-id-' + l.context.carId;
//         })
//         .style('visibility', function (line) {
//             return line.visibility = 'visible';
//         })
//     ;
//
//     self.myLine
//         .append('path')
//         .attr("class", function (line) {
//             return "line line-multi-visit-" + (!!line.context.multiEnterExit ? 1 : 0)
//         })
//         .attr("d", function (line) {
//             return line.valueLine(line.data);
//         })
//         .style('stroke-width', self.options.defaultLineWidth)
//         .style('stroke', '#000000')
//         .style('fill', 'none')
//     ;
//
//     if (!!events && events.length > 0) {
//         events.forEach(function (e) {
//             self.myLine.on(e.name, function (l, index) {
//                 // e.callback(e.params, l, index);
//
//                 let event = {
//                     name: e.name,
//                     line: l
//                 };
//
//                 if (!!self.eventHandler) {
//                     self.eventHandler.fireEvent(event);
//                 }
//             });
//         })
//     }
// };