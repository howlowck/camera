importScripts('convolve.js');
self.addEventListener('message', function (e) {
    var matrix = e.data.conmat,
        oldpx = e.data.image,
        w = e.data.width,
        divisor = e.data.divisor,
        offset = e.data.offset;

    var newpx = new Uint8ClampedArray(convolve(oldpx, w, matrix, divisor, offset));

    self.postMessage({image: newpx, start: e.data.start, pos: e.data.pos});
});