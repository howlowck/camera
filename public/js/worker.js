if (typeof SIMD === 'object') {
    importScripts('convolve.js');
} else {
    importScripts('convolve3.js');
}

self.addEventListener('message', function (e) {
    var matrix = e.data.conmat,
        oldpx = e.data.image,
        w = e.data.width,
        h = e.data.height,
        divisor = e.data.divisor,
        offset = e.data.offset,
        useSIMD = e.data.useSIMD;

    var newpx = new Uint8ClampedArray(convolve(oldpx, w, h, matrix, divisor, offset));

    self.postMessage({image: newpx, start: e.data.start, pos: e.data.pos});
});
