"use strict";

exports.garlandize = function(OPTIONS) {

    // init options obj with default values
    const availableOptions = {x_gap: 45,      // standart x-axis distance beetween nodes. less distance - more nodes
                              x_rand: 25,     // random addition (0..25)
                              angle_rand: 50, // random angle of node (0..180)
                              amplitude: 4,   // 1 to xxx. greater values == smoother distribution
                              frequency: 100, // 1 to xxx. 
                              colorVars: ['blue-bulb', 'red-bulb', 'orange-bulb', 'green-bulb', 'yellow-bulb', 'violet-bulb'],
                              shapeVars: [{name: 'long-bulb',
                                           bulbPath: 'M14.18,20.84C15,28.13,13.1,39.57,9.23,40S1,29.71.14,22.42,2.09,11.45,6,11,13.36,13.55,14.18,20.84Z',
                                           capPath: 'M10.14,12.4a14.82,14.82,0,0,0-8.39.95L.42,1.5A9.38,9.38,0,0,1,4.5.06,9.72,9.72,0,0,1,8.81.55Z'},
                                          {name: 'mid-bulb',
                                           bulbPath: 'M20.45,10.69c4.27,4.52,8.47,13.56,5.63,16.24s-11.62-2-15.89-6.55S6.27,11.63,9.11,9,16.18,6.17,20.45,10.69Z',
                                           capPath: 'M13.08,7.35a17.26,17.26,0,0,0-6.14,5.8L0,5.8A10.91,10.91,0,0,1,2.5,2.3,11.13,11.13,0,0,1,6.14,0Z'},
                                          // {name: 'info',
                                          //  bulbPath: 'M231.9,104.6c0.4,11.3-7.9,20.4-21.1,20.4c-11.7,0-20-9.1-20-20.4c0-11.7,8.7-20.7,20.7-20.7      C224,83.9,231.9,93,231.9,104.6z M194.9,338.5V156h33.2v182.6H194.9z'
                                          // }
                                          
                                          {name: 'short-bulb',
                                           bulbPath: 'M7.33,8c3.2-2.34,7.09-2.35,9.92,1.61s4.67,11.85,1.57,14.15-10.18-1.93-13-5.89S4.18,10.19,7.33,8Z',
                                           capPath: 'M0,5A12.37,12.37,0,0,1,3,2,12.43,12.43,0,0,1,6.8,0c1.63,2.21,3.13,4.37,4.72,6.48A29.37,29.37,0,0,0,7.66,8.82a16.49,16.49,0,0,0-3,2.7C3.14,9.36,1.54,7.24,0,5Z'}
                                         ],
                              cordStroke: { color: "gray", width: "2", dasharray: "0" },
                              curveSmooth: 0.2 };

    // override default options with supplied OPTIONS
    for (let [k,v] of Object.entries(availableOptions)) {
        OPTIONS[k] || (OPTIONS[k] = v);
    };
    
    // helpers
    var line = function(pointA, pointB){
        var lengthX = pointB[0] - pointA[0];
        var lengthY = pointB[1] - pointA[1];
        return {
            length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
            angle: Math.atan2(lengthY, lengthX)
        }
    }

    var svgPath = (points, command) => {
        var d = points.reduce((acc, point, i, a) => i === 0
                              ? `M ${point[0]},${point[1]}`
                              : `${acc} ${command(point, i, a)}`
                              , '')
        return `<path d="${d}" fill="none" stroke=${OPTIONS.cordStroke.color} stroke-width=${OPTIONS.cordStroke.width} />`
        
    }
    var lineCommand = point => `L ${point[0]} ${point[1]}`

    // smooth angles with bezier curves
    // thanks to https://medium.com/@francoisromain/smooth-a-svg-path-with-cubic-bezier-curves-e37b49d46c74
    var controlPoint = (current, previous, next, reverse) => {
        var p = previous || current
        var n = next || current
        var smoothing = OPTIONS.curveSmooth
        var o = line(p, n)
        var angle = o.angle + (reverse ? Math.PI : 0)
        var length = o.length * smoothing
        var x = current[0] + Math.cos(angle) * length
        var y = current[1] + Math.sin(angle) * length
        return [x, y]
    }

    var bezierCommand = (point, i, a) => {
        var [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point)
        var [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true)
        return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`
    }
    
    // end of helpers


    // handle each element with data-options (if available)
    var elementsToGarlandize = document.querySelectorAll('.garlandize');
    
    elementsToGarlandize.forEach(function(element) {
        for (let [k,v] of Object.entries(element.dataset)) {
            OPTIONS[k] = Number(v); // :TODO: make support for nested options 
        };

        let width = element.offsetWidth;
        let height = element.offsetHeight;
        
        // set position of element as 'relative':
        // we want svg to lie as absolute layer with size of the parent
        element.style.position = "relative";

        // create absolute svg box
        var svg = document.createElementNS('http://www.w3.org/2000/svg', "svg");
        svg.style.position = "absolute";
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

        
        var points = [[0, height / OPTIONS.amplitude]];
        var x = 0;
        var y = 0;

        var html = "";

        // :TODO: make support for vertical elements. I need to swap x and y, but can't figure how

        while (x < width) { 
            y = height/2 + height / OPTIONS.amplitude * Math.sin(x / OPTIONS.frequency);
            x += Math.floor(Math.random() * OPTIONS.x_rand) + OPTIONS.x_gap;
            // y = points.length % 3 * height/3 + 15;
            points.push([x, y]); // :TODO: x and y values must be based on the size of the svg
            let shapeObj = OPTIONS.shapeVars[Math.floor(Math.random() * OPTIONS.shapeVars.length)];
            
            let color = OPTIONS.colorVars[Math.floor(Math.random() * OPTIONS.colorVars.length)];
            
            let angle = function() {
                let a = Math.random() * (OPTIONS.angle_rand * 2) + 180 - OPTIONS.angle_rand/2;
                if (a > OPTIONS.angle_rand / 2 + 180) a += 180 - OPTIONS.angle_rand;
                return a + 25;
            }();
            // note: transform property is skewing the origin of the element.
            // for some reason it is spinning as 'transform-origin: left;' by default
            // it's ok for this case, but if you want to rotate the element around its center
            // you need to do something
            html += `<g transform='translate(${x}, ${y}) rotate(${angle}) scale(0.6)'>
                       <g class='animated'>
                         <path class='${shapeObj.name} ${color}' d='${shapeObj.bulbPath}'></path>
                         <path class='garlandize-glow ${shapeObj.name} ${color}' d='${shapeObj.bulbPath}'></path>
                         <path d='${shapeObj.capPath}'></path>
                       </g>
                     </g>`;
        };

        
        element.appendChild(svg);
        svg.insertAdjacentHTML("beforeend", html);
        svg.insertAdjacentHTML("beforeend", svgPath(points, bezierCommand));

        // SVG RFC still very limited. I need to generate whole radialgradient tag for each object (can't use stop color tag as class)
        // This is specific code for this sprite :TODO: make code more generic (I'll do it if this repo will get atleast 50 stars :)
        var colors = [{klass: "blue-bulb", mid_color: "#f15a24", end_color:'#c1272d'},
                      {klass: "red-bulb", mid_color: "red", end_color:'#ba1c24'},
                      {klass: "orange-bulb", mid_color: "#0071bc", end_color:'#2e3192'},
                      {klass: "green-bulb",  mid_color: "#009245", end_color:'#005445'},
                      {klass: "yellow-bulb", mid_color: "#fff380", end_color:'gold'},
                      {klass: "violet-bulb", mid_color: "#cc99ff", end_color:'#660099'}]
        var shapes = [{klass: 'long-bulb', cx: "28.83", cy: "57.22", gradientTransform: "matrix(0.99,-0.11,0.09,0.84,-26.95,-22.33)"},
                      {klass: 'mid-bulb', cx: "-64.01", cy: "-680.08", gradientTransform: "matrix(0.73,-0.69,0.49,0.52,398.13,327.89)"},
                      {klass: 'short-bulb', cx: "-56.06", cy: "210.55", gradientTransform: "matrix(0.76,0.64,-0.33,0.39,120.85,-33.71)"}]
        
        var defs = `<defs>
                      <filter filterUnits="userSpaceOnUse" height="500%" id="garlandize-glow" width="1100%" x="-250%" y="-90%">
                      <feGaussianBlur in="SourceGraphic" result="blur5" stdDeviation="5"></feGaussianBlur>
                      <feGaussianBlur in="SourceGraphic" result="blur10" stdDeviation="10"></feGaussianBlur>
                      <feGaussianBlur in="SourceGraphic" result="blur20" stdDeviation="20"></feGaussianBlur>
                      <feGaussianBlur in="SourceGraphic" result="blur30" stdDeviation="30"></feGaussianBlur>
                      <feGaussianBlur in="SourceGraphic" result="blur50" stdDeviation="50"></feGaussianBlur>
                      <feMerge result="blur-merged">
                        <feMergeNode in="blur5"></feMergeNode>
                        <feMergeNode in="blur10"></feMergeNode>
                        <feMergeNode in="blur20"></feMergeNode>
                        <feMergeNode in="blur30"></feMergeNode>
                        <feMergeNode in="blur50"></feMergeNode>
                        <feMergeNode in="SourceGraphic"></feMergeNode>
                     </feMerge>
                     </filter>`

        var styles = `<style>
                        @keyframes garlandize-flicker { 0% { opacity: 1; }  50% { opacity: 0.4; } 100% { opacity: 1; }}
                        .garlandize-glow {filter:url(#garlandize-glow); transform: translateZ(0); will-change: transform;}
                        .green-bulb{animation: garlandize-flicker 6s infinite step-end;}
                        .yellow-bulb{animation: garlandize-flicker 6s infinite 1s step-end;}
                        .red-bulb{animation: garlandize-flicker 6s infinite 2s step-end;}
                        .blue-bulb{animation: garlandize-flicker 6s infinite 3s step-end;}
                        .orange-bulb{animation: garlandize-flicker 6s infinite 4s step-end;}
                        .violet-bulb{animation: garlandize-flicker 6s infinite 5s step-end;}`
        
        shapes.forEach(function(shape) {
            colors.forEach(function(color) {
                // hmm. js interpolation cant into spaces in the ${var}
                defs += `<radialGradient cx=${shape.cx} cy=${shape.cy}
                           gradientTransform=${shape.gradientTransform}
                           gradientUnits="userSpaceOnUse" 
                           id=${shape.klass}-${color.klass} r="13.14">
                             <stop offset="0" stop-color="#fff"></stop>
                             <stop offset="0.65" stop-color=${color.mid_color}></stop>
                             <stop offset="1" stop-color=${color.end_color}></stop>
                         </radialGradient>`
                styles += `.${shape.klass}.${color.klass} { fill: url(#${shape.klass}-${color.klass}); }`
            });
        });

        svg.insertAdjacentHTML("beforeend", defs);
        svg.insertAdjacentHTML("beforeend", styles);
    });
}

