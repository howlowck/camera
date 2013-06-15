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
        oldPixelsLength = oldPixels.length / 4,
        newpixels = [],
        currentPixel = oldPixels[0],
        nextPixel = oldPixels[4],
        topDim = 0,
        bottomDim = width * 4,
        v000 = null,
        v001 = null,
        v002 = null,
        v010 = null,
        v011 = currentPixel,
        v012 = nextPixel,
        v020 = null,
        v021 = oldPixels[bottomDim],
        v022 = oldPixels[bottomDim + 4];
    currentPixel = oldPixels[1];
    var v100 = null,
        v101 = null,
        v102 = null,
        v110 = null,
        v111 = currentPixel,
        v112 = oldPixels[5],
        v120 = null,
        v121 = oldPixels[bottomDim + 1],
        v122 = oldPixels[bottomDim + 5];
    currentPixel = oldPixels[2];
    var v200 = null,
        v201 = null,
        v202 = null,
        v210 = null,
        v212 = currentPixel,
        v211 = oldPixels[6],
        v220 = null,
        v221 = oldPixels[bottomDim + 2],
        v222 = oldPixels[bottomDim + 6],
        result = 0;

    for (var i = 0; i < oldPixelsLength; i++) {
        currentPixel = nextPixel;
        nextPixel = oldPixels[i + 4] || null;
        topDim = i - width * 4;
        bottomDim = i + width * 4;

        if ((i + 1) % 4 === 0) {
            newpixels[i] = currentPixel;
            continue;
        }
        result = 0;
        result += v000 * cmat0;
        result += v001 * cmat1;
        result += v002 * cmat2;
        result += v010 * cmat3;
        result += v011 * cmat4;
        result += v012 * cmat5;
        result += v020 * cmat6;
        result += v021 * cmat7;
        result += v022 * cmat8;

        result /= divisor;
        newpixels[i] = result + offset;

        result = 0;
        result += v100 * cmat0;
        result += v101 * cmat1;
        result += v102 * cmat2;
        result += v110 * cmat3;
        result += v111 * cmat4;
        result += v112 * cmat5;
        result += v120 * cmat6;
        result += v121 * cmat7;
        result += v122 * cmat8;

        result /= divisor;
        newpixels[i + 1] = result + offset;

        result = 0;
        result += v200 * cmat0;
        result += v201 * cmat1;
        result += v202 * cmat2;
        result += v210 * cmat3;
        result += v211 * cmat4;
        result += v212 * cmat5;
        result += v220 * cmat6;
        result += v221 * cmat7;
        result += v222 * cmat8;

        result /= divisor;
        newpixels[i + 2] = result + offset;

        newpixels[i + 3] = oldPixels[i + 3];
        //Reassign Variables
        //currentPixel = oldPixels[i];
        
        topDim = i - width * 4,
        bottomDim = i + width * 4,
        v000 = v001 || oldPixels[topDim] || null;
        v001 = v002 || oldPixels[topDim + 4] || null;
        v002 = oldPixels[topDim + 8] || null;
        v010 = v011 || oldPixels[i] || null;
        v011 = v012 || null;
        v012 = oldPixels[i + 8] || null;
        v020 = v021 || oldPixels[bottomDim] || null;
        v021 = v022 || oldPixels[bottomDim + 4] || null;
        v022 = oldPixels[bottomDim + 8] || null;

        v100 = v101 || oldPixels[topDim + 1] || null;
        v101 = v102 || oldPixels[topDim + 5] || null;
        v102 = oldPixels[topDim + 9] || null;
        v110 = v111 || oldPixels[i + 1] || null;
        v111 = v112 || null;
        v112 = oldPixels[i + 9] || null;
        v120 = v121 || oldPixels[bottomDim + 1] || null;
        v121 = v122 || oldPixels[bottomDim + 5] || null;
        v122 = oldPixels[bottomDim + 9] || null;

        v200 = v201 || oldPixels[topDim + 2] || null;
        v201 = v202 || oldPixels[topDim + 6] || null;
        v202 = oldPixels[topDim + 10] || null;
        v210 = v211 || oldPixels[i + 2] || null;
        v211 = v212 || null;
        v212 = oldPixels[i + 10] || null;
        v220 = v221 || oldPixels[bottomDim + 2] || null;
        v221 = v222 || oldPixels[bottomDim + 6] || null;
        v222 = oldPixels[bottomDim + 10] || null;

    }
    return newpixels;
};

