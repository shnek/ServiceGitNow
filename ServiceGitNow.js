var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var fs = require('fs-extra');
var chokidar = require('chokidar');

const conf = JSON.parse(fs.readFileSync("sgn.conf.json", "utf8"));

conf.tables.forEach((table) => {
  table.sys_ids.forEach((sys_id) => {

    const link = "https://" + conf.instance + ".service-now.com/api/now/table/" + table.name + "/" + sys_id;
    const response = syncWidgetCode(link, '');

    table.files.forEach((e) => {
      fs.ensureDirSync("./" + table.name + "/" + response[table.foldername]);
      fs.outputFile("./" + table.name + "/" + response[table.foldername] + "/" + e.filename, response[e.bodyname])
        .then(chokidar.watch("./" + table.name + "/" + response[table.foldername] + "/" + e.filename, { persistent: true, interval: conf.watcherFrequency })
          .on('change', (event, path) => {
            console.log(event + ":" + path);
            var data = fs.readFile("./" + table.name + "/" + response[table.foldername] + "/" + e.filename, "utf8", (err, data) => {
              if (err || !data) throw err;
              var body = {};
              body[e.bodyname] = data;
              syncWidgetCode(link, JSON.stringify(body));
            });
          })
        )
    });
  })
});

function syncWidgetCode(link, body) {
  var xhttp = new XMLHttpRequest();
  xhttp.open("PUT", link, false);
  xhttp.setRequestHeader("Accept", "application/json");
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.setRequestHeader("Authorization", conf.authorization);
  xhttp.send(body);
  var response = JSON.parse(xhttp.responseText);
  return response.result;
}
