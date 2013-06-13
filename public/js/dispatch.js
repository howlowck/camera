/** Disabled Currently because Chrome does not allow web workers to start other web workers
self.addEventListener('message', function (e) {
    worker = new Worker('convolve.js');
    worker.addEventListener('message', function (e) {
        worker.postMessage(e.data);
    });
    worker.postMessage(e.data);
    self.postMessage({image: newpx});
});