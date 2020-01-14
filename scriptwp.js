$(document).ready(
    function() {
        $.ajax(
            {
            url: "https://wt.ops.labs.vu.nl/api20/5824a3f6",
            method: "GET",
            dataType: "json"
        })
        .done(
            
            function(data) {
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
                    
                        columnDefs: [
                            {
                                orderable : false, targets: 3
                            }
                        ]
                    }       
                );
            }
        );
    }
);




$(document).ready(
    function() {
        $('#reset').click( function () {
            $.ajax(
                {
                url: "https://wt.ops.labs.vu.nl/api20/5824a3f6/reset",
                method: "GET",
                dataType: "json"
            })
            .done(
                function() {
                    alert("Database has been reset");
                    $('#test').empty();
                    $.ajax(
                        {
                        url: "https://wt.ops.labs.vu.nl/api20/5824a3f6",
                        method: "GET",
                        dataType: "json"
                    }).done(
           
                        function(data) {
                            console.log(JSON.stringify(data));
                          
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
                                 
                            }
                        )
                
                }
            );
            
        });
    }
);

$(function() {
    
    $('form').submit(
    function() {
        
        // https://stackoverflow.com/questions/6000073/how-can-i-remove-everything-inside-of-a-div
        $('#test').empty();
        //https://stackoverflow.com/questions/1960240/jquery-ajax-submit-form
        $.post('https://wt.ops.labs.vu.nl/api20/5824a3f6', $('form').serialize())
        //https://stackoverflow.com/questions/4038567/prevent-redirect-after-form-is-submitted
        $.ajax(
            {
            url: "https://wt.ops.labs.vu.nl/api20/5824a3f6",
            method: "GET",
            dataType: "json"
            })
        .done(
           
            function(data) {
                console.log(JSON.stringify(data));
              
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
                     
                }
            )
            
        }
    );
});

