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

function createList(offer_id,status,principal,principal_amount,collateral,collateral_amount,deadline,interest){

  var li_list = "<li class='mt-3 mx-2'><a href='#{0}'><table class='table table-striped table-sm table-secondary rounded shadow-sm'><body><tr><td>Status:</td> <td class='text-right'>{1}</td></tr> <tr><td>Principal:</td><td class='text-right'>{2} {3}</td></tr><tr><td>Collateral:</td><td class='text-right'>{4} {5}</td></tr><tr><td>Deadline:</td><td class='text-right'>{6}</td></tr><tr><td>Interest:</td><td class='text-right'>{7}</td></tr></tbody></table></a></li>";
  
  function{
    offer_id,status,principal,
    principal_amount,collateral,
    collateral_amount,deadline,interest
  }

  return li_list;

}