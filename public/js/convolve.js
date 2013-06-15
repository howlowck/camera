var convolve = function (oldPixels, width, convolveMatrix, divisor, offset) {
    var cmat0 = convolveMatrix[0][0],
        cmat1 = convolveMatrix[0][1],
        cmat2 = convolveMatrix[0][2],
        cmat3 = convolveMatrix[1][0],
        cmat4 = convolveMatrix[1][1],
        cmat5 = convolveMatrix[1][2],
        cmat6 = convolveMatrix[2][0],
        cmat7 = convolveMatrix[2][1],
        cmat8 = convolveMatrix[2][2],
        result = 0,
        oldPixelsLength = oldPixels.length,
        newpixels = [],
        currentPixel,
        topDim,
        bottomDim;

    for (var i = 0; i < oldPixelsLength; i++) {
        currentPixel = oldPixels[i];
        topDim = i - width * 4;
        bottomDim = i + width * 4;

        if ((i + 1) % 4 === 0) {
            newpixels[i] = currentPixel;
            continue;
        }
        /* Unroll loop for performance but restricts to 3x3 */

        result += (oldPixels[topDim - 4] || null) * cmat0;
        result += (oldPixels[topDim]     || null) * cmat1;
        result += (oldPixels[topDim + 4] || null) * cmat2;
        result += (oldPixels[i - 4] || null) * cmat3;
        result += currentPixel * cmat4;
        result += (oldPixels[i + 4] || null) * cmat5;
        result += (oldPixels[bottomDim - 4] || null) * cmat6;
        result += (oldPixels[bottomDim] || null) * cmat7;
        result += (oldPixels[bottomDim + 4] || null) * cmat8;

        result /= divisor;
        newpixels[i] = result + offset;
        result = 0;
    }
    return newpixels;
};

