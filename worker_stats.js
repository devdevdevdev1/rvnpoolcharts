//Grab worker stats
function getWorkerStats(workerAddress) {
    let promise = jQuery.get("http://hostname/api/worker_stats?" + workerAddress); 
    promise.then(
        data => populateWorkerArrays(data)
        //error => console.log('error: ', error)    
    );
};

function populateWorkerArrays(workerData) {

 
    // *********** GRAPH CODE **************//


    let historyList = [];
    //Begin History Loop
    for (var w in workerData.history) {
        var worker = getWorkerNameFromAddress(w);
        var a = {
            key: worker,
            hashrate: []
        };
        for (var wh in workerData.history[w]) {
            a.hashrate.push([workerData.history[w][wh].time * 1000, workerData.history[w][wh].hashrate]);
            
        }
        historyList.push(a);
    
    //End History Loop
    }


    //Prep data for pool workers graph
    var maxScale = 0;
	var label = 'H/s';
	for (var w in historyList) {
		var pair = getReadableHashratePair(Math.max.apply(null, historyList[w].hashrate.map(x => x[1])));
		var i = pair[2];
		if (maxScale < i) {
			maxScale = i;
			label = pair[1];
		}

	}
	var dataset = [];
	for (var d in historyList) {
		var data = historyList[d];
		var color = getRandomColor();
		var o = {
			label: data.key,
			fill: false,
			data: data.hashrate.map(x => {
				return {
					t: x[0],
					y: getScaledHashrate(x[1], i)
				}
			}),
			borderWidth: 2,
			backgroundColor: color,
            lineTension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: "rgba(255,255,255,1)",
            pointHoverBackgroundColor: "rgba(255,255,255,1)",
            pointBorderWidth: 2,
            pointHoverRadius: 8,
            pointHoverBorderWidth: 1,
			borderColor: color
            
		};
		dataset.push(o);
    }

    //Send data to graph
    //TODO: Stop sending 48 integers for xAxis time, and extract the time some way else
    displayWorkerHashrateGraph(Array.from(Array(48).keys()), dataset, label);
  
}


//populate the worker graph
function displayWorkerHashrateGraph(timeLabels, dataset, label) {
    var workerHashrateChart = document.getElementById("workerHashrateChart");
  if (workerHashrateChart !== null) {
    var urChart = new Chart(workerHashrateChart, {
      type: "line",
      data: {
        labels: timeLabels,
        datasets: dataset
        },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            right: 10,
            top: 14
          }
        },

        legend: {
          display: true
        },
        scales: {
          xAxes: [
            {
              gridLines: {
                drawBorder: false,
                display: false
              },
              ticks: {
                display: false, // hide main x-axis line
                beginAtZero: true
              },
              barPercentage: 1.8,
              categoryPercentage: 0.2
            }
          ],
          yAxes: [
            {
              gridLines: {
                drawBorder: true, // hide main y-axis line
                display: true
              },
              scaleLabel: {
                display: true,
                labelString: label
            },
              ticks: {
                display: true,
                beginAtZero: true
              }
            }
          ]
        },
        tooltips: {
          titleFontColor: "#888",
          bodyFontColor: "#555",
          titleFontSize: 12,
          bodyFontSize: 14,
          backgroundColor: "rgba(256,256,256,0.95)",
          displayColors: true,
          borderColor: "rgba(220, 220, 220, 0.9)",
          borderWidth: 2
        }
      }
    });
}
}










function getRandomPastelColor() {
	var r = (Math.round(Math.random() * 127) + 127).toString(16);
	var g = (Math.round(Math.random() * 127) + 127).toString(16);
	var b = (Math.round(Math.random() * 127) + 127).toString(16);
	return '#' + r + g + b;
}

function getRandomColor() {
	var letters = '0123456789ABCDEF'.split('');
	var color = '#';
	for (var i = 0; i < 6; i++ ) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

function getWorkerNameFromAddress(w) {
	var worker = w;
	if (w.split(".").length > 1) {
		worker = w.split(".")[1];
		if (worker == null || worker.length < 1) {
			worker = "noname";
		}
	} else {
		worker = "noname";
	}
	return worker;
}

this.getScaledHashrate = function(hashrate, i) {
	hashrate = (hashrate * 1000000);
	if(hashrate < 1000000) {
		hashrate = hashrate * 100000;
	}
	hashrate = (hashrate / 1000) / Math.pow(1000, i + 1);
	return hashrate.toFixed(2);
};

this.getReadableHashratePair = function(hashrate) {
	hashrate = (hashrate * 1000000);
	if(hashrate < 1000000) {
		hashrate = hashrate * 100000;
	}
	var byteUnits = [' H/s', ' KH/s', ' MH/s', ' GH/s', ' TH/s', ' PH/s'];
	var i = Math.max(0, Math.floor((Math.log(hashrate / 1000) / Math.log(1000)) - 1));
	hashrate = (hashrate/1000) / Math.pow(1000, i + 1);
	return [hashrate.toFixed(2), byteUnits[i], i];
};
