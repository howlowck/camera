var convolve = function (oldPixels, width, convolveMatrix, divisor, offset) {
    var //conMatrixFlatten = convolveMatrix.toString().split(','),
        cmat0 = convolveMatrix[0][0],
        cmat1 = convolveMatrix[0][1],
        cmat2 = convolveMatrix[0][2],
        cmat3 = convolveMatrix[1][0],
        cmat4 = convolveMatrix[1][1],
        cmat5 = convolveMatrix[1][2],
        cmat6 = convolveMatrix[2][0],
        cmat7 = convolveMatrix[2][1],
        cmat8 = convolveMatrix[2][2],
        //conMatrixLength = conMatrixFlatten.length,
        oldPixelsLength = oldPixels.length,
        newpixels = [];

    for (var i = 0; i < oldPixelsLength; i++) {
        var currentPixel = oldPixels[i],
            topDim = i - width * 4,
            bottomDim = i + width * 4;

        if ((i + 1) % 4 === 0) {
            newpixels[i] = currentPixel;
            continue;
        }

        var these = [
            oldPixels[topDim - 4] || null,
            oldPixels[topDim]     || null,
            oldPixels[topDim + 4] || null,
            oldPixels[i - 4]         || null,
            null,
            oldPixels[i + 4]         || null,
            oldPixels[bottomDim - 4] || null,
            oldPixels[bottomDim]     || null,
            oldPixels[bottomDim + 4] ||null 
        ];
        var result = 0;
        // for (var j = 0; j < conMatrixLength; j++) {
        //     result += these[j] * conMatrixFlatten[j];
        // }
        /* Unroll loop for performance but restricts to 3x3 */
        result += these[0] * cmat0;
        result += these[1] * cmat1;
        result += these[2] * cmat2;
        result += these[3] * cmat3;
        result += currentPixel * cmat4;
        result += these[5] * cmat5;
        result += these[6] * cmat6;
        result += these[7] * cmat7;
        result += these[8] * cmat8;

        result /= divisor;
        newpixels[i] = result + offset;
    }
    return newpixels;
};

