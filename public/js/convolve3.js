// var buf = imageData.data.buffer;
// var data8Array = new Uint8ClampedArray(buf);
// var data32Array = new Uint32Array(buf);
// var x = 110, y = 20;
// data32Array[y * width + x] =
//     (255 << 24) |
//     (0x00 << 16) |
//     (0x00 << 8) |
//     255;
// imageData.data.set(data8Array);

/**
 * SIMD.Uint32x4 = 
 ******/

 var convolve = function (oldPixels, width, height, convolveMatrix, divisor, offset, useSIMD) {
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
         bottomDim,
         simd1,
         simd2,
         simdSum;
         
     if (useSIMD) {
         for (var i = 0; i < oldPixelsLength; i++) {
             currentPixel = oldPixels[i];
             topDim = i - width * 4;
             bottomDim = i + width * 4;

             if ((i + 1) % 4 === 0) {
                 newpixels[i] = currentPixel;
                 continue;
             }
             /* Unroll loop for performance but restricts to 3x3 */
             simd1 = SIMD.int32x4(
                (oldPixels[topDim - 4] || null) * cmat0,
                (oldPixels[topDim]     || null) * cmat1,
                (oldPixels[topDim + 4] || null) * cmat2,
                (oldPixels[i - 4] || null) * cmat3
             );
             result += currentPixel * cmat4;
             simd2 = SIMD.int32x4(
                (oldPixels[i + 4] || null) * cmat5,
                (oldPixels[bottomDim - 4] || null) * cmat6,
                (oldPixels[bottomDim] || null) * cmat7,
                (oldPixels[bottomDim + 4] || null) * cmat8
             );
             simdSum = SIMD.int32x4.add(simd1,simd2);
             result += simdSum.x + simdSum.y + simdSum.z + simdSum.w;
             result /= divisor;
             newpixels[i] = result + offset;
             result = 0;
         }
         return newpixels;
    }

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