function getCSV(code) {
    return new Promise((resolve, reject) => {
        let req = new XMLHttpRequest(); // HTTPでファイルを読み込むためのXMLHttpRrequestオブジェクトを生成、サーバと非同期通信するためのAPI
        req.open("get", `./market_cap_per_code/${code}.csv`, true); // アクセスするファイルを指定
        req.onload = () => {
            if (req.readyState === 4 && req.status === 200) {
                  //resolve(convertCSVtoArray(req.responseText));
                  resolve(csvStr2json(req.responseText));
            } else {
                console.log('miss 1')
                reject(new Error(req.statusText));
            }
        };
        req.onerror = () => {
            console.log('miss 2')
            reject(new Error(req.statusText));
        };
        req.send(null); // HTTPリクエストの発行
    });
}

function csvStr2json(str){
    let arr = str.split("\n"); // 改行を区切り文字として行を要素とした配列を生成
    let result = []; //jsonArray
    //let csvArray = []; // csvArray

    // 1行目から「項目名」の配列を生成する。
    let items = arr[0].split(',');
    // 命名則がGoogleChartと異なるなら自分で作る方法に変更
    // arr to json
    for (let i=1;i<arr.length-1;++i){
        let a_line = new Object();
        let tmp = arr[i].split(',');
        for (let j=0;j<items.length;++j){
            a_line[items[j]] = tmp[j];
        }
        result.push(a_line);

    };
    // console.debug(result)
    return result;

}

// 読み込んだCSVデータを二次元配列に変換する関数convertCSVtoArray()の定義
function convertCSVtoArray(str){ // 読み込んだCSVデータが文字列として渡される
    var result = []; // 最終的な二次元配列を入れるための配列
    var tmp = str.split("\n"); // 改行を区切り文字として行を要素とした配列を生成
    
    // 各行ごとにカンマで区切った文字列を要素とした二次元配列を生成
    // 最終行は空のようなので-1する
    for(var i=0;i<tmp.length -1;++i){
        result[i] = tmp[i].split(',');
    }
    //alert(result[0][1])
    return result;
}

google.charts.load('current', {'packages':['corechart']});
function mainChart(json){
    // 描画するデータの箱を用意する
    let chartData = new google.visualization.DataTable();
    chartData.addColumn('string');
    for(let x=0;x<7;x++){
        chartData.addColumn('number');
    }
    // 長さを値にする
    const length = json.length;
    //描画用のデータをいちじてきにいれる
    let insertingData = new Array(length);
    // 平均を出すための割り算の分母
    let divied = 0;
    //二次元配列aveに平均線の日数と平均値を入れる
    let ave = new Array();
    // 5
    ave[0] = new Array();
    // 25
    ave[1] = new Array();
    // 75
    ave[2] = new Array();
    // 平均線の計算に使う
    let tmp = 0;
    // 5 keisan
    for(let m=0;m<length-4; m++){
        for(let n=0;n<5;n++){
            if(json[m+n].close !=''){
                tmp = tmp + parseFloat(json[m+n].close);
                divide++;
            }
        }
        ave[0][m] = tmp / divide;
        tmp = 0;
        divide = 0;
    }

}

$('#btn').click(function(){
    let code = $('#input').val()
    let data = getCSV("3689");
    mainChart(data);
    console.log(data);
})