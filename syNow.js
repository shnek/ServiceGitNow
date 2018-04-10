var readline = require('readline');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var fs = require('fs-extra');
var chokidar = require('chokidar');

console.log("Running sy(nc)Now, a program that syncs ServiceNow scripts with local files. Type 'exit' and press enter to stop this program.")

const args = process.argv;
const confFile = (args.length > 2 && args[2].endsWith(".conf.json")) ? args[2] : "sgn.conf.json";
const conf = JSON.parse(fs.readFileSync(confFile, "utf8"));

const stdin = process.openStdin();

const interface = readline.createInterface(process.stdin, process.stdout);

var lastCommand = "";

interface.setPrompt('');
interface.prompt();
interface.on('line', function (line) {
  if (line === "exit") interface.close();
  interface.prompt();
}).on('close', function () {
  process.exit(0);
});

var setup = args.filter(e => e == "--setup").length;
if (setup) {
  interface.question('What is your <instance> name of <instance>.service-now.com?: ', (answer) => {
    conf.instance = answer;
    interface.question('What is your user name?: ', (answer) => {
      var name = answer;
      interface.question('What is your password?: ', (answer) => {
        conf.authorization = "Basic " + Buffer.from(name + ":" + answer).toString('base64');
        interface.question('What is your application name? Leave blank to skip: ', (answer) => {
          if (answer != "") {
            conf.app = answer;
          }
          fs.outputFile(confFile, JSON.stringify(conf));
          getAppFilesInfo(conf);
          runAppSync(conf);
        });
      })
    });
  });
} else {
  if(!conf.authorization || !conf.instance){
    console.log("You have not configured the instance, please run this command with --setup flag");
  }
  if (conf.app) getAppFilesInfo(conf);
  runAppSync(conf);
}

function getAppFilesInfo(conf) {

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

function runAppSync(conf) {
  conf.tables.forEach((table) => {
    table.sys_ids.forEach((sys_id) => {

      const link = "https://" + conf.instance + ".service-now.com/api/now/table/" + table.name + "/" + sys_id;
      const response = syncWidgetCode(link, '');
      table.files.forEach((e) => {
        var foldername = response[table.foldername].split(" ").join("_").split("/").join("_")
        fs.ensureDirSync("./" + table.name + "/" + foldername);
        fs.outputFile("./" + table.name + "/" + foldername + "/" + e.filename, response[e.bodyname])
          .then(chokidar.watch("./" + table.name + "/" + foldername + "/" + e.filename, { persistent: true, interval: conf.watcherFrequency })
            .on('change', (event, path) => {
              console.log("Syncing " + event);
              var data = fs.readFile("./" + table.name + "/" + foldername + "/" + e.filename, "utf8", (err, data) => {
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

}

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
