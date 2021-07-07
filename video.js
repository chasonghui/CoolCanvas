var canvas = document.getElementById("cv1");
var video = document.getElementById("vd1");
var ctx = canvas.getContext("2d");
var readout = document.getElementById('readout');
var vcontrols = document.getElementById("vcontrols");
var seekBar = document.getElementById("seek-bar");
var Replay = document.getElementById("Replay");
var Analysis_Button = document.getElementById("analysis");
var table = document.getElementById("table");
var Scalebar = document.getElementById("Scale-bar");
var xy = document.getElementById("xy");
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

vcontrols.style.marginTop = h + 50;
readout.style.marginTop = h + 200;
seekBar.style.width = w;

//초기에 scalbar, 좌표계 버튼 비활성화
Scalebar.disabled = true;
xy.disabled = true;

// 캔버스 오버레이(vedio 사이즈에 맞게)
function resize_canvas() {
    var w = video.offsetWidth;
    var h = video.offsetHeight;
    var cv = document.getElementById("cv1");
    cv.width = w;
    cv.height = h;
    vcontrols.style.marginTop = h + 50;
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
function Canvasoff() {
    canvas.style.visibility = "hidden";

}

//캔버스 보이기 
function Canvason() {
    canvas.style.visibility = "visible";
    resize_canvas();
}

//비디오 replay
function replay() {
    Canvasoff();
    video.currentTime = 0.0;
    video.play();
    Analysis_Button.innerHTML = "Analysis Mode";
    Analysis_Button.disabled = false;

    resize_canvas();
}

//좌표 update(innerText)
function updateReadout(x, y) { //div 부분에 좌표 입력(readout)
    readout.innerText = '좌표 : (' + x.toFixed(0) + ',' + y.toFixed(0) + ')';
}

//clear버튼 : 캔버스 초기화 
function clear_click() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    coords = [];
    save_coords = [];
    xcoords = [];
    ycoords = [];
    time = [];
    var handson = document.getElementById("hot-display-license-info");
    handson.parentNode.removeChild(handson);

}

function scale_bar() {
    ctx.moveTo(100, 500);
    ctx.lineTo(500, 500);
    ctx.lineWidth = 15;
    ctx.strokeStyle = "white"
    ctx.stroke();
}

//테이블 생성: handsontable 생성(동적)
function draw_table() {
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
function remove_div() {
    var child = document.getElementById("table");
    child.parentNode.removeChild(child);
    clear_click();

}

//Save 버튼 : 클릭한곳의 좌표 배열에 저장
function save_click() {
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
    draw_table();
    clear_click();
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

//canvas 클릭시좌표저장----------------------------------------
canvas.addEventListener('click', function (ev) {
    console.log("Canvas Click");
    //var t1 = video.duration * (seekBar.value / 100)
    var loc = windowToCanvas(canvas, ev.clientX, ev.clientY);
    var find = 0;
    ctx.font = '60px Calibri';
    ctx.fillStyle = "red";
    save_time = video.currentTime;//클릭시 시간
    //한 프레임에 하나만 찍기 : time배열에 동일한 시간이 존재하지 않도록함------------------------------
    function findtime(element) {
        if (element === save_time) return true;
    }
    find = time.findIndex(findtime);
    console.log("time 배열 : " + time);
    if (video.paused === true) {
        if ((find === -1)) {
            ctx.fillText('+', loc.x, loc.y);//멈춤상태일때만 +표시 찍기 
            storeCoordinate(loc.x, loc.y, coords);//클릭한 좌표를 coordes배열에 저장 x:짝수, y:홀수

            time.push(save_time);
        }
        else {
            //  Canvasoff();
        }
    } else {
        Canvasoff();
    }
    video.currentTime = save_time + 0.028;//프레임 자동으로 이동
    //-----------------------------------------------------------------------------------------------
});

//동영상 컨트롤---------------------------------------------------------
window.onload = function () {
    Analysis_Button.addEventListener("click", function () {
        Canvason();
        coords = [];
        resize_canvas();
        video.pause();
        Analysis_Button.innerHTML = "Move Slider bar";
        Scalebar.disabled = false;
        xy.disabled = false;
        Analysis_Button.disabled = true;
    });

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