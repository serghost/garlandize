exports.garlandize = function(OPTIONS) {

    OPTIONS.x_gap      || (OPTIONS.x_gap = 45); // standart x-axis distance beetween nodes. less distance - more nodes
    OPTIONS.x_rand     || (OPTIONS.x_rand = 25); // random addition (0..25)
    OPTIONS.angle_rand || (OPTIONS.angle_rand = 10); // random angle of node (0..25)
    OPTIONS.amplitude  || (OPTIONS.amplitude = 4); // 1 to xxx. greater values == smoother distribution
    OPTIONS.frequency  || (OPTIONS.frequency = 100); // 1 to xxx. 
    OPTIONS.colorVars  || (OPTIONS.colorVars = ['blue-bulb', 'red-bulb', 'orange-bulb', 'green-bulb', 'yellow-bulb']);
    OPTIONS.shapeVars  || (OPTIONS.shapeVars = [{name: 'long-bulb',
                                                 bulbPath: 'M14.18,20.84C15,28.13,13.1,39.57,9.23,40S1,29.71.14,22.42,2.09,11.45,6,11,13.36,13.55,14.18,20.84Z',
                                                 capPath: 'M10.14,12.4a14.82,14.82,0,0,0-8.39.95L.42,1.5A9.38,9.38,0,0,1,4.5.06,9.72,9.72,0,0,1,8.81.55Z'},
                                                {name: 'mid-bulb',
                                                 bulbPath: 'M20.45,10.69c4.27,4.52,8.47,13.56,5.63,16.24s-11.62-2-15.89-6.55S6.27,11.63,9.11,9,16.18,6.17,20.45,10.69Z',
                                                 capPath: 'M13.08,7.35a17.26,17.26,0,0,0-6.14,5.8L0,5.8A10.91,10.91,0,0,1,2.5,2.3,11.13,11.13,0,0,1,6.14,0Z'},
                                                {name: 'short-bulb',
                                                 bulbPath: 'M14.12,17c-2.87,3.4-9.65,6.53-12.63,4s-1-9.72,1.83-13.12S9.91,5,12.89,7.54,17,13.64,14.12,17Z',
                                                 capPath: 'M15.22,11a22.8,22.8,0,0,0-2.81-2.86A24.48,24.48,0,0,0,8.77,5.52L13.43,0A15,15,0,0,1,17,2.27a15.16,15.16,0,0,1,2.84,3.17Z'}]);
    OPTIONS.cordStroke  || (OPTIONS.cordStroke = { color: "black", width: "2", dasharray: "0" });

    
    var elementsToGarlandize = document.querySelectorAll('.garlandize');
    elementsToGarlandize.forEach(function(element) {
        
        var width = element.offsetWidth;
        var height = element.offsetHeight;
        // set position of parent as 'relative':
        // we want svg to lie as absolute layer with size of the parent
        element.style.position = "relative";

        // create absolute svg box
        var svg = document.createElementNS('http://www.w3.org/2000/svg', "svg");
        svg.style.position = "absolute";
        // svg.style.width = "100%";
        // svg.style.height = "100%";
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
        // svg.style.width
        
        
        var points = [[0, height / OPTIONS.amplitude]];
        var x = 0;
        var y = 0;

        console.log(width);
        var html = "";

        while (x < width) {
            y = height/2 + height / OPTIONS.amplitude * Math.sin(x / OPTIONS.frequency);
            x += Math.floor(Math.random() * OPTIONS.x_rand) + OPTIONS.x_gap;
            // y = points.length % 3 * height/3 + 15;
            points.push([x, y]); // :TODO: x and y values must be based on the size of the svg
            let shapeObj = OPTIONS.shapeVars[Math.floor(Math.random() * OPTIONS.shapeVars.length)];
            // SVG RFC still very limited. I need to generate whole radialgradient tag for each object (can't use stop color tag as class)
            let color = OPTIONS.colorVars[Math.floor(Math.random() * OPTIONS.colorVars.length)];
            // angle += 10; //
            var angle = Math.floor(Math.random() * 10);
            // if (svg.width.animVal.value - x > 25) { // quick fix for skipping last lamp
            // points.push([x, y]);
            // let g = document.createElement("g");
            // g.setAttribute("transform", `translate(${x}, ${y}) rotate(${angle}) scale(0.6)`);
            // // for (variant in OPTIONS.shapeVars) {
            // let p1 = document.createElement("path");
            // p1.setAttribute("class", `${shapeObj.name} ${color}`);
            // p1.setAttribute("d", `${shapeObj.bulbPath}`);

            // let p2 = document.createElement("path");
            // p2.setAttribute("class", `glow ${shapeObj.name} ${color}`);
            // p2.setAttribute("d", `${shapeObj.bulbPath}`);
            //                          }
            // element.appendChild(svg);
            html += `<g transform='translate(${x}, ${y}) rotate(${angle}) scale(0.6)'>
                       <path class='${shapeObj.name} ${color}' d='${shapeObj.bulbPath}'></path>
                       <path class='glow ${shapeObj.name} ${color}' d='${shapeObj.bulbPath}'></path>
                       <path d='${shapeObj.capPath}'></path>
                     </g>`;
            // };
            
        };

        var line = function(pointA, pointB){
            var lengthX = pointB[0] - pointA[0];
            var lengthY = pointB[1] - pointA[1];
            return {
                length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
                angle: Math.atan2(lengthY, lengthX)
            }
        }

        var svgPath = (points, command) => {
            // build the d attributes by looping over the points
            var d = points.reduce((acc, point, i, a) => i === 0
                                  // if first point
                                  ? `M ${point[0]},${point[1]}`
                                  // else
                                  : `${acc} ${command(point, i, a)}`
                                  , '')
            return `<path d="${d}" fill="none" stroke="#1a396c" stroke-width="2" />`
            
        }
        var lineCommand = point => `L ${point[0]} ${point[1]}`

        element.appendChild(svg);
        svg.insertAdjacentHTML("beforeend", svgPath(points, lineCommand));
        svg.insertAdjacentHTML("beforeend", html);


        
        console.log("INSIDE");
    });
}


function placeSprites(){}

// module.exports = ["garlandize"];
// export { garlandize };
;
