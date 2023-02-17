// To get the relative position from center of canvas
export const getRelativePosition = (x, y, rect) => {
    // Get the mouse position relative to top leftof canvas
    x = x - rect.left;
    y = y - rect.top;
    y = -y // Reflect about y-axis
    
    // Get the mouse position relative to center of canvas
    x = x - (0.5 * rect.width);
    y = y + (0.5 * rect.height);
    
    return [x / (0.5 * rect.width), y / (0.5 * rect.height)]; // Normalize to clip space coordinate
}

export const rotatePoints = (x0, y0, xc, yc, deg) => {
    const degInRadiant = deg*Math.PI/180
    const x1 = (x0 - xc)*Math.cos(degInRadiant) - (y0 - yc)*Math.sin(degInRadiant) + xc
    const y1 = (x0 - xc)*Math.sin(degInRadiant) + (y0 - yc)*Math.cos(degInRadiant) + yc
    return [x1, y1]
}

export const hexToRGB = hex => {
    let rgbForm = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return rgbForm ? {
      r: parseInt(rgbForm[1], 16),
      g: parseInt(rgbForm[2], 16),
      b: parseInt(rgbForm[3], 16)
    } : null;
}