var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var fs = require('fs');

const conf = JSON.parse(fs.readFileSync("sgn.conf.json", "utf8"));

conf.widgets.forEach( (widget) => {
  const link = "https://" + conf.instance + ".service-now.com/api/now/table/sp_widget/" + widget;

  const response = syncWidgetCode(link, '');

  conf.files.forEach( ({filename, bodyname}) => {
    if(!fs.existsSync("widgets")) fs.mkdirSync("widgets", ()=>{});
    if(!fs.existsSync("./widgets/" + response.id)) fs.mkdirSync("./widgets/" + response.id, ()=>{});
    fs.writeFile("./widgets/" + response.id + "/" + filename, response[bodyname], function(){
      fs.watchFile("./widgets/" + response.id + "/" + filename, {persistent: true, interval: conf.watcherFrequency},  (curr, prev) => {
        var data = fs.readFile("./widgets/" + response.id + "/" + filename, "utf8", (err, data) => {
          if (err) throw err;
          var body = {};
          body[bodyname] = data;
          syncWidgetCode(link, JSON.stringify(body));
        });
      });
    })
  })  
});

function syncWidgetCode(link, body){
  var xhttp = new XMLHttpRequest();
  xhttp.open("PUT", link, false);
  xhttp.setRequestHeader("Accept", "application/json");
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.setRequestHeader("Authorization", conf.authorization  );
  xhttp.send(body);
  var response = JSON.parse(xhttp.responseText);
  return response.result;
}