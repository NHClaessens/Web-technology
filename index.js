$(function(){
  $(getTableData);
  //get table data on first page load
  $("table").on("click", "th[sortable='yes']", sortTable);
  $("input").on("keyup", validateForm);
  $(document).on("click", ".delete_button", deleteItem)
  $("#reset_button").click(function(){
      $.ajax({
        url: "http://localhost:3000/delete/",
        type: "DELETE",
        complete: function(data){
          $(getTableData)
        }
      })
      //reset database and reload table
  });
  $("#submit_button").click(submitItem);
});
function getTableData(){
  $.get(
    "http://localhost:3000/",
    makeTable
  )
}
function makeTable(data){
  for(let j = $("#specification_table tr").length - 2 ; j > 0 ; j--){
    $("#specification_table tr")[j].remove();
    //clear table
  }
  for(let i = 0; i < data.length; i++){
      var $image = '<img src=\"' + data[i].image + '\" />';
      var $newRow = 
      "<tr id='"+ data[i].id +"' title='id: " + data[i].id + "'><td>" + data[i].brand + "</td><td>" + data[i].model + "</td><td>" + data[i].os + "</td><td>" + data[i].screensize + " inch</td><td>" + $image + "</td><td><img src='https://cdn-icons-png.flaticon.com/512/1214/1214428.png' class='delete_button'></td></tr>";      
      $("#specification_table tr:first").prepend($newRow);
      //load new table rows
  }
}
function sortTable() {
    var table, rows, switching, index, i, x, y, shouldSwitch;
    table = this.closest("table");
    index = $(this).index();
    switching = true;
    /* Make a loop that will continue until
    no switching has been done: */
    while (switching) {
      // Start by saying: no switching is done:
      switching = false;
      rows = table.rows;
      /* Loop through all table rows (except the
      first, which contains table headers): */
      for (i = 1; i < (rows.length - 1 - (rows[rows.length - 1].getElementsByTagName("input").length > 0)); i++) {
        //modified above line to skip the header row and input row (if inputs exist)
        // Start by saying there should be no switching:
        shouldSwitch = false;
        /* Get the two elements you want to compare,
        one from current row and one from the next: */
        x = rows[i].getElementsByTagName("TD")[index];
        y = rows[i + 1].getElementsByTagName("TD")[index];
        // Check if the two rows should switch place:
        if($(this).attr("data-type") == "number"){
          //if data-type is number sort by number instead of alphabetically
          if(parseInt(x.innerHTML.toLowerCase()) > parseInt(y.innerHTML.toLowerCase())){
            shouldSwitch = true;
            break;
          }          
        }else if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          // If so, mark as a switch and break the loop:
          shouldSwitch = true;
          break;
        }
      }
      if (shouldSwitch) {
        /* If a switch has been marked, make the switch
        and mark that a switch has been done: */
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
      }
    }
    /*from: https://www.w3schools.com/howto/howto_js_sort_table.asp*/
}
function submitItem(){
  event.preventDefault();
  var newData = {
    "brand": $("#brand").val(),
    "model": $("#model").val(),
    "os": $("#os").val(),
    "screensize": $("#screensize").val(),
    "image": $("#image").val()
  }
  validateForm.call($("#brand"));
  validateForm.call($("#model"));
  validateForm.call($("#os"));
  validateForm.call($("#screensize"));
  if($("#brand").val() == "" || $("#model").val() == "" || $("#os").val() == "" || $("#screensize").val() == ""){
    alert("Incorrect data was entered");
    return -1;
  }
  if($("#modify_id").val() != ""){
    $.ajax({
      type: "PUT",
      url: "http://localhost:3000/change/" + $("#modify_id").val(),
      data: JSON.stringify(newData),
      contentType: 'application/json',
      complete: function(){
        $(getTableData)
      }
    })
  }else{
    $.ajax({
      type: "POST",
      url: "http://localhost:3000/add",
      data: JSON.stringify(newData),
      contentType: 'application/json',
      complete: function(){
        $(getTableData)
      }
    })
  }
}
function deleteItem(){
  var tablerow = this.closest("tr");
  console.log(tablerow.id);
  $.ajax({
    url: "http://localhost:3000/delete/" + tablerow.id,
    type: "DELETE",
    complete: function(data){
      $(getTableData)
    }
  })
}
function validateForm(){
  if($(this).attr("type") != "url" && $(this).val() == ""){
    //don't validate url since it's not required
    $(this).css("border", "1px solid red");
  }else{
    $(this).css("border", "");
    //reset border in case of valid input
  }
}
