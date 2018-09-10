//初始化基础变量
var cdata = sdata.slice();
var cyear = syear.slice();
//alert(math);
// 基于准备好的dom，初始化echarts图表
var myChart = echarts.init(document.getElementById('main'));
var mode = "请选择预测方法";
function reflashChart() {
  var option = {
    title : {   text: mode},
    tooltip: {
      show: true
    },
    legend: {
      data:['需求量（万头）']
    },
    xAxis : [
      {
        type : 'category',
        data : cyear.slice(0,cdata.length)
      }
    ],
    yAxis : [
      {
        type : 'value'
      }
    ],
    series : [
      {
        "name":"需求量（万头）",
        "type":"line",
        "data":cdata
      }
    ]
  };

  // 为echarts对象加载数据
  myChart.setOption(option);
}reflashChart();

// 初始化表格

var tdata = document.getElementById('data');

function reflashTable() {
  if (navigator.userAgent.indexOf("compatible") > -1 && navigator.userAgent.indexOf("MSIE") > -1) {
    tdata.innerText = "";
    var x = tdata.insertRow();
    x.insertCell().innerText = "年份";
    x.insertCell().innerText = "需求量（万头）";
    for (var i = 0; i < cdata.length; i++) {
      var x = tdata.insertRow();
      x.insertCell().innerText = cyear[i];
      try {
        thisdata = (cdata[i]).toFixed(2);
      } catch (e) {
        thisdata = cdata[i];
      } finally {
        x.insertCell().innerText = thisdata;
      }
    }
  }
  else {
    tdata.innerHTML = "";
    var x = tdata.insertRow();
    x.insertCell().innerHTML = "年份";
    x.insertCell().innerHTML = "需求量（万头）";
    for (var i = 0; i < cdata.length; i++) {
      var x = tdata.insertRow();
      x.insertCell().innerHTML = cyear[i];
      try {
        thisdata = (cdata[i]).toFixed(2);
      } catch (e) {
        thisdata = cdata[i];
      } finally {
        x.insertCell().innerHTML = thisdata;
      }

    }
  }
}reflashTable();

function reflash() {

  reflashTable();
  reflashChart();
  cdata = sdata.slice();
  cyear = syear.slice();
}

//建立灰色预测模型
var X0 = math.matrix(sdata);
var X1 = [sdata[0]];
for (var i = 1; i < sdata.length; i++) {
  X1.push(X1[i-1] + sdata[i]);
}
var B = new Array();
var X = sdata.slice();
X.shift();
X = math.transpose(math.matrix(X));
for (var i = 0; i < sdata.length - 1; i++) {
  B.push(-0.5*(X1[i]+X1[i+1]));
}
B = math.matrix(B);
B.resize([sdata.length-1,2],1);
var AU = math.multiply(math.inv(math.multiply(math.transpose(B),B)),math.multiply(math.transpose(B),X));
AU = AU.toArray();
a = AU[0];
u = AU[1];
function XX0(t) {
  return ((sdata[0] - u/a)*(1-math.exp(a))*math.exp(-a*t));
};

function gm11() {
  //扩充原数据数组
  while(cdata.length<syear.length)
  cdata.push(XX0(cdata.length));
  mode = "灰色模型预测";
  reflash();
}document.getElementById("gm").onclick = gm11;

//建立指数平滑预测模型
var eYj = [(sdata[0]+sdata[1]+sdata[2])/3];
for (var i = 0; i < sdata.length; i++) {
  eYj.push(0.59*sdata[i] + 0.41*eYj[i]);
}

function er() {
  cdata.push(eYj[sdata.length]);
  while(cdata.length<syear.length)
  cdata.push("指数平滑无法预测");
  mode = "指数平滑法";
  reflash();
}document.getElementById("er").onclick = er;

//建立一元线性回归模型
var lry = sdata.slice();
var ys = 0.0;
for (var i = 0; i < sdata.length; i++)
ys += sdata[i];
ys = ys/sdata.length;
for (var i = 0; i < lry.length; i++) {
  lry[i] = sdata[i] - ys;
}
lry = math.matrix(lry);
var lrx = syear.slice(0,sdata.length);
var xs = 0.0;
for (var i = 0; i < sdata.length; i++)
xs += syear[i];
xs = xs/sdata.length;
for (var i = 0; i < lrx.length; i++) {
  lrx[i] = syear[i] - xs;
}
lrx = math.matrix(lrx);
var lrb = math.multiply(math.inv(math.multiply(math.transpose(lrx),lrx)),math.multiply(math.transpose(lrx),lry));
function lr() {
  while(cdata.length<syear.length)
  cdata.push(lrb*(syear[cdata.length]-xs)+ys);
  mode = "一元线性回归";
  reflash();
}document.getElementById("lr").onclick = lr;

//建立多元线性回归模型
function mr() {
  while(Boolean(mlrdata[syear[cdata.length]]))
  cdata.push(116.171517+0.000221*mlrdata[syear[cdata.length]][0]-0.025007*mlrdata[syear[cdata.length]][1]+0.066675*mlrdata[syear[cdata.length]][2]+3.184295*mlrdata[syear[cdata.length]][3]+1.032583*mlrdata[syear[cdata.length]][4]-5.801610*mlrdata[syear[cdata.length]][5]-0.000280*mlrdata[syear[cdata.length]][6]);
  while(cdata.length<syear.length)
  cdata.push("数据不足，无法计算");
  mode = "多元线性回归";
  reflash();
}document.getElementById("mr").onclick = mr;
