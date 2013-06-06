self.addEventListener('message', function (e) {
    var //image = e.data.image,
        matrix = e.data.conmat,
        serMatrix = matrix.toString().split(','),
        matrixLength = serMatrix.length,
        newpx = [],
        oldpx = e.data.image.data,
        oldpxLength = oldpx.length,
        w = e.data.width,
        result;

    if (typeof divisor === 'undefined') {
        //divisor = matrixLength;
        divisor = 2;
    }
    if (typeof offset === 'undefined') {
        offset = 0;
    }

    for (var i = 0; i < oldpxLength; i++) {
        if ((i + 1) % 4 === 0) {
            newpx[i] = oldpx[i];
            continue;
        }

        result = 0;
        var these = [
            oldpx[i - w * 4 - 4] || oldpx[i],
            oldpx[i - w * 4]     || oldpx[i],
            oldpx[i - w * 4 + 4] || oldpx[i],
            oldpx[i - 4]         || oldpx[i],
            oldpx[i],
            oldpx[i + 4]         || oldpx[i],
            oldpx[i + w * 4 - 4] || oldpx[i],
            oldpx[i + w * 4]     || oldpx[i],
            oldpx[i + w * 4 + 4] || oldpx[i]
        ];

        for (var j = 0; j < matrixLength; j++) {
            result += these[j] * serMatrix[j];
        }

        result /= divisor;
        result += offset;
        newpx[i] = result;
    }

    //image.data = newpx;
    self.postMessage({image: newpx});
});