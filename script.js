const sym = require('/node_modules/symbol-sdk');
const repo = new sym.RepositoryFactoryHttp('https://symbol-mikun.net:3001');
const accountRepo = repo.createAccountRepository();
const Mosaic_ID = "0C1058BB20787615";
console.log("Check Mosaic_ID =====",Mosaic_ID);

var isMovieScanning = false;
var video = document.createElement("video");
var canvasElement= document.createElement('canvas');
var canvas = canvasElement.getContext("2d");

document.getElementsByTagName('body')[0].appendChild(canvasElement);

function drawLine(begin, end, color) {
    canvas.beginPath();
    canvas.moveTo(begin.x, begin.y);
    canvas.lineTo(end.x, end.y);
    canvas.lineWidth = 4;
    canvas.strokeStyle = color;
    canvas.stroke();
}

function tick() {
    if(!isMovieScanning){return;}
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvasElement.hidden = false;
        canvasElement.width  = video.videoWidth;
        canvasElement.height = video.videoHeight;
        getCode(video);
    }
    requestAnimationFrame(tick);
}

function getCode(src){

    canvas.drawImage(src, 0, 0, canvasElement.width, canvasElement.height);
    var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
    var code = jsQR(imageData.data, imageData.width, imageData.height, {inversionAttempts: "dontInvert"});

    if (code) {
        stopVideo();
        drawLine(code.location.topLeftCorner        , code.location.topRightCorner      ,"#FF3B58");
        drawLine(code.location.topRightCorner       , code.location.bottomRightCorner   ,"#FF3B58");
        drawLine(code.location.bottomRightCorner    , code.location.bottomLeftCorner    ,"#FF3B58");
        drawLine(code.location.bottomLeftCorner     , code.location.topLeftCorner       ,"#FF3B58");
        parseData(code);
    }
}

function startVideo(){

    isMovieScanning = true;
    navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: "environment"
        }
    })
    .then(function(stream) {
        video.srcObject = stream;
        window.localStream = stream;
        video.setAttribute("playsinline", true);
        video.play();
        requestAnimationFrame(tick);
    });
}

function stopVideo(){
    isMovieScanning = false;
    if(window.localStream != undefined){
        window.localStream.getTracks().forEach( (track) => {
            track.stop();
        });
    }
}

function clearRect(){
    canvas.clearRect(0, 0, canvasElement.width, canvasElement.height);
}

function parseData(code){


   const json = JSON.parse(code.data);
   const tx=sym.TransactionMapping.createFromPayload(json.data.payload)
   const address=tx.recipientAddress
   console.log(address);


  let flag = false;
  accountRepo.getAccountInfo(address)
    .toPromise()
    .then((accountInfo) => {
        console.log("accountInfo=",accountInfo)     
        console.log("Mosaicsの数 =",accountInfo.mosaics.length);
        
        
             for (let i=0; i < accountInfo.mosaics.length; i++){
                        if (accountInfo.mosaics[i].id.id.toHex() === Mosaic_ID){
                           console.log(accountInfo.mosaics[i].id.id.toHex());
                           console.log(`OK🟢`);
                          // alert(`認証OK`,"");
                          flag = true;
                          swal(`モザイク認証OK`,"");
                          return
                        }else{
                           console.log(accountInfo.mosaics[i].id.id.toHex()); 
                           console.log(`NG🔴`); 
                           flag = false;                                         
                        }
             }
             if (flag === false){
                 swal(`モザイク認証NG`,"");
             } 
  })   


}

startVideo();


//////////////////////////////////////////////////////////////////


         
