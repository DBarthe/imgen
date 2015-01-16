var imageLocation = './pink_floyd.png';
//var imageLocation = './the-scream.png';

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
var resetButton;
var play;

var likenessElem;
var counterElem;
var modifCounter = 0;

var lessDiff; 
var maxDiffPossible;

var maxLineWidth;
var maxRadius;

var drawManager;


function initialize()
{
  modelCanvas = document.getElementById('model-canvas');
  genCanvas = document.getElementById('generate-canvas');
  pausePlayButton = document.getElementById('pause-play-button');
  resetButton = document.getElementById('reset-button');
  likenessElem = document.getElementById('likeness');
  counterElem = document.getElementById('counter');


  modelCtx = modelCanvas.getContext('2d');
  genCtx = genCanvas.getContext('2d');

  drawManager = new DrawManager();

  modelImage = new Image();
  modelImage.onload = function() {
    imageWidth = modelImage.width;
    imageHeight = modelImage.height;

    maxDiffPossible = imageWidth * imageHeight * 3 * 256;
    maxRadius = (imageWidth + imageHeight) / 2 / 2;
    maxLineWidth = (imageWidth + imageHeight) / 2 / 20;

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
    
    setTimeout(displayStats, timeoutLikenessDelay);

    pausePlayButton.value = 'pause';
    resetButton.value = 'reset';
    pausePlayButton.addEventListener('click', playPause);
    resetButton.addEventListener('click', reset);

  }
  modelImage.src = imageLocation;
}

function DrawManager()
{
  var that = this;

  this.methods = [
    { name: 'circle', func: randomCircle },
    { name: 'triangle', func: randomTriangle },
    { name: 'line', func: randomLine },
    { name: 'rectangle', func: randomRectangle },
  ];

  for (var i = 0; i < this.methods.length; i++)
  {
    var name = this.methods[i].name;
    var elt = document.getElementById('enable-' + name)    
    this.methods[i].element = elt;
    elt.checked = true;
    elt.addEventListener('CheckboxStateChange', function() { that.updateFuncTable() });
  }

  this.funcTable = [];

  this.updateFuncTable();
}

DrawManager.prototype.updateFuncTable = function()
{
  this.funcTable = []
  for (var i = 0; i < this.methods.length; i++)
  {
    var method = this.methods[i]; 
    if (method.element.checked)
    {
      this.funcTable.push(method.func);
    }
  }
}

DrawManager.prototype.draw = function()
{
  var length = this.funcTable.length;
  if (length > 0)
  {
    var i = Math.floor(Math.random() * length)
    var f = this.funcTable[i];
    f();
  }
};

function playPause()
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

function reset()
{
  lessDiff = undefined;
  modifCounter = 0;

  genCtx.beginPath();
  genCtx.rect(0, 0, imageWidth, imageHeight);
  genCtx.fillStyle = 'white';
  genCtx.fill();
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
    for (var i = 0; i < 6; i++ )
    {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getRandomLineWidth()
{
  return Math.floor(Math.random() * maxLineWidth);
}

function stroke()
{
  var color = getRandomColor();
  genCtx.lineWidth = getRandomLineWidth();
  genCtx.strokeStyle = color;
  genCtx.stroke();
}

function fill()
{
  var color = getRandomColor();
  genCtx.fillStyle = color;
  genCtx.fill();
}

function fillOrStroke()
{
  if (Math.random() < 0.5)
  {
    fill();
  }
  else
  {
    stroke();
  }
}

function randomRectangle()
{
  x1 = getRandomCoord(imageWidth);
  x2 = getRandomCoord(imageWidth);

  y1 = getRandomCoord(imageHeight);
  y2 = getRandomCoord(imageHeight);

  genCtx.beginPath();
  genCtx.rect(Math.min(x1, x2), Math.min(y1, y2),
              Math.abs(x1 - x2), Math.abs(y1 - y2));

  fillOrStroke();

}

function randomLine()
{
  x1 = getRandomCoord(imageWidth);
  x2 = getRandomCoord(imageWidth);

  y1 = getRandomCoord(imageHeight);
  y2 = getRandomCoord(imageHeight);

  genCtx.beginPath();
  genCtx.moveTo(x1, y1);
  genCtx.lineTo(x2, y2);

  stroke();
}

function randomCircle()
{
  x = getRandomCoord(imageWidth);
  y = getRandomCoord(imageHeight);

  radius = Math.floor(Math.random() * maxRadius);

  genCtx.beginPath();
  genCtx.arc(x, y, radius, 0, Math.PI * 2);

  fillOrStroke();
}

function randomTriangle()
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

  fillOrStroke();
}

function generateOnce()
{
  if (play == false)
    return ;

  savedImage = genCanvas.toDataURL();

  drawManager.draw();
  genImageData = genCtx.getImageData(0, 0, imageWidth, imageHeight);

  var diff = imageDiff(modelImageData, genImageData);
  if (lessDiff == undefined || diff <= lessDiff)
  {
    modifCounter++;
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
  var value = (lessDiff == undefined ?
    0 : Math.round((1 - lessDiff / maxDiffPossible) * 100));
  var text = "likeness : " + value + "%";
  likenessElem.firstChild.nodeValue = text;
}

function displayCounter()
{
  var text = "counter : " + modifCounter;
  counterElem.firstChild.nodeValue = text;
}

function displayStats()
{
  displayLikeness();
  displayCounter();
  setTimeout(displayStats, timeoutLikenessDelay);
}

function setMainTimeout()
{
  timeoutId = setTimeout(generateOnce, timeoutDelay);
}

window.onload = initialize;
