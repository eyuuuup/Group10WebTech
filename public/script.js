
// initilized the DOM of the table using the data provided and sets up dynamic sorting
function initializeData(data) {

    //https://stackoverflow.com/questions/17724017/using-jquery-to-build-table-rows-from-ajax-responsejson
    $.each(data, function (i, item) {
        var $tr = $('<tr>').append(
            $('<th>').text(item.id),
            $('<td>').text(item.brand),
            $('<td>').text(item.model),
            $('<td>').text(item.os),
            $('<td>').html("<img src=" + item.image + ">"),
            $('<td>').text(item.screensize),
        );
        $('#test').append($tr);
    });

    // https://stackoverflow.com/questions/14891216/how-to-use-datatable-with-dynamically-created-table
    // https://stackoverflow.com/questions/13708781/datatables-warningtable-id-example-cannot-reinitialise-data-table
    $('#actual').DataTable(
        {
            paging: false,
            searching: false,
            bInfo: false,
            retrieve: true,
            columnDefs: [
                {
                    orderable: false, targets: 4
                }
            ]
        }
    );
}

function createGraph(data){
    var ctx = document.getElementById('myChart').getContext('2d');
    var temps = [];
    var dates = [];
    var humid = [];
    for(var i = 0; i < data.length; i++) {
        var obj = data[i];
        temps.push(obj.temp)
        dates.push(obj.date.substring(0, 19))
        humid.push(obj.humid)
    }
    console.log(temps)
    var myChart = new Chart(ctx, {
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

// gets the product info on document load and calls initializeData
$(document).ready(
    function () {
        $.ajax(
            {
                url: "http://localhost:3000/api/weather",
                method: "GET",
                dataType: "json"
            }
        ).done(
            function (data) {
                console.log("yep")
                createGraph(data)
            }
        );
    }
);

// resets the whole database, or resets a single product if given an ID
$(document).ready(
    function () {
        $('#reset').click(
            function () {

                if ($('#ID').val().length == 0) {
                    $('#actual').DataTable().destroy();
                    $('#test').empty();

                    $.ajax(
                        {
                            url: "https://restgo.herokuapp.com/api/products/reset",
                            method: "DELETE",
                            dataType: "json"
                        }
                    ).done(
                        function () {
                            $.ajax(
                                {
                                    url: "https://restgo.herokuapp.com/api/products",
                                    method: "GET",
                                    dataType: "json"
                                }
                            ).done(
                                function (data) {
                                    initializeData(data);
                                    alert("Database has been reset");
                                }
                            );
                        }
                    );

                } else {
                    $.ajax(
                        {
                            url: "https://restgo.herokuapp.com/api/products/" + $('#ID').val(),
                            method: "DELETE",
                            dataType: "json"
                        }
                    ).done(
                        function () {
                            $.ajax(
                                {
                                    url: "https://restgo.herokuapp.com/api/products",
                                    method: "GET",
                                    dataType: "json"
                                }
                            ).done(
                                function (data) {
                                    $('#actual').DataTable().destroy();
                                    $('#test').empty();
                                    initializeData(data);
                                    alert("Entry with id " + $('#ID').val() + " has been reset");
                                }
                            );
                        }
                    ).fail(
                        function () {
                            alert("ID not found in database");
                        }
                    );
                }
            }
        );
    }
);

// updates an product with a given id.
$(document).ready(
    function () {
        $('#update').click(
            function () {

                //https://stackoverflow.com/questions/16211871/how-to-check-if-all-inputs-are-not-empty-with-jquery
                var isValid = true;
                $('input').each(function () {
                    var element = $(this);
                    if (element.val().length == 0) {
                        isValid = false;
                    }
                });

                if (!isValid) {
                    alert("Fill in all fields to update a product.")
                    return false;
                }

                //https://stackoverflow.com/questions/11338774/serialize-form-data-to-json
                var unindexed_array = $('form').serializeArray();
                var indexed_array = {};

                $.map(unindexed_array, function (n, i) {
                    indexed_array[n['name']] = n['value'];
                });

                //https://stackoverflow.com/questions/1960240/jquery-ajax-submit-form
                //https://stackoverflow.com/questions/6230964/waiting-for-post-to-finish
                $.ajax(
                    {
                        url: "https://restgo.herokuapp.com/api/products/" + indexed_array.ID,
                        method: "PUT",
                        dataType: "json",
                        contentType: "application/json",
                        data: JSON.stringify(indexed_array)
                    }
                ).done(function () {
                    //https://stackoverflow.com/questions/4038567/prevent-redirect-after-form-is-submitted
                    $.ajax(
                        {
                            url: "https://restgo.herokuapp.com/api/products",
                            method: "GET",
                            dataType: "json"
                        }
                    ).done(
                        function (data) {
                            // https://stackoverflow.com/questions/6000073/how-can-i-remove-everything-inside-of-a-div
                            $('#actual').DataTable().destroy();
                            $('#test').empty();
                            initializeData(data);
                            alert("Entry with id " + $('#ID').val() + " has been updated");
                        }
                    );
                }).fail(
                    function () {
                        alert("ID not found in database");
                    }
                );

                return false;
            }
        );
    }
);

// formats form data ands adds a product
$(document).ready(
    function () {
        $('form').submit(
            function () {

                //https://stackoverflow.com/questions/11338774/serialize-form-data-to-json
                var unindexed_array = $('form').serializeArray();
                var indexed_array = {};

                $.map(unindexed_array, function (n, i) {
                    indexed_array[n['name']] = n['value'];
                });

                //https://stackoverflow.com/questions/1960240/jquery-ajax-submit-form
                //https://stackoverflow.com/questions/6230964/waiting-for-post-to-finish
                $.ajax(
                    {
                        url: "https://restgo.herokuapp.com/api/products",
                        method: "POST",
                        dataType: "json",
                        contentType: "application/json",
                        data: JSON.stringify(indexed_array)
                    }
                ).done(function () {
                    //https://stackoverflow.com/questions/4038567/prevent-redirect-after-form-is-submitted
                    $.ajax(
                        {
                            url: "https://restgo.herokuapp.com/api/products",
                            method: "GET",
                            dataType: "json"
                        }
                    ).done(
                        function (data) {
                            // https://stackoverflow.com/questions/6000073/how-can-i-remove-everything-inside-of-a-div
                            $('#actual').DataTable().destroy();
                            $('#test').empty();
                            initializeData(data);
                            alert("Product has been added");
                        }
                    );
                }).fail(
                    function (data) {
                        alert(data.responseJSON.error);
                    }
                );
                return false;
            }
        );
    }
);
