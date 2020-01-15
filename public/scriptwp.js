// api key: https://wt.ops.labs.vu.nl/api20/5824a3f

function purgeTheHeretics(data)  {
    console.log(JSON.stringify(data));

    //https://stackoverflow.com/questions/17724017/using-jquery-to-build-table-rows-from-ajax-responsejson
    $.each(data, function(i, item) {
        var $tr = $("<tr>").append(
         
            $('<th>').text(item.brand),
            $('<td>').text(item.model),
            $('<td>').text(item.os),
            $('<td>').html("<img src=" + item.image + ">"),
            $('<td>').text(item.screensize),
            
        );
        $("#test").append($tr); 
         
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
                    orderable : false, targets: 3
                }
            ]
        }       
    );
}

$(document).ready(
    function() {
        $.ajax(
            {
            url: "http://localhost:3000/api/products",
            method: "GET",
            dataType: "json"
            }
        ).done(
            function(data) {
                purgeTheHeretics(data)
            }  
        );
    }
);

$(document).ready(
    function() {
        $('#reset').click( 
            function () {
                $('#actual').DataTable().destroy();
                $('#test').empty();        

                $.ajax(
                    {
                    url: "http://localhost:3000/api/products/reset",
                    method: "GET",
                    dataType: "json"
                    }
                ).done(
                    function() {
                        $.ajax(
                            {
                                url: "http://localhost:3000/api/products",
                                method: "GET",
                                dataType: "json"
                            }
                        ).done(
                            function(data) {
                                purgeTheHeretics(data);
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
    function() {
        $('form').submit(
            function() {

                // https://stackoverflow.com/questions/6000073/how-can-i-remove-everything-inside-of-a-div
                $('#actual').DataTable().destroy();
                $('#test').empty();
                
                //https://stackoverflow.com/questions/1960240/jquery-ajax-submit-form
                //https://stackoverflow.com/questions/6230964/waiting-for-post-to-finish
                $.post('http://localhost:3000/api/products', $('form').serialize(), function(){

                    //https://stackoverflow.com/questions/4038567/prevent-redirect-after-form-is-submitted
                    $.ajax(
                        {
                        url: "http://localhost:3000/api/products",
                        method: "GET",
                        dataType: "json"
                        }
                    ).done(
                        function(data) {
                            purgeTheHeretics(data);
                            alert("Product has been added");
                        }
                    );
                });
                return false;
            }
        );
    }
);
