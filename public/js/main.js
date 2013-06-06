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
		destCtx = canvasDest.getContext('2d');

	$('canvas').on('mousemove', function (e) {
		var RGB = getRgb(e.offsetX, e.offsetY);
			//index = getPixIndex(e.offsetX, e.offsetY),
			//pixels = sourceCtx.getImageData(0, 0, video.width, video.height);
		$('.debug').empty();
		$('.debug').html('R: ' + RGB[0] + ' G: ' + RGB[1] + ' B: ' + RGB[2]);
	});


	var getPixIndex = function (x, y) {
		return (video.width * y + x - 1) * 4;
	};

	var getRgb = function (x, y) {
		var index = getPixIndex(x, y);
		var	pixels = sourceCtx.getImageData(0, 0, video.width, video.height);
		return [pixels.data[index], pixels.data[index + 1], pixels.data[index + 2]];
	};

	var onSuccess = function (stream) {
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

		var conmat = [[1, -1, 1], [1, -1, 1], [1, -1, 1]];
		var worker = new Worker(document.URL + '/public/js/convolve.js');
		var destImage;
		worker.addEventListener('message', function (e) {

			sourceCtx.drawImage(video, 0, 0, video.width, video.height);
			sourceImage = sourceCtx.getImageData(0, 0, video.width, video.height);
			destImage = destCtx.createImageData(video.width, video.height);
			for (i = 0; i < destImage.data.length; i++) {
				destImage.data[i] = e.data.image[i];
			}
			destCtx.putImageData(destImage, 0, 0);
			//image = sourceCtx.getImageData(0, 0, video.width, video.height);
			worker.postMessage({image: sourceImage, conmat: conmat, width: 320});
		});
		worker.postMessage({image: sourceImage, conmat: conmat, width: 320});
	};

	function onFail(e) {
		console.log(e);
	}

	if (navigator.getUserMedia) {
		console.log('congrats, you have getUserMedia!');
		navigator.getUserMedia({video: true}, onSuccess, onFail);
	} else {
		alert('getUserMedia is not supported in this browser.');
	}

});