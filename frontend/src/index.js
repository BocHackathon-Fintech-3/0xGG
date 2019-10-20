function submitCreateForm() {

  if ($('#principal').val() == "") {
    $('#principal').focus();
    $('#principal').addClass("border");
    $('#principal').addClass("border-danger");
    return;
  }
  $('#principal').removeClass("border");
  $('#principal').removeClass("border-danger");

  if ($('#principal_amount').val() == "") {
    $('#principal_amount').focus();
    $('#principal_amount').addClass("border");
    $('#principal_amount').addClass("border-danger");
    return;
  }
  $('#principal_amount').removeClass("border");
  $('#principal_amount').removeClass("border-danger");

  if ($('#collateral').val() == "") {
    $('#collateral').focus();
    $('#collateral').addClass("border");
    $('#collateral').addClass("border-danger");
    return;
  }
  $('#collateral').removeClass("border");
  $('#collateral').removeClass("border-danger");

  if ($('#collateral_amount').val() == "") {
    $('#collateral_amount').focus();
    $('#collateral_amount').addClass("border");
    $('#collateral_amount').addClass("border-danger");
    return;
  }
  $('#collateral_amount').removeClass("border");
  $('#collateral_amount').removeClass("border-danger");

  var fullDate = new Date()
  var twoDigitMonth = ((fullDate.getMonth().length + 1) === 1) ? (fullDate.getMonth() + 1) : (fullDate.getMonth() + 1);
  var currentDate = fullDate.getFullYear() + "/" + twoDigitMonth + "/" + fullDate.getDate();

  if (currentDate > $('#deadline').val()) {
    alert("Error");
    return;
  }
}