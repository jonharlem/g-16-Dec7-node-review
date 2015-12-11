//always wrap in window.onload
window.onload = function(){

	$('#myForm').on('submit', function(event) {
		//prevents default network calls
		event.preventDefault();
		console.log("this is working...");

		$.ajax({
			//want to send it to the browser
			url: window.location,
			method: 'POST',
			data: {
				//what object am I sending? 1) make ids and extract value 2) 
				firstName: $('#firstName').val(),
				lastName: $('#firstName').val(),
			},
			//upon success we want to run a function that takes the data from that response
			success: function(data) {
				console.log(data);
				$('#dataHolder').append(data);
			}
		});
	});

};


// $("#target").submit(function( event ) {
// 	if($("input:first").val() === /^[a-z ,.'-]+$/i) {
// 		$( "" )
// 	}
// })
