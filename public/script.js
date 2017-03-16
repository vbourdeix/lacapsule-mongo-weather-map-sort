$("document").ready(function() {
 
 $("#add-city").click(function(event) {
   var cityName = $("#city").val();
   if(cityName.length < 3) {
     event.preventDefault();

     $(".alert-danger").html("Vous devez saisir au moins 3 caractères !");
     $(".alert-danger").fadeIn();
   }
 });
 

 $(".delete").click(function(event) {
   
  event.preventDefault(); 
  console.log(event.target);
  
  var link = $(this);
  link.parent().fadeOut( function() {
     $.get(link.attr("href"), function( data ) {
       //console.log(data);
    });
  });
     
 });
 
})



