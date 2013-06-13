/** Shim **/
navigator.getUserMedia ||
(navigator.getUserMedia = navigator.mozGetUserMedia ||
	navigator.webkitGetUserMedia ||
	navigator.msGetUserMedia);

$(function () {
	var video = document.querySelector('#webcam'),
		canvasSource = document.querySelector('canvas#source'),
		canvasDest = document.querySelector('canvas#dest'),
		sourceCtx = canvasSource.getContext('2d'),
		sourceImage,
		workers = [],
		destCtx = canvasDest.getContext('2d'),
		workerCount = 10,
		currentWorkerCount = 0,
		useCurtain = true,
		conmat = [[0, 0, 0], [0, 1, 0], [0, 0, 0]],
		offset = 0,
		divisor = 1,
		chunksize,
		updatedTime = (new Date()) * 1 - 1,
		fps = 0,
		now,
		imageData,
		curtainSize;
	$('#source').on('mousemove', function (e) {
		var RGB = getRgb(e.offsetX, e.offsetY);
			//index = getPixIndex(e.offsetX, e.offsetY),
			//pixels = sourceCtx.getImageData(0, 0, video.width, video.height);
		$('.color .red').text(RGB[0]);
		$('.color .green').text(+ RGB[1]);
		$('.color .blue').text(RGB[2]);
	});
	$('#save').on('click', function () {
		var img = canvasDest.toDataURL("image/jpeg");
		$(".capture").attr("src", img).removeClass("hidden");
	});
	var getWorkerCountFromUrl = function () {
		var val = parseInt(window.location.search.slice(1), 10);
		if (val > 0 && val < 20) {
			workerCount = val;
		}
	};
	var setUIInput = function (defaultMatrix, defaultDivisor, defaultOffset) {
		for (var row = 0; row <= 2 ; row++) {
			for (var col = 0; col <= 2; col++) {
				$("#" + row + "_" + col).val(defaultMatrix[row][col]);
			}
		}
		$(".divisor-value").val(defaultDivisor);
		$(".offset-value").val(defaultOffset);
	};
	var setAll = function (mat, div, off) {
		conmat = mat;
		divisor = div;
		offset = off;
		setUIInput(mat, div, off);
	};
	var changeEffects = function () {
		var effects = {
			"none" : {
				mat: [[0, 0, 0], [0, 1, 0], [0, 0, 0]],
				div: 1,
				off: 0
			},
			"sharpen" : {
				mat: [[-1, -1, -1], [-1, 9, -1], [-1, -1, -1]],
				div: 1,
				off: 0
			},
			"sharpen2" : {
				mat: [[0, -3, 0], [-3, 15, -3], [0, -3, 0]],
				div: 3,
				off: 0
			},
			"edge" : {
				mat: [[1, 1, 1], [1, -7, 1], [1, 1, 1]],
				div: 1,
				off: 0
			},
			"edge2" : {
				mat: [[-7, 7, -7], [7, 0, 7], [-7, 7, -7]],
				div: 1,
				off: 0
			},
			"blur" : {
				mat: [[1, 2, 1], [2, 4, 2], [1, 2, 1]],
				div: 16,
				off: 0
			},
			"emboss" : {
				mat: [[-1, 0, 0], [0, -1, 0], [0, 0, 2]],
				div: 1,
				off: 127
			},
			"grudge" : {
				mat: [[-5, 5, -5], [5, 3, 5], [-5, 5, -5]],
				div: 1,
				off: -200
			},
			"sketch" : {
				mat: [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]],
				div: 0.4,
				off: 255
			},
			"inverted" : {
				mat: [[0, 0, 0], [0, -1, 0], [0, 0, 0]],
				div: 1,
				off: 255
			}
		};
		var data = effects[$("#effects").val()];
		if (typeof data !== 'undefined') {
			setAll(data.mat, data.div, data.off);
		}
	};
	var bindUIInput = function () {
		$(".conv-value").change(function () {
			var pos = $(this).attr("id").split("_"),
				row = pos[0],
				col = pos[1];
			conmat[row][col] = $(this).val();
			$("#effects").val("custom");
		});
		$(".offset-value").change(function () {
			offset = parseInt($(this).val(), 10);
			$("#effects").val("custom");
		});
		$(".divisor-value").change(function () {
			divisor = $(this).val();
			$("#effects").val("custom");
		});
		$("#effects").change(function () {
			changeEffects();
		});
	};
	var getPixIndex = function (x, y) {
		return (video.width * y + x - 1) * 4;
	};

	var getRgb = function (x, y) {
		var index = getPixIndex(x, y);
		var	pixels = sourceCtx.getImageData(0, 0, video.width, video.height);
		return [pixels.data[index], pixels.data[index + 1], pixels.data[index + 2]];
	};
	var createWorkers = function () {
		for (var iwork = 0; iwork < workerCount; iwork++) {
			var aWorker = new Worker(document.URL + '/public/js/worker.js');
			addWorkerEventListener(aWorker);
			workers.push(aWorker);
		}
	};
	var addWorkerEventListener = function (worker) {
		worker.addEventListener('message', function (e) {
			aggregateImage(e.data.image, e.data.start, e.data.pos);
		});
	};
	var terminateWorker = function (worker) {
		worker.terminate();
	};
	var terminateWorkers = function () {
		for (var i = 0; i < workerCount; i++) {
			terminateWorker(workers[i]);
		}
	};
	var fireWorkers = function () {
		toSource();
		for (var iwork = 0; iwork < workerCount; iwork++) {
			var fro = chunksize * iwork;
			var to = fro + chunksize;
			var pos = "middle";
			if (iwork === 0) {
				pos = "first";
			} else if (iwork === workerCount - 1 ) {
				pos = "last";
			} 
			var imgChunk = toSegment(fro, to, pos);
			workers[iwork].postMessage({
				image: imgChunk,
				conmat: conmat,
				width: 320,
				divisor: divisor,
				offset: offset,
				start: fro, 
				pos: pos
			});
		}
	};
	var toSegment = function (fro, to, pos) {
		
		if (!useCurtain) {
			return new Uint8ClampedArray(sourceImage.data.buffer.slice(fro, to));
		}
		if (pos === "middle") {
			return new Uint8ClampedArray(sourceImage.data.buffer.slice(fro - curtainSize, to + curtainSize));
		}
		if (pos === "first") {
			return new Uint8ClampedArray(sourceImage.data.buffer.slice(fro, to + curtainSize));
		}
		if (pos === "last") {
			return new Uint8ClampedArray(sourceImage.data.buffer.slice(fro - curtainSize, to));
		}
	};
	var fromSegment = function (data, pos) {
		if (pos === "middle") {
			return new Uint8ClampedArray(data.buffer.slice(curtainSize, data.length - curtainSize));
		}
		if (pos === "first") {
			return new Uint8ClampedArray(data.buffer.slice(0, data.length - curtainSize));
		}
		if (pos === "last") {
			return new Uint8ClampedArray(data.buffer.slice(curtainSize, data.length));
		}
	};
	var toSource = function () {
		sourceCtx.drawImage(video, 0, 0, video.width, video.height);
		sourceImage = sourceCtx.getImageData(0, 0, video.width, video.height);
	};
	var toDest = function (data) {
		destImage = destCtx.createImageData(video.width, video.height);
		destImage.data.set(data);
		destCtx.putImageData(destImage, 0, 0);
	};
	var aggregateImage = function (data, start, pos) {
		currentWorkerCount++;
		imageData.set(fromSegment(data, pos), start);
		if (currentWorkerCount === workerCount) {
			fireWorkers();
			toSource();
			toDest(imageData);
			// frameRate Calculation
			var thisFrameFPS = 1000 / ((now = new Date()) - updatedTime);
			fps += (thisFrameFPS - fps) / 10;
			updatedTime = now;
			// resets
			currentWorkerCount = 0;
			imageData = new Uint8ClampedArray(video.height * video.width * 4);
		}
	};
	var onSuccess = function (stream) {
		getWorkerCountFromUrl();
		$("#overlay").addClass("hidden");
		$(".arrow").removeClass("hidden");
		setUIInput(conmat, divisor, offset);
		bindUIInput();
		createWorkers();
		var videoSource,
			workerHeight;
		if (window.webkitURL) {
			videoSource = window.webkitURL.createObjectURL(stream);
		} else {
			videoSource = window.URL.createObjectURL(stream);
		}
		video.autoplay = true;
		video.src = videoSource;
		workerHeight = video.height / workerCount;
		curtainSize = video.width * 4;
		toSource();
		var destImage;
		chunksize = video.width * (video.height / workerCount) * 4;
		imageData = new Uint8ClampedArray(video.height * video.width * 4);
		fireWorkers();
	};

	function onFail(e) {
		console.log(e);
	}

	setInterval(function () {
		$(".fps span").text(fps.toFixed(2));
	}, 1000);


	if (navigator.getUserMedia) {
		console.log('congrats, you have getUserMedia!');
		navigator.getUserMedia({video: true}, onSuccess, onFail);
	} else {
		alert('Camera Feature is not supported in this browser.');
	}

});