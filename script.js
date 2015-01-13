
var intervalId;

var modelCanvas, genCanvas;
var modelContext, genContext;
var modelImage;

var imageWidth;
var imageHeight;

var lessDiff; 

function initialize()
{
  modelCanvas = document.getElementById('model-canvas');
  genCanvas = document.getElementById('generate-canvas');
  modelContext = modelCanvas.getContext('2d');
  genContext = genCanvas.getContext('2d');

  modelImage = new Image();
  modelImage.src = './darth-vader.jpg';
  modelImage.onload = function() {
    imageWidth = modelImage.width;
    imageHeight = modelImage.height;
    modelCanvas.width = modelImage.width;
    modelCanvas.height = modelImage.height;
    genCanvas.width = modelImage.width;
    genCanvas.height = modelImage.height;
    modelContext.drawImage(modelImage, 0, 0)
    intervalId = setInterval(generateOnce, 0);
  }
}

function getPixel(data, x, y)
{
  var start_index = y * data.width * 4 + x * 4;
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
  for (var y = 0; y < imageData1.width; y++)
  {
    for (var x = 0; x < imageData1.height; x++)
    {
      var p1 = getPixel(imageData1.data,x, y);
      var p2 = getPixel(imageData2.data,x, y);
      totalDiff += pixelDiff(p1, p2);
    }
  }
  return totalDiff;
}

function getRandomCoord(max){
    return Math.floor(Math.random() * max);
}

function randomDraw()
{
  x1 = getRandomCoord(imageWidth);
  x2 = getRandomCoord(imageWidth);
  x3 = getRandomCoord(imageWidth);

  y1 = getRandomCoord(imageHeight);
  y2 = getRandomCoord(imageHeight);
  y3 = getRandomCoord(imageHeight);

  genContext.beginPath();
  genContext.moveTo(x1, y1);
  genContext.lineTo(x2, y2);
  genContext.lineTo(x3, y3);
  genContext.lineTo(x1, y1);
  genContext.fill();
}

function generateOnce()
{
  modelImageData = modelContext.getImageData(0, 0, imageWidth, imageHeight);
  savedImage = genCanvas.toDataURL();

  randomDraw();
  genImageData = genContext.getImageData(0, 0, imageWidth, imageHeight);

  var diff = imageDiff(modelImageData, genImageData);
  if (diff <= lessDiff)
  {
    lessDiff = diff;
  }
  else
  {
    var image = new Image();
    image = savedImage;
    image.onload = function() {
      genContext.drawImage(image, 0, 0);
    }
  }
}

window.onload = initialize;
