var address;
var progress;
var increment;

/**
 * Saves options to localStorage.
 */
function saveOptions() {
  var ipelement = document.getElementById("ip");
  var portelement = document.getElementById("port");
  var status = document.getElementById("status");

  var ipvalid = isIpAddressValid(ipelement.value);

  if(!ipvalid) {
    return;
  }
  localStorage["ip"] = ipelement.value;
  localStorage["port"] = portelement.value;
  console.log(localStorage["ip"]);
}

/**
 * This function validates the given IP address for the required format
 */

function isIpAddressValid(ipaddress)
{
  console.log(ipaddress);
  if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress))
  {
    console.log("correct IP");
    return (true);
  }
  console.log("wrong IP");
  return (false);
}

/**
 * Restores select box state to saved value from localStorage.
 */

function restoreOptions() {
  var ip = localStorage["ip"];
  var port = localStorage["port"];
  if (!ip && !port) {
    return;
  }
  document.getElementById("ip").value = ip;
  document.getElementById("port").value = port;
  setupRpcUrl();
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('#save').addEventListener('click', saveOptions);


function sendCmdToXbmc(data, callback)
{
  callback = callback || function() {};
  $.ajax({
        type: 'POST',
        dataType: 'json',
        contentType: "application/json",
        data: JSON.stringify(data),
        url: address,
        success: function(sdata){
        callback(sdata);
        console.log(sdata);
        },
        error: function(sdata){
          console.log(sdata);
        }
    });
}

function playpause()
{
  var data = {"jsonrpc": "2.0", "method": "Player.PlayPause", "params": { "playerid": 1 }, "id": 1};
  sendCmdToXbmc(data, playpauseResponse);
}

function playpauseResponse(data)
{
  increment = 0;
}

function stop()
{
  var data = {"jsonrpc": "2.0", "method": "Player.Stop", "params": { "playerid": 1 }, "id": 1};
  sendCmdToXbmc(data, stopResponse);
}

function stopResponse(data)
{
  location.reload(true);
}

function progress()
{
  var data = {"jsonrpc": "2.0", "method": "Player.GetProperties", "params": { "playerid": 1, "properties" : ["time", "totaltime"] }, "id": 1};
  sendCmdToXbmc(data, progressResponse);
}

function progressResponse(data)
{
  var tt = data.result.totaltime;
  var t = data.result.time;
  tt = (tt.hours)*3600+(tt.minutes)*60+(tt.seconds)+(tt.milliseconds)/1000;
  t = (t.hours)*3600+(t.minutes)*60+(t.seconds)+(t.milliseconds)/1000;
  progress = (t / tt) * 100;
  increment = (1/tt)*100;
  updateProgressBar();
}

function seek()
{
  var data = {"jsonrpc":"2.0","id":1,"method":"Player.Seek","params":{"playerid":1,"value":request.time*1.0}};
  sendCmdToXbmc(data, seekResponse);
}

function seekResponse(data)
{
  var tt = data.result.totaltime;
  var t = data.result.time;
  tt = (tt.hours)*3600+(tt.minutes)*60+(tt.seconds)+(tt.milliseconds)/1000;
  t = (t.hours)*3600+(t.minutes)*60+(t.seconds)+(t.milliseconds)/1000;
  progress = (t / tt) * 100;
  increment = (1/tt)*100;
}

function updateProgressBar()
{
  document.getElementById('progressBar').style.width= (progress) +'%';
  document.getElementById('fader').value = progress;
  var timeLeftInSecs = progress/increment;
  var hours = Math.floor(timeLeftInSecs / 3600);
  var minutes = Math.floor(timeLeftInSecs / 60);
  var seconds = timeLeftInSecs - hours * 3600 - minutes * 60;
  document.getElementById('timeleft').innerHTML = hours+':'+minutes+':'+seconds.toFixed(3);
  if(progress < 100 && increment != 0)
  {
    progress = progress + increment;
    setTimeout(updateProgressBar,1000);
  }
  else
  {
    location.reload(true);
  }
}

function setupRpcUrl()
{
  var ip = localStorage["ip"];
  var port = localStorage["port"];
  if(!ip) {
    alert('XBMC IP address not configured, Do it from the options page');
    return;
  }
  if(!port)
  {
    address = 'http://' + ip +'/jsonrpc';
  }
  else
  {
    address = 'http://' + ip + ':' + port +'/jsonrpc';
  }
  progress();
}

window.onload = restoreOptions;
document.querySelector('#save').addEventListener('click', saveOptions);
