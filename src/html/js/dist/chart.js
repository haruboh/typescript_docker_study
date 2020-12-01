// クエリパラメータ用日時分秒のテキストを吐き出す関数
function getDateStr(){
    const date = new Date();
    return date.getFullYear() +
            ("00" + (date.getMonth() +1)).slice(-2) +
            ("00" + (date.getDate())).slice(-2) +
            ("00" + (date.getHours())).slice(-2) +
            ("00" + (date.getMinutes())).slice(-2);
}
function getCSVByPromise(code) {
    return new Promise((resolve, reject) => {
        let req = new XMLHttpRequest(); // HTTPでファイルを読み込むためのXMLHttpRrequestオブジェクトを生成、サーバと非同期通信するためのAPI
        req.open("get", `./market_cap_per_code/${code}.csv?${getDateStr()}`, true); // アクセスするファイルを指定
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
function getCSV(code){
    return fetch(`./market_cap_per_code/${code}.csv`,{cache: "no-cache"}).then(res => {
        if(res.ok) {
            return res.text();
        }else{
            throw Error();
        }
    }).then(text =>{
        return csvStr2json(text);
    });
}
function csvStr2json(str){
    let arr = str.split("\n"); // 改行を区切り文字として行を要素とした配列を生成
    let result = []; //jsonArray
    //let csvArray = []; // csvArray

    // 1行目から「項目名」の配列を生成する。
    let items = arr[0].split(',');
    // 命名則がGoogleChartと異なるなら自分で作る方法に変更
    // GoogleChartの配列は新しい方が前ぽいのでreverseで取得する。
    // arr to json
    for (let i=arr.length-1;i >=1;i--){
        let a_line = new Object();
        let tmp = arr[i].split(',');
        for (let j=0;j<items.length;++j){
            a_line[items[j]] = tmp[j];
        }
        result.push(a_line);

    };
    return result;
    //return JSON.stringify(result);

}
// 出来高棒グラフ
function volumeChart(volume, dates, length){
    let chartData = new google.visualization.DataTable();
    chartData.addColumn('string');
    chartData.addColumn('number');
    let insertingData = new Array();
    for(let a=0;a<length;a++){
        insertingData[a] = [dates[a],parseInt(volume[a])];
    }
    for (let i = 1;i<insertingData.length; i++){
        chartData.addRow(insertingData[i]);
    };
    let options = {
        chartArea:{left:80,top:10,right:80,bottom:80},
        legend: {position: 'none',},
        colors: ['#003A76'],
        targetAxisIndex:1,
        bar:{groupWidth: '100%'},
        hAxis:{direction:-1},
        width: 1200,
        vAxis:{viewWindowMode:'maximized'},
    }
    let chart = new google.visualization.ColumnChart(document.getElementById('appendVolume'));
    chart.draw(chartData, options);
}
// 読み込んだCSVデータを二次元配列に変換する関数convertCSVtoArray()の定義
function convertCSVtoArray(str){ // 読み込んだCSVデータが文字列として渡される
    let result = []; // 最終的な二次元配列を入れるための配列
    let tmp = str.split("\n"); // 改行を区切り文字として行を要素とした配列を生成
    
    // 各行ごとにカンマで区切った文字列を要素とした二次元配列を生成
    // 最終行は空let-1する
    for(let i=0;i<tmp.length -1;++i){
        result[i] = tmp[i].split(',');
    }
    //alert(result[0][1])
    return result;
}
function calcMovingAverage(num, length, json){
    let arr = [];
    // 平均を出すための割り算の分母
    let divide =0;
    // 平均線の計算に使う
    let tmp = 0;
    for(let m=0;m<length-num-1; m++){
        for(let n=0;n<num;n++){
            if(json[m+n].Close !=''){
                tmp = tmp + parseFloat(json[m+n].Close);
                divide++;
            }
        }
        arr[m] = tmp /divide;
        tmp = 0;
        divide =0;
    }
    return arr;
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
    //描画用のデータを入れる配列加工データ全部が入っている。
    let insertingData = new Array(length);

    //二次元配列aveに平均線の日数と平均値を入れる
    let ave = new Array();
    ave[0] = calcMovingAverage(5, length, json);
    ave[1] = calcMovingAverage(25, length, json);
    ave[2] = calcMovingAverage(75, length, json);
    // for文をまとめるため、出来高棒グラフも作成
    // 出来高を保持する配列
    let volume = new Array();
    // チャートの日付を保持する配列
    let dates = new Array();
    for(let s=0;s<length;s++){
        volume[s] = json[s].Volume;
        dates[s] = String(json[s].Date)
    }
    //配列insertingDataの中に、[安値、始値、高値、終値、５日移動平均線、２５日移動平均線、５０日移動平均線]の形で値を入れ込む
    for(let a=0;a<length;a++){
        insertingData[a] = [dates[a],parseFloat(json[a].Low),parseFloat(json[a].Open),parseFloat(json[a].Close),parseFloat(json[a].High),ave[0][a],ave[1][a],ave[2][a]]
    }
    //描画用の配列の中に、insertingDataの値を入れる
    //最古の５０日分のデータまでは移動平均線のデータは揃っていないので取り除く
    //ということだがなければ表示しないだけなので無視する。
    //for (let i = insertingData.length-1;i>0; i--){
    for (let i = 1;i<insertingData.length; i++){
        chartData.addRow(insertingData[i]);
    }

    // チャートの見た目に関する記述、詳細は公式ドキュメント参照
    let options = {
        chartArea:{left:80,top:10,right:80,bottom:10},
        legend: {
            position: 'none',
        },
        colors: ['#003A76'],
        candlestick: {
            // rising 陽線,falling 陰線, stroke => 周りの色 fill => 塗りつぶし
            // ex) risingColor: {stroke: '#4CAF50', fill: 'white'},
            risingColor: {fill: 'white'},
            fallingColor: {fill: '#003A76'}
        },
        vAxis:{viewWindowMode:'maximized'},
        hAxis:{
            format: 'yy/MM/dd',
            direction: -1,
        },
        bar:{groupWidth: '100%'},
        width: 1200,
        height: 400,
        lineWidth: 2,
        curveType: 'function',
        //chart type -> candle
        targetAxisIndex:1,
        seriesType: "candlesticks",
        series:{
            1:{
                type: "line",
                color: 'green',
            },
            2:{
                type: "line",
                color: 'red',
            },
            3:{
                type: "line",
                color: 'orange',
            },
        }
    };
    // 描画の処理
    let chart = new google.visualization.ComboChart(document.getElementById('appendMain'));
    chart.draw(chartData, options);
    //出来高棒グラフを作成する関数を呼び出す
    volumeChart(volume, dates, length);
};

// 
// ボタンを押すとinputに書いている４桁の数字のcsvファイルを解析してjsonにする処理が走る（つもり
// getCSV関数でcsvを取得してjson変数に格納している（つもり
// なのでdata=jsonでなければならない（予定
//
//
//
//
//
//
const clickbtn = document.getElementById('btn');
clickbtn.onclick = async () =>  {
    let code = document.getElementById('stockCode').value;
    if(code != ''){
        let data = await getCSV(code);
        mainChart(data);
    };
};
const clickEveda = document.getElementById('kokoClick');
clickEveda.onclick = () => alert('hoge')
//clickEveda.addEventListener(
//    'click',
//    e => alert('hogeほげホゲ'),
//    false
//);
//clickEveda.addEventListener//(
//    'click',
//    e => alert('piyoぴよピヨ'),
//    false
//);
