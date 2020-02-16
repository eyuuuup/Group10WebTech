var chart;

function createGraph(data){
    
    var ctx = document.getElementById('myChart').getContext('2d');
    var temps = [];
    var dates = [];
    var humid = [];
    console.log(data);
    for(var i = 0; i < data.length; i++) {
        var obj = data[i];
        temps.push(obj.temp)
        var date = obj.date.substring(0, 19)
        var dt = new Date(date)
        dt.setHours(dt.getHours() + 1)
        dates.push(dt.toLocaleString("en-GB"))
        humid.push(obj.humid)
    }
    chart = new Chart(ctx, {
        type: 'line',
    data: {
        labels: dates,
        datasets: [{ 
            data: temps,
            label: "Temperature",
            borderColor: "#3e95cd",
            fill: false
        },
        {
            data: humid,
            label: "Humidity",
            borderColor: "#800080",
            fill: false
        }
        ]
    },
    options: {
        title: {
            display: true,
            text: 'Temperature and Humidity'
            }
        }
    });
}

function addData(chart, data) {
    var temps = [];
    var dates = [];
    var humid = [];
    for(var i = 0; i < data.length; i++) {
        var obj = data[i];
        temps.push(obj.temp)
        var date = obj.date.substring(0, 19)
        var dt = new Date(date)
        dt.setHours(dt.getHours() + 1)
        dates.push(dt.toLocaleString("en-GB"))
        humid.push(obj.humid)
    }

    chart.data.labels = dates;
    chart.data.datasets[0].data = temps;
    chart.data.datasets[1].data = humid;
    chart.update();
}

$(document).ready(
    function () {
        $.ajax(
            {
                url: "https://restgo.herokuapp.com/api/weather",
                method: "GET",
                dataType: "json"
            }
        ).done(
            function (data) {
                createGraph(data)
            }
        );
    }
);

$(document).ready(
    function () {
        $('#reset').click(
            function () {
                $.ajax(
                    {
                        url: "https://restgo.herokuapp.com/api/weather/reset",
                        method: "DELETE",
                        dataType: "json"
                    }
                ).done(
                    function () {
                        
                        $.ajax(
                            {
                                url: "https://restgo.herokuapp.com/api/weather",
                                method: "GET",
                                dataType: "json"
                            }
                        ).done(
                            function (data) {
                                addData(chart, data)
                                alert("Database has been reset");
                            }
                        );
                    }
                );
            }
        );
    }
);

$(document).ready(
    function () {
        $('#update').click(
            function () {
                $.ajax(
                    {
                        url: "https://restgo.herokuapp.com/api/weather",
                        method: "GET",
                        dataType: "json"
                    }
                ).done(
                    function (data) {
                        addData(chart, data);
                    }
                );
            }
        );
    }
);
