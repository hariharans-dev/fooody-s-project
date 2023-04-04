let f=0
let i=0
$(document).ready(function(){
  $('#popdrop').hide()
})
$('#userimg').click(function(){
    $('#popdrop').show()
})
$('#userimg').mouseleave(function(){
  $('#popdrop').mouseleave(function(){
    $('#popdrop').hide()
  })
})
$('#pass').hide()

$('#sout').click(function(){
  $('#pass').show()
  $('#popdrop').hide()
})

$('#pass').mouseenter(function(){
  $('#pass').mouseleave(function(){
    $('#pass').hide()
  })})