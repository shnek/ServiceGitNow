var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var fs = require('fs-extra');
var chokidar = require('chokidar');
const args = process.argv;

const confFile = (args.length > 2 && args[2].endsWith(".conf.json")) ? args[2] : "sgn.conf.json";
const conf = JSON.parse(fs.readFileSync(confFile, "utf8"));

const stdin = process.openStdin();

stdin.addListener("data", function (data) {
  var command = data.toString().trim();
  if (command.toUpperCase() == "STOP") {
    console.log("Stopping the application");
    process.exit();
  }
});



if(args.length > 3) conf.app = args[3];

fs.outputFile(confFile, JSON.stringify(conf));

if (conf.app) {
  console.log("You are syncing application: " + conf.app);
  const app = "https://" + conf.instance + ".service-now.com/api/now/table/sys_app";
  var response = syncWidgetCode(app, '', "GET");
  var filtered = response.filter(e => e.name == conf.app).reduce(e => e);
  //console.log(filtered.sys_id);
  const appFiles = "https://" + conf.instance + ".service-now.com/api/now/table/sys_metadata?sysparm_query=sys_scope=" + filtered.sys_id;
  var appFilesData = syncWidgetCode(appFiles, '', "GET");
  appFilesData.forEach(e => {
    var element = conf.tables.filter(table => table.name == e.sys_class_name);
    if (element.length > 0) {
      element[0].sys_ids.push(e.sys_id);
    } else {
      //console.log(e.sys_class_name + " is not supported in this version");
    }
  });
}

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
              if (err || !data) {
              } else {
                var body = {};
                body[e.bodyname] = data;
                syncWidgetCode(link, JSON.stringify(body));
              }
            });
          })
        )
    });
  })
});

function syncWidgetCode(link, body, type = "PUT") {
  var xhttp = new XMLHttpRequest();
  xhttp.open(type, link, false);
  xhttp.setRequestHeader("Accept", "application/json");
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.setRequestHeader("Authorization", conf.authorization);
  xhttp.send(body);
  var response = JSON.parse(xhttp.responseText);
  return response.result;
}
