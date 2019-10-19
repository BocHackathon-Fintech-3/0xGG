function submitCreateForm(){

	if($('#principal').val()==""){
		$('#principal').focus();
		$('#principal').addClass("error");
		return;
	}
	$('#principal').removeClass("error");

	if($('#principal_amount').val()==""){
		$('#principal_amount').focus();
		$('#principal_amount').addClass("error");
		return;
	}
	$('#principal_amount').removeClass("error");

	if($('#collateral').val()==""){
		$('#collateral').focus();
		$('#collateral').addClass("error");
		return;
	}
	$('#collateral').removeClass("error");

	if($('#collateral_amount').val()==""){
		$('#collateral_amount').focus();
		$('#collateral_amount').addClass("error");
		return;
	}
	$('#collateral_amount').removeClass("error");

	var fullDate = new Date()
	var twoDigitMonth = ((fullDate.getMonth().length+1) === 1)? (fullDate.getMonth()+1) :(fullDate.getMonth()+1); 
	var currentDate = fullDate.getFullYear() + "/" + twoDigitMonth + "/" + fullDate.getDate() ;

	if(currentDate > $('#deadline').val()){
		alert("Error");
		return;
	}
}