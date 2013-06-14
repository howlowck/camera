var convolve = function (oldPixels, width, convolveMatrix, divisor, offset) {
    var conMatrixFlatten = convolveMatrix.toString().split(','),
        conMatrixLength = conMatrixFlatten.length,
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
            oldPixels[topDim - 4] || currentPixel,
            oldPixels[topDim]     || currentPixel,
            oldPixels[topDim + 4] || currentPixel,
            oldPixels[i - 4]         || currentPixel,
            null,
            oldPixels[i + 4]         || currentPixel,
            oldPixels[bottomDim - 4] || currentPixel,
            oldPixels[bottomDim]     || currentPixel,
            oldPixels[bottomDim + 4] || currentPixel
        ];
        var result = 0;
        // for (var j = 0; j < conMatrixLength; j++) {
        //     result += these[j] * conMatrixFlatten[j];
        // }
        /* Unroll loop for performance but restricts to 3x3 */
        result += these[0] * conMatrixFlatten[0];
        result += these[1] * conMatrixFlatten[1];
        result += these[2] * conMatrixFlatten[2];
        result += these[3] * conMatrixFlatten[3];
        result += currentPixel * conMatrixFlatten[4];
        result += these[5] * conMatrixFlatten[5];
        result += these[6] * conMatrixFlatten[6];
        result += these[7] * conMatrixFlatten[7];
        result += these[8] * conMatrixFlatten[8];

        result /= divisor;
        newpixels[i] = result + offset;
    }
    return newpixels;
};

