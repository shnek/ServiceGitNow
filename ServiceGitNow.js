var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var fs = require('fs');

const conf = JSON.parse(fs.readFileSync("sgn.conf.json", "utf8"));

conf.tables.forEach( (table) => {
  table.sys_ids.forEach((sys_id) => {

    const link = "https://" + conf.instance + ".service-now.com/api/now/table/" + table.name + "/" + sys_id;
    const response = syncWidgetCode(link, '');

    table.files.forEach( ({filename, bodyname}) => {
      if(!fs.existsSync(table.name)) fs.mkdirSync(table.name, ()=>{});
      if(!fs.existsSync("./" + table.name + "/" + response[table.foldername])) fs.mkdirSync("./" + table.name + "/" + response[table.foldername], ()=>{});
      fs.writeFile("./" + table.name + "/" + response[table.foldername] + "/" + filename, response[bodyname], function(){
        fs.watchFile("./" + table.name + "/" + response[table.foldername] + "/" + filename, {persistent: true, interval: conf.watcherFrequency},  (curr, prev) => {
          var data = fs.readFile("./" + table.name + "/" + response[table.foldername] + "/" + filename, "utf8", (err, data) => {
            if (err) throw err;
            var body = {};
            body[bodyname] = data;
            syncWidgetCode(link, JSON.stringify(body));
          });
        });
      })
    })  
  }); 
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