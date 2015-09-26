// Wait till the browser is ready to render the game (avoids glitches)
window.onload=(function () {
  var d = new Date();
  document.getElementById("date").innerHTML = d.toDateString();
});
