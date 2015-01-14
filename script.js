var imageLocation = './firefox.png';
var timeoutId;
var timeoutDelay = 0;
var timeoutLikenessDelay = 100;

var modelCanvas, genCanvas;
var modelCtx, genCtx;
var modelImage;
var modelImageData;

var imageWidth;
var imageHeight;

var pausePlayButton;
var play;

var likeness;

var lessDiff; 
var maxDiffPossible;

function initialize()
{
  modelCanvas = document.getElementById('model-canvas');
  genCanvas = document.getElementById('generate-canvas');
  pausePlayButton = document.getElementById('pause-play-button');
  likeness = document.getElementById('likeness');

  modelCtx = modelCanvas.getContext('2d');
  genCtx = genCanvas.getContext('2d');

  modelImage = new Image();
  modelImage.onload = function() {
    imageWidth = modelImage.width;
    imageHeight = modelImage.height;

    maxDiffPossible = imageWidth * imageHeight * 3 * 256;

    modelCanvas.width = modelImage.width;
    modelCanvas.height = modelImage.height;
    modelCtx.drawImage(modelImage, 0, 0)
    modelImageData = modelCtx.getImageData(0, 0, imageWidth, imageHeight);

    genCanvas.width = modelImage.width;
    genCanvas.height = modelImage.height;
    genCtx.beginPath();
    genCtx.rect(0, 0, imageWidth, imageHeight);
    genCtx.fillStyle = 'white';
    genCtx.fill();

    play = true;
    setMainTimeout();
    

    setTimeout(displayLikeness, timeoutLikenessDelay);

    pausePlayButton.value = 'pause';
    pausePlayButton.addEventListener('click', buttonClick);

  }
  modelImage.src = imageLocation;
}

function buttonClick()
{
  if (play == false)
  {
    pausePlayButton.value = 'pause';
    play = true;
    setMainTimeout();
  }
  else
  {
    play = false;
    pausePlayButton.value = 'play';
    clearTimeout(timeoutId);
    timeoutId = undefined;
  }
}


function getPixel(data, x, y)
{
  var start_index = (y * imageWidth + x) * 4;
  var r = data[start_index];
  var g = data[start_index + 1];
  var b = data[start_index + 2];
  return [r, g, b]
}

function pixelDiff(p1, p2)
{
  var delta_r = Math.abs(p1[0] - p2[0])
  var delta_g = Math.abs(p1[1] - p2[1])
  var delta_b = Math.abs(p1[2] - p2[2])
  var delta_sum = delta_r + delta_g + delta_b;
  return delta_sum;  
}

function imageDiff(imageData1, imageData2)
{
  var totalDiff = 0;
  for (var y = 0; y < imageData1.height; y++)
  {
    for (var x = 0; x < imageData1.width; x++)
    {
      var p1 = getPixel(imageData1.data,x, y);
      var p2 = getPixel(imageData2.data,x, y);
      //console.log(p1);
      //console.log(p2);
      //console.log(pixelDiff(p1, p2))
      totalDiff += pixelDiff(p1, p2);
    }
  }
  return totalDiff;
}

function getRandomCoord(max){
    return Math.floor(Math.random() * max);
}

// copy-paste from stack-overflow
function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function randomDraw()
{
  x1 = getRandomCoord(imageWidth);
  x2 = getRandomCoord(imageWidth);
  x3 = getRandomCoord(imageWidth);

  y1 = getRandomCoord(imageHeight);
  y2 = getRandomCoord(imageHeight);
  y3 = getRandomCoord(imageHeight);

  genCtx.beginPath();
  genCtx.moveTo(x1, y1);
  genCtx.lineTo(x2, y2);
  genCtx.lineTo(x3, y3);
  genCtx.lineTo(x1, y1);

  genCtx.lineWidth = Math.floor(Math.random() * 4);
  genCtx.strokeStyle = getRandomColor();
  genCtx.stroke();
}

function generateOnce()
{
  if (play == false)
    return ;

  savedImage = genCanvas.toDataURL();

  randomDraw();
  genImageData = genCtx.getImageData(0, 0, imageWidth, imageHeight);

  var diff = imageDiff(modelImageData, genImageData);
  if (lessDiff == undefined || diff <= lessDiff)
  {
    lessDiff = diff;
    setMainTimeout();
  }
  else
  {
    var image = new Image();
    image.onload = function() {
      genCtx.drawImage(image, 0, 0);
      setMainTimeout();
    }
    image.src = savedImage;
  }
}

function displayLikeness()
{
  var value = Math.round((1 - lessDiff / maxDiffPossible) * 100);
  var text = "likeness : " + value + "%";
  likeness.firstChild.nodeValue = text;
  setTimeout(displayLikeness, timeoutLikenessDelay);
}

function setMainTimeout()
{
  timeoutId = setTimeout(generateOnce, timeoutDelay);
}

window.onload = initialize;
