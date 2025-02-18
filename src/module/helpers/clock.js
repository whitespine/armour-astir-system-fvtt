// export let size = 3;
// export let value = 0;
// export let width = "128px";

// Taken from a medium article https://marian-caikovski.medium.com/drawing-sectors-and-pie-charts-with-svg-paths-b99b5b6bf7bd
function createSlicePath(radius, startAngle, endAngle, origin) {
    origin ??= {x: 0, y: 0};
    const isCircle = endAngle - startAngle === 360;
    if (isCircle) {
        endAngle--;
    }
    const start = polarToCartesian(origin, radius, startAngle);
    const end = polarToCartesian(origin, radius, endAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    const d = ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y];
    if (isCircle) {
        d.push("Z");
    } else {
        d.push("L", origin.x, origin.y, "L", start.x, start.y, "Z");
    }
    return d.join(" ");
}

// Converts coordinates
function polarToCartesian(origin, radius, angleInDegrees) {
    let radians = ((angleInDegrees - 90) * Math.PI) / 180;
    return {
        x: Math.round(origin.x + radius * Math.cos(radians)),
        y: Math.round(origin.y + radius * Math.sin(radians)),
    };
}

export function clockSlice(index, outOfMax) {
    let rot = 360.0 / outOfMax;
    return createSlicePath(90, rot*index, rot*(index + 1), {x: 100, y: 100}); // Assumes a svg viewpane of [0,200] x [0,200]
}

export function clock(path, size, value) {
    let slices = [];
    for(let index=0; index<size; index++) {
        slices.push(`<path d="${clockSlice(index, size)}" class="${value > index ? 'filled' : 'unfilled'}" data-value="${index}" />`)
    }
    console.log(slices);
    return `<svg viewbox="0 0 200 200" style="width: 100px; height: 100px" data-path="${path}">
        <g class="sectors">
            ${slices.join("")}
        </g>
    </svg>`;
}

Handlebars.registerHelper('clock-slice', clockSlice);
Handlebars.registerHelper('clock', clock);