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
		destCtx = canvasDest.getContext('2d'),
		conmat = [[0, 0, 0], [0, 1, 0], [0, 0, 0]],
		offset = 0,
		divisor = 1,
		updatedTime = (new Date()) * 1 - 1,
		fps = 0,
		now;
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

	var onSuccess = function (stream) {
		$("#overlay").addClass("hidden");
		$(".arrow").removeClass("hidden");
		var videoSource;
		if (window.webkitURL) {
			videoSource = window.webkitURL.createObjectURL(stream);
		} else {
			videoSource = stream;
		}
		video.autoplay = true;
		video.src = videoSource;

		sourceCtx.drawImage(video, 0, 0, video.width, video.height);
		var sourceImage = sourceCtx.getImageData(0, 0, video.width, video.height);
		var worker = new Worker(document.URL + '/public/js/convolve.js');
		var destImage;
		setUIInput(conmat, divisor, offset);
		bindUIInput();
		worker.addEventListener('message', function (e) {
			sourceCtx.drawImage(video, 0, 0, video.width, video.height);
			sourceImage = sourceCtx.getImageData(0, 0, video.width, video.height);
			destImage = destCtx.createImageData(video.width, video.height);
			for (i = 0; i < destImage.data.length; i++) {
				destImage.data[i] = e.data.image[i];
			}
			destCtx.putImageData(destImage, 0, 0);
			var thisFrameFPS = 1000 / ((now = new Date()) - updatedTime);
			fps += (thisFrameFPS - fps) / 10;
			updatedTime = now;

			worker.postMessage({image: sourceImage, conmat: conmat, width: 320, divisor: divisor, offset: offset});
		});
		worker.postMessage({image: sourceImage, conmat: conmat, width: 320, divisor: divisor, offset: offset});
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
		alert('getUserMedia is not supported in this browser.');
	}

});