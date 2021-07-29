var canvas = document.getElementById("cv1");
var ctx = canvas.getContext("2d");

var xylineFlag = false;
var tableFlag = false;

//클릭시 Canvas좌표 저장할 배열*******************목요일의 내가 레퍼런스전달하는걸로 바꿔서 코드 짜기*******************
var coords = [];
var xcoords = [];
var ycoords = [];
var savedCoords = [];
var time = [];

//좌표계 설정---------------------------------*******************여기도 레퍼런스로부탁해;ㅎ*******************
var create_dot_arr = [];
var clickCnt = 0;

var defalut = 1;
var screendot = 0;
//-------------------------------------------

function init() {
    var saveButton = document.getElementById("save");
    var inputform = document.getElementById("inputform");
    var input = document.getElementById("input1");
    var xylineButton = document.getElementById("xyline");
    var seekBar = document.getElementById("seek-bar");
    var video = document.getElementById("vd1");
    var vcontrols = document.getElementById("vcontrols");
    //비디오 크기
    var w = video.offsetWidth;
    var h = video.offsetHeight;
    vcontrols.style.marginTop = h;
    // readout.style.marginTop = h + 300;
    seekBar.style.width = w;

    //시작 시
    xylineButton.disabled = true;
    saveButton.disabled = true;
    input.disabled = true;
    //시작 시: canvas off
    canvasOff();
    //input 리로딩 해제

    inputform.addEventListener('submit', handleSubmit);
    resizeCanvas();

}
window.onresize = function (event) {
    init();
}
//캔버스 숨기기
function canvasOff() {
    canvas.style.visibility = "hidden";
}

//캔버스 보이기 
function canvasOn() {
    canvas.style.visibility = "visible";
}

// 캔버스 오버레이(vedio 사이즈에 맞게)
function resizeCanvas() {
    var video = document.getElementById("vd1");
    var _w = video.offsetWidth;
    var _h = video.offsetHeight;
    var seekBar = document.getElementById("seek-bar");
    var vcontrols = document.getElementById("vcontrols");
    canvas.width = _w;
    canvas.height = _h;
    vcontrols.style.marginTop = _h;
    // readout.style.marginTop = _h + 300;
    seekBar.style.width = _w;
}

//onmouse : 마우스가 canvas위에 있을 때
canvas.onmousemove = function (e) { //마우스가 canvas 위에 있을 때 함수 실행
    var dot = create_dot_arr[0];
    //defalut = getValue();
    var showX = e.clientX - dot.x;
    var showY = e.clientY - dot.y;
    if (showX == -0 || showY == -0) {
        showX = 0;
        showY = 0;
    }
    var loc = windowToCanvas(canvas, showX, -showY);
    updateReadout(loc.x * defalut, loc.y * defalut);//픽셀값으로 나눔 , 8px=1cm
};

//캔버스 좌표--------------------------------------------------
function windowToCanvas(canvas, x, y) {
    var _bbox = canvas.getBoundingClientRect(); //viewport 기준으로 나의 위치 알려줌
    return {
        x: x - _bbox.left * (canvas.width / _bbox.width),
        y: y - _bbox.top * (canvas.height / _bbox.height)//y좌표수정
    };
}

//캔버스 가이드 길이 (오른쪽하단)
function guidelength() {
    //라인
    //*************80픽셀을 10센치로 가정함******************************** */
    ctx.beginPath();
    // ctx.strokeStyle = color;
    ctx.moveTo(canvas.width - 130, canvas.height - 50);
    ctx.lineTo(canvas.width - 50, canvas.height - 50);
    ctx.lineWidth = "10";
    ctx.strokeStyle = "red";
    ctx.stroke();
    //텍스트
    ctx.font = 'bold 20px Courier';
    ctx.fillStyle = "red";
    ctx.fillText('10cm', canvas.width - 105, canvas.height - 70);
}

//캔버스 xy좌표계 UI-------------------------------------------------------------------------------------------------------------------
function xyLine() {
    var xylineButton = document.getElementById("xyline");
    console.log("xyline버튼 클릭");
    resizeCanvas();
    xylineButton.disabled = true;//xyline버튼 비활성화
    alert("원점 클릭 -> x최댓값 클릭 -> y 최댓값 클릭");
    //guidelength();
}

//캔버스 좌표 드로잉---------------------------------------------------------------------------------------------------------
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

//캔버스 xy좌표 선끝에 화살표모양 드로잉 
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

//캔버스 input 값 가져오기
function getInput() {
    var input = document.getElementById("input1");
    return input.value;
}

//테이블 생성 Save 버튼 : 클릭한곳의 좌표 배열에 저장
function saveCoords() {
    var analysisButton = document.getElementById("analysis");
    savedCoords = coords;//save버튼 클릭 후 바로 저장
    for (var i = 0; i < savedCoords.length; i++) {
        if (i % 2 == 0 || i == 0)//0이거나 짝수일때 x
        {
            xcoords.push(savedCoords[i]);
        }
        else if (i % 2 == 1)//홀수일때 y
        {
            ycoords.push(savedCoords[i]);
        }
    }
    //console.log("save : " + savedCoords);
    //   var newDiv = document.createElement("div");
    analysisButton.disabled = false;
    xylineFlag.disabled = false;

    drawTable();
    arrayinitialize();

}

//배열에 좌표저장(x,y값 저장)
function storeCoordinate(x, y, array) {
    array.push(x);
    array.push(y);
    console.log("array " + array);
}

//캔버스 컨트롤 ----------------------------------------
canvas.addEventListener('click', function (ev) {
    console.log("Canvas Click");
    var xylineButton = document.getElementById("xyline");
    var video = document.getElementById("vd1");
    var save_time = 0;//클릭시 동영상의 시간
    console.log("클라이언트엑스:" + ev.clientX);
    var loc = windowToCanvas(canvas, ev.clientX, ev.clientY);
    var find = 0;
    ctx.fillStyle = "red";
    save_time = video.currentTime;//클릭시 시간
    //최신 좌표---------------------
    var x = loc.x;
    var y = loc.y;
    var r = 5;
    var c = "rgb(29, 219, 22)";
    //------------------------------
    var dot = create_dot_arr[0];//원점
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
        var saveButton = document.getElementById("save");
        saveButton.disabled = false;
        // clearButton.disabled = false;
        if ((find === -1)) {
            ctx.beginPath();
            ctx.arc(loc.x, loc.y, 5, 0, Math.PI * 2, true);
            ctx.fill();
            //클릭한 좌표를 coordes배열에 저장 x:짝수, y:홀수, 8px=1cm(기본값)으로 나눔
            //+,-를 붙여줌 -> number로 반환
            storeCoordinate(+((loc.x - dot.x) * defalut).toFixed(3), -((loc.y - dot.y) * defalut).toFixed(3), coords);

            time.push(save_time);
            video.currentTime = save_time + 0.04;//프레임이동 
        }
        else {
            //이상없음
        }
    }
    //xyLine xy좌표버튼 누름, 설정안함-----------------------------------------------------------------------
    else if (xylineFlag === false) {
        console.log("xy좌표 설정 하는중");
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
        var dot = create_dot_arr[0];//원점


        if (clickCnt === 2) {
            var firstDot = create_dot_arr[0];//첫번째 찍은점 불러옴(원점)
            //X축 점 저장(두번째점)------------------------------------------
            var secondDot = create_dot_arr[1];
            screendot = secondDot.x - firstDot.x;
            //------------------------------------------------------------------
            var secondX = x;
            var secondY = y;
            ctx.lineWidth = "1";
            lineDrawing(ctx, firstDot.x, firstDot.y, secondX, firstDot.y, 'yellow');
            arrowDrawing(ctx, firstDot.x, firstDot.y, secondX, firstDot.y, 'yellow');//y값은 이전값과 같게(평행)

        }
        //세번째점 찍었을때
        else if (clickCnt === 3) {
            var input = document.getElementById("input1");
            var firstDot = create_dot_arr[0];//첫번째 찍은점 불러옴(원점)
            var thirdX = x;
            var thirdY = y;
            lineDrawing(ctx, firstDot.x, firstDot.y, firstDot.x, thirdY, 'yellow');
            arrowDrawing(ctx, firstDot.x, firstDot.y, firstDot.x, thirdY, 'yellow');//y값은 이전값과 같게(평행)
            xylineFlag = true;
            console.log("xy좌표 설정 완료.");
            alert("X좌표의 길이를 입력하세요.");
            input.disabled = false;
            obj = {};//초기화
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
//readout 좌표 update(innerText)
function updateReadout(x, y) { //div 부분에 좌표 입력(readout)
    var readout = document.getElementById('readout');
    readout.innerText = '좌표 : (' + x.toFixed(3) + ',' + y.toFixed(3) + ')';//고정 소수점 표기법으로 표기
}

//clear버튼 : 배열들 초기화 
function arrayinitialize() {
    coords = [];
    savedCoords = [];
    xcoords = [];
    ycoords = [];
    time = [];
}

//비디오 replay
function replay() {
    var input = document.getElementById("input1");
    var saveButton = document.getElementById("save");
    var xylineButton = document.getElementById("xyline");
    var analysisButton = document.getElementById("analysis");
    var video = document.getElementById("vd1");
    canvasOff();
    create_dot_arr = [];//초기화
    video.currentTime = 0.0;
    video.play();
    analysisButton.disabled = false;//분석모드버튼 활성화
    xylineButton.disabled = true;//좌표계버튼 비활성화
    saveButton.disabled = true;
    input.disabled = true;
    // clearButton.disabled = true;
    // xylineFlag = "false";
    resizeCanvas();
}

function clearCanvas() {
    var analysisButton = document.getElementById("analysis");
    var input = document.getElementById("input1");
    var saveButton = document.getElementById("save");
    var xylineButton = document.getElementById("xyline");
    var analysisButton = document.getElementById("analysis");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvasOff();
    analysisButton.disabled = false;//분석모드버튼 활성화
    xylineButton.disabled = true;//좌표계버튼 비활성화
    saveButton.disabled = true;
    input.disabled = true;
    create_dot_arr = [];//초기화
    coords = [];
}

//submit 입력 버튼 클릭시 리로딩 없이 값 초기화
function handleSubmit(event) {
    var input = document.getElementById("input1");
    event.preventDefault();
    defalut = getValue();
    console.log(
        "좌표에 곱해질 값 : " + defalut
    );
    //input 초기화
    input.value = '';
    input.disabled = true;
}

//값 받기
function getValue() {
    var input = document.getElementById("input1");
    var origin = screendot;
    var currentValue = input.value;
    //값 보내기
    if (input.value = '') {
        currentValue = 8;
    }
    else {
        currentValue = currentValue / origin;
    }
    return currentValue;
}

//분석 모드 버튼 클릭 시 
function analysisMode() {
    var saveButton = document.getElementById("save");
    var xylineButton = document.getElementById("xyline");
    var analysisButton = document.getElementById("analysis");
    var video = document.getElementById("vd1");
    console.log("분석모드 진입");
    create_dot_arr = [];//원점 초기화
    xylineFlag = false;
    canvasOn();//캔버스 on
    coords = [];
    resizeCanvas();//캔버스 크기 조절
    video.pause();
    xylineButton.disabled = false;//xyline버튼
    analysisButton.disabled = true;//분석모드 버튼 비활성화
    saveButton.disabled = true;
    // clearButton.disabled = true;
}

function gobackFrame() {
    var video = document.getElementById("vd1");
    video.currentTime = video.currentTime - 0.04;
}

function gofowardFrame() {
    var video = document.getElementById("vd1");
    video.currentTime = video.currentTime + 0.04;
}

//테이블 생성: handsontable 생성(동적)
function drawTable() {
    tableFlag = true;
    var _tb1 = document.createElement("div");
    var _element = document.getElementById("handson");
    _tb1.id = "table";
    _element.appendChild(_tb1);
    var _data = [
        xcoords,
        ycoords,
        time
    ];
    console.log("xcoords: " + xcoords);
    console.log("ycoords: " + ycoords);
    console.log("time: " + time);
    var _container = document.getElementById('table');
    var hot = new Handsontable(_container, {
        data: _data,
        rowHeaders: ['x', 'y', 'time'],
        contextMenu: true
    });
    //표수정시 수정버튼 클릭 ---------------------
    // var exportString = document.getElementById("export-string")
    // exportString.addEventListener("click", function (event) {
    //     var modify = hot.getPlugin("exportFile").exportAsString("csv");
    //     const rows = modify.split('\r\n');
    //     xcoords = [];
    //     ycoords = [];
    //     time = [];
    //     xcoords = rows[0]
    //     ycoords = rows[1]
    //     time = rows[2]
    //     console.log("(수정)xcoords: " + xcoords);
    //     console.log("(수정)ycoords: " + ycoords);
    //     console.log("(수정)time: " + time);
    // });
    //--------------------------------------------
    //  xylineFlag = false;
    var handson = document.getElementById("hot-display-license-info");
    handson.parentNode.removeChild(handson);

}

//테이블 remove 버튼 : id가 table인 div 삭제 
function divRemove() {
    var _child = document.getElementById("table");
    var xylineButton = document.getElementById("xyline");
    var analysisButton = document.getElementById("analysis");
    _child.parentNode.removeChild(_child);
    arrayinitialize();
    analysisButton.disabled = false;
    xylineButton.disabled = false;
    xylineFlag = false;
    create_dot_arr = [];//원점 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);

}



//비디오 컨트롤러, 버튼들---------------------------------------------------------
window.onload = function () {
    var video = document.getElementById("vd1");
    var seekBar = document.getElementById("seek-bar");
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

init();