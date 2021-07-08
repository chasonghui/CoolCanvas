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
//비디오 크기
var w = video.offsetWidth;
var h = video.offsetHeight;

//클릭시 Canvas좌표 저장할 배열
var coords = [];
var xcoords = [];
var ycoords = [];
var save_coords = [];
var time = [];
var save_time = 0;//클릭시 동영상의 시간

//좌표계 설정---------------------------------
var create_dot_arr = [];
var clickCnt = 0;
//-------------------------------------------

vcontrols.style.marginTop = h;
readout.style.marginTop = h + 200;
seekBar.style.width = w;

//초기에 scalbar, 좌표계 버튼 비활성화
xylineButton.disabled = true;


canvasOff();

// 캔버스 오버레이(vedio 사이즈에 맞게)
function resizeCanvas() {
    var w = video.offsetWidth;
    var h = video.offsetHeight;
    var cv = document.getElementById("cv1");
    cv.width = w;
    cv.height = h;
    vcontrols.style.marginTop = h;
    readout.style.marginTop = h + 200;
    seekBar.style.width = w;

}

//캔버스 좌표--------------------------------------------------
function windowToCanvas(canvas, x, y) {
    var bbox = canvas.getBoundingClientRect(); //viewport 기준으로 나의 위치 알려줌
    return {
        x: x - bbox.left * (canvas.width / bbox.width),
        y: y - bbox.top * (canvas.height / bbox.height)//y좌표수정
    };
}

//캔버스 숨기기
function canvasOff() {
    canvas.style.visibility = "hidden";

}

//캔버스 보이기 
function canvasOn() {
    canvas.style.visibility = "visible";
    resizeCanvas();
}

//비디오 replay
function replay() {
    canvasOff();
    video.currentTime = 0.0;
    video.play();
    analysisButton.innerHTML = "Analysis Mode";
    analysisButton.disabled = false;
    //scalbar, 좌표계 버튼 비활성화
    xylineButton.disabled = true;
    resizeCanvas();
}

//좌표 update(innerText)
function updateReadout(x, y) { //div 부분에 좌표 입력(readout)
    readout.innerText = '좌표 : (' + x.toFixed(0) + ',' + y.toFixed(0) + ')';
}

//clear버튼 : 캔버스 초기화 
function clearMarkers() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    coords = [];
    save_coords = [];
    xcoords = [];
    ycoords = [];
    time = [];
    var handson = document.getElementById("hot-display-license-info");
    handson.parentNode.removeChild(handson);

}

//SCALE 좌표계 UI-------------------------------------------------------------------------------------------------------------------
function xyLine() {
    xylineButton.disabled = true;
    alert("1. 원점을 클릭하고 2. X축의 끝을 지정하세요.")

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

function analysisMode() {
    canvasOn();
    coords = [];
    resizeCanvas();
    video.pause();
    analysisButton.innerHTML = "Move Slider bar";
    xylineButton.disabled = false;
    analysisButton.disabled = true;
}

//테이블 생성: handsontable 생성(동적)
function drawTable() {
    var tb1 = document.createElement("div");
    var element = document.getElementById("handson");

    tb1.id = "table";
    element.appendChild(tb1);
    var data = [
        xcoords,
        ycoords,
        time
    ];
    var container = document.getElementById('table');
    var hot = new Handsontable(container, {
        data: data,
        rowHeaders: ['x', 'y', 'time'],
        contextMenu: true
    });
}

//remove 버튼 : id가 table인 div 삭제 
function divRemove() {
    var child = document.getElementById("table");
    child.parentNode.removeChild(child);
    clearMarkers();

}

//Save 버튼 : 클릭한곳의 좌표 배열에 저장
function saveCoords() {
    save_coords = coords;//save버튼 클릭 후 바로 저장
    for (var i = 0; i < save_coords.length; i++) {
        if (i % 2 == 0 || i == 0)//0이거나 짝수일때 x
        {
            xcoords.push(save_coords[i]);
            console.log("xcoords : " + xcoords);
        }
        else//홀수일때 y
        {
            ycoords.push(save_coords[i]);
            console.log("ycoords : " + ycoords);
        }
    }
    console.log("save : " + save_coords);
    //   var newDiv = document.createElement("div");
    drawTable();
    clearMarkers();
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

//canvas 컨트롤 ----------------------------------------
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
    console.log("time 배열 : " + time);

    //스케일바 버튼을 안눌렀을때만 
    if ((video.paused === true) && (xylineButton.disabled === false)) {
        if ((find === -1)) {
            ctx.beginPath();
            ctx.arc(loc.x, loc.y, 5, 0, Math.PI * 2, true);
            ctx.fill();
            storeCoordinate(loc.x, loc.y, coords);//클릭한 좌표를 coordes배열에 저장 x:짝수, y:홀수

            time.push(save_time);
            video.currentTime = save_time + 0.028;//프레임 자동으로 이동
        }
        else {
            //  canvasOff();
        }
    }
    else if (xylineButton.disabled === true) {
        var x = loc.x;
        var y = loc.y;
        var r = 5;
        var c = "rgb(29, 219, 22)";

        //dotDrawing(ctx, x, y, r, c);
        clickCnt++;
        console.log(clickCnt % 2);
        if (clickCnt % 2 === 0) {
            console.log("연결선 !");
            var beforeDot = create_dot_arr[0];
            var beforeX = beforeDot.x;
            var beforeY = beforeDot.y;
            lineDrawing(ctx, beforeX, beforeY, x, beforeY, 'yellow');
            arrowDrawing(ctx, beforeX, beforeY, x, beforeY, 'yellow');//y값은 이전값과 같게(평행)
            create_dot_arr = [];
        } else {
            var obj = {};
            obj.color = c;
            obj.x = x;
            obj.y = y;
            obj.r = r;
            create_dot_arr.push(obj);
        }
    }
    else {
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