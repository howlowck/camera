var convolve = function (oldPixels, width, convolveMatrix, divisor, offset) {
    var conMatrixFlatten = convolveMatrix.toString().split(','),
        conMatrixLength = conMatrixFlatten.length,
        oldPixelsLength = oldPixels.length,
        newpixels = [];

    for (var i = 0; i < oldPixelsLength; i++) {
        if ((i + 1) % 4 === 0) {
            newpixels[i] = oldPixels[i];
            continue;
        }

        result = 0;
        var these = [
            oldPixels[i - width * 4 - 4] || oldPixels[i],
            oldPixels[i - width * 4]     || oldPixels[i],
            oldPixels[i - width * 4 + 4] || oldPixels[i],
            oldPixels[i - 4]         || oldPixels[i],
            oldPixels[i],
            oldPixels[i + 4]         || oldPixels[i],
            oldPixels[i + width * 4 - 4] || oldPixels[i],
            oldPixels[i + width * 4]     || oldPixels[i],
            oldPixels[i + width * 4 + 4] || oldPixels[i]
        ];

        for (var j = 0; j < conMatrixLength; j++) {
            result += these[j] * conMatrixFlatten[j];
        }
        result /= divisor;
        newpixels[i] = result + offset; //workaround
    }
    return newpixels;
};

