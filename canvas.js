var canvas = document.getElementById("cv1");
var video = document.getElementById("vd1");
var ctx = canvas.getContext("2d");
var readout = document.getElementById('readout');
var vcontrols = document.getElementById("vcontrols");
var seekBar = document.getElementById("seek-bar");
var replayButton = document.getElementById("replay");
var analysisButton = document.getElementById("analysis");
var table = document.getElementById("table");
var xylineButton = document.getElementById("xyline");
var saveButton = document.getElementById("save");
var removeButton = document.getElementById("remove");
// var clearButton = document.getElementById("clear");
//비디오 크기
var w = video.offsetWidth;
var h = video.offsetHeight;

//클릭시 Canvas좌표 저장할 배열
var coords = [];
var xcoords = [];
var ycoords = [];
var savedCoords = [];
var time = [];
var save_time = 0;//클릭시 동영상의 시간

//좌표계 설정---------------------------------
var create_dot_arr = [];
var clickCnt = 0;
var xylineFlag = false;//xy라인 그릴지, 좌표찍을지 결정하는 flag
//-------------------------------------------

vcontrols.style.marginTop = h;
readout.style.marginTop = h + 170;
seekBar.style.width = w;

//시작 시
xylineButton.disabled = true;
saveButton.disabled = true;
removeButton.disabled = true;
// clearButton.disabled = true;

//시작 시: canvas off
canvasOff();

// 캔버스 오버레이(vedio 사이즈에 맞게)
function resizeCanvas() {
    var _w = video.offsetWidth;
    var _h = video.offsetHeight;
    var _cv = document.getElementById("cv1");
    _cv.width = _w;
    _cv.height = _h;
    vcontrols.style.marginTop = _h;
    readout.style.marginTop = _h + 170;
    seekBar.style.width = _w;
}

//캔버스 좌표--------------------------------------------------
function windowToCanvas(canvas, x, y) {
    var _bbox = canvas.getBoundingClientRect(); //viewport 기준으로 나의 위치 알려줌
    return {
        x: x - _bbox.left * (canvas.width / _bbox.width),
        y: y - _bbox.top * (canvas.height / _bbox.height)//y좌표수정
    };
}

//캔버스 숨기기
function canvasOff() {
    canvas.style.visibility = "hidden";
}

//캔버스 보이기 
function canvasOn() {
    canvas.style.visibility = "visible";
}

//비디오 replay
function replay() {
    canvasOff();
    video.currentTime = 0.0;
    video.play();
    analysisButton.disabled = false;//분석모드버튼 활성화
    xylineButton.disabled = true;//좌표계버튼 비활성화
    saveButton.disabled = true;
    // clearButton.disabled = true;
    // xylineFlag = "false";
}

//좌표 update(innerText)
function updateReadout(x, y) { //div 부분에 좌표 입력(readout)
    readout.innerText = '좌표 : (' + x.toFixed(0) + ',' + y.toFixed(0) + ')';
}

//clear버튼 : 캔버스 초기화 
function arrayinitialize() {
    coords = [];
    savedCoords = [];
    xcoords = [];
    ycoords = [];
    time = [];
}

//SCALE 좌표계 UI-------------------------------------------------------------------------------------------------------------------
function xyLine() {
    console.log("xyline버튼 클릭");
    xylineButton.disabled = true;//xyline버튼 비활성화
    alert("1.원점 클릭 2.x 최대값클릭 3.y 최대값클릭");
}

function dotDrawing(ctx, x, y, r, color) {
    if (ctx != null) {
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(x, y, r, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.restore();
    }
}

//xy좌표 라인 드로잉
function lineDrawing(ctx, sx, sy, ex, ey, color) {
    if (ctx != null) {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.restore();
    }
}

//xy좌표 선끝에 화살표모양 드로잉 
function arrowDrawing(ctx, sx, sy, ex, ey, color) {
    if (ctx != null) {
        var aWidth = 5;
        var aLength = 12;
        var dx = ex - sx;
        var dy = ey - sy;
        var angle = Math.atan2(dy, dx);
        var length = Math.sqrt(dx * dx + dy * dy);

        //두점 선긋기
        ctx.translate(sx, sy);
        ctx.rotate(angle);
        ctx.fillStyle = color;
        ctx.beginPath();

        //화살표 모양 만들기
        ctx.moveTo(length - aLength, -aWidth);
        ctx.lineTo(length, 0);
        ctx.lineTo(length - aLength, aWidth);

        ctx.fill();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
}
//좌표계 UI끝-----------------------------------------------------------------------------------------------------------------

//analysis mode 버튼 클릭 시 
function analysisMode() {
    console.log("분석모드 진입");
    xylineFlag = false;
    canvasOn();//캔버스 on
    coords = [];
    resizeCanvas();//캔버스 크기 조절
    video.pause();
    xylineButton.disabled = false;//xyline버튼
    analysisButton.disabled = true;//분석모드 버튼 비활성화
    saveButton.disabled = true;
    removeButton.disabled = true;
    // clearButton.disabled = true;
}

//테이블 생성: handsontable 생성(동적)
function drawTable() {
    var _tb1 = document.createElement("div");
    var _element = document.getElementById("handson");

    _tb1.id = "table";
    _element.appendChild(_tb1);
    var _data = [
        xcoords,
        ycoords,
        time
    ];
    var _container = document.getElementById('table');
    var hot = new Handsontable(_container, {
        data: _data,
        rowHeaders: ['x', 'y', 'time'],
        contextMenu: true
    });
    xylineFlag = false;
    var handson = document.getElementById("hot-display-license-info");
    handson.parentNode.removeChild(handson);
}

//remove 버튼 : id가 table인 div 삭제 
function divRemove() {
    var _child = document.getElementById("table");
    _child.parentNode.removeChild(_child);
    arrayinitialize();
    analysisButton.disabled = false;
    xylineButton.disabled = false;

}

//Save 버튼 : 클릭한곳의 좌표 배열에 저장
function saveCoords() {
    savedCoords = coords;//save버튼 클릭 후 바로 저장
    for (var i = 0; i < savedCoords.length; i++) {
        if (i % 2 == 0 || i == 0)//0이거나 짝수일때 x
        {
            xcoords.push(savedCoords[i]);
            console.log("xcoords : " + xcoords);
        }
        else//홀수일때 y
        {
            ycoords.push(savedCoords[i]);
            console.log("ycoords : " + ycoords);
        }
    }
    //console.log("save : " + savedCoords);
    //   var newDiv = document.createElement("div");
    analysisButton.disabled = false;
    xylineFlag.disabled = false;

    drawTable();
    arrayinitialize();
}

//onmouse : 마우스가 canvas위에 있을 때
canvas.onmousemove = function (e) { //마우스가 canvas 위에 있을 때 함수 실행
    var loc = windowToCanvas(canvas, e.clientX, e.clientY);
    //e.clientX: 마우스의 x좌표값, e.clicentY: 마우스 y좌표값
    // drawBackground();
    //drawGuidelines(loc.x, loc.y);
    updateReadout(loc.x, loc.y);
};

//배열에 좌표저장(x,y값 저장)
function storeCoordinate(x, y, array) {
    array.push(x);
    array.push(y);
}

//캔버스 컨트롤 ----------------------------------------
canvas.addEventListener('click', function (ev) {
    console.log("Canvas Click");
    var loc = windowToCanvas(canvas, ev.clientX, ev.clientY);
    var find = 0;
    ctx.fillStyle = "red";
    save_time = video.currentTime;//클릭시 시간
    //한 프레임에 하나만 찍기 : time배열에 동일한 시간이 존재하지 않도록함------------------------------
    function findtime(element) {
        if (element === save_time) return true;
    }
    find = time.findIndex(findtime);

    //analysis mode 분석모드 ------------------------------------------------------------
    //xy라인버튼 안누름
    if ((video.paused === true) && (xylineButton.disabled === false)) {
        alert("xy좌표를 먼저 설정하세요.");
        clickCnt = 0;
    }
    //xy라인버튼 누름,설정완료
    else if (xylineFlag === true) {
        console.log("xy좌표 설정 되어있음");
        saveButton.disabled = false;
        removeButton.disabled = false;
        // clearButton.disabled = false;
        if ((find === -1)) {
            ctx.beginPath();
            ctx.arc(loc.x, loc.y, 5, 0, Math.PI * 2, true);
            ctx.fill();
            storeCoordinate(loc.x, loc.y, coords);//클릭한 좌표를 coordes배열에 저장 x:짝수, y:홀수

            time.push(save_time);
            video.currentTime = save_time + 0.04;//프레임 자동으로 이동
        }
        else {
            //이상없음
        }
    }
    //xyLine xy좌표버튼 누름, 설정안함-----------------------------------------------------------------------
    else if (xylineFlag === false) {
        console.log("xy좌표 설정 하는중");
        //최신 좌표---------------------
        var x = loc.x;
        var y = loc.y;
        //------------------------------
        var r = 5;
        var c = "rgb(29, 219, 22)";
        //dotDrawing(ctx, x, y, r, c);

        //찍은 좌표 obj저장---------------------------------------------------------------------------------
        var obj = {};
        obj.color = c;
        obj.x = x;
        obj.y = y;
        obj.r = r;
        create_dot_arr.push(obj);
        //찍은 좌표 obj저장 끝-------------------------------------------------------------------------------
        console.log(create_dot_arr);
        clickCnt++;

        //첫번째점 찍었을때 = 원점 선택 
        if (clickCnt === 1) {
            var firstDot = create_dot_arr[0];
            //  ctx.translate(firstDot.x,firstDot.y);//첫번째 찍은 점을 원점으로 설정
            const point = { x: firstDot.x, y: firstDot.y };
            // const matrix = ctx.getTransform();
            const transformedPoint = {
                x: x - firstDot.x,
                y: y - firstDot.y,
            };
            console.log("변환된 점 좌표: " + transformedPoint.x + "," + transformedPoint.y);
        }
        // 두번째점 찍었을때
        else if (clickCnt === 2) {
            var firstDot = create_dot_arr[0];//첫번째 찍은점 불러옴(원점)
            var secondX = x;
            var secondY = y;
            lineDrawing(ctx, firstDot.x, firstDot.y, secondX, firstDot.y, 'yellow');
            arrowDrawing(ctx, firstDot.x, firstDot.y, secondX, firstDot.y, 'yellow');//y값은 이전값과 같게(평행)

        }
        //세번째점 찍었을때
        else if (clickCnt === 3) {
            var firstDot = create_dot_arr[0];//첫번째 찍은점 불러옴(원점)
            var thirdX = x;
            var thirdY = y;
            lineDrawing(ctx, firstDot.x, firstDot.y, firstDot.x, thirdY, 'yellow');
            arrowDrawing(ctx, firstDot.x, firstDot.y, firstDot.x, thirdY, 'yellow');//y값은 이전값과 같게(평행)
            xylineFlag = true;
            console.log("xy좌표 설정 완료.");
            obj = {};//초기화
            create_dot_arr = [];//초기화
            clickCnt = 0;
            return;
        }

    }
    else {
        console.log("무슨경우일까... flag: " + xylineFlag);
        canvasOff();
    }


});
//-----------------------------------------------------------------------------------------------

//비디오 컨트롤러, 버튼들---------------------------------------------------------
window.onload = function () {
    seekBar.addEventListener("change", function () {
        var time = video.duration * (seekBar.value / 100);
        video.currentTime = time;
    });

    // 재생시간에 따른 재생바 이동
    video.addEventListener("timeupdate", function () {
        // Calculate the slider value
        var value = (100 / video.duration) * video.currentTime;
        // Update the slider value
        seekBar.value = value;
    });
    // 재생바 드래그하려고 클릭시에 동영상 정지
    seekBar.addEventListener("mousedown", function () {
        video.pause();

    });
}