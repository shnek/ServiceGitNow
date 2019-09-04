var readline = require('readline');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var fs = require('fs-extra');
var chokidar = require('chokidar');

console.log("Running sy(nc)Now, a program that syncs ServiceNow scripts with local files. Type 'close' and press enter to stop this program.")

const args = process.argv;
const confFile = (args.length > 2 && args[2].endsWith(".conf.json")) ? args[2] : "sgn.conf.json";
const conf = JSON.parse(fs.readFileSync(confFile, "utf8"));

const stdin = process.openStdin();

var interface;

if (hasFlag("--setup")) {
  enableSetup();
  interface.question('What is your <instance> name of <instance>.service-now.com?: ', (answer) => {
    conf.instance = answer;
    interface.question('What is your user name?: ', (answer) => {
      var name = answer;
      interface.question('What is your password?: ', (answer) => {
        conf.authorization = "Basic " + Buffer.from(name + ":" + answer).toString('base64');
        interface.question('What is your application name? Leave blank to skip: ', (appName) => {
          if (appName != undefined && appName != "") {
            conf.app = appName;
          } else {
            conf.app = null;
            console.log("Skipping pulling application data");
          }
          fs.outputFile(confFile, JSON.stringify(conf));
          getAppFilesInfo(conf);
          runAppSync(conf);
        });
      })
    });
  });
} else if (hasFlag("--cli")) {
  enableCli();
} else if (hasFlag("--update-set")) {
  var command = args[args.indexOf("--update-set") + 1];
  if (command == "list") {
    var xhttp = new XMLHttpRequest();
    var link = "";
    if (hasFlag("--app")) {
      link = "https://" + conf.instance + ".service-now.com/api/x_149971_test/synow_us?app=" + args[args.indexOf("--app") + 1];
    } else {
      link = "https://" + conf.instance + ".service-now.com/api/x_149971_test/synow_us";
    }
    xhttp.open("GET", link, false);
    xhttp.setRequestHeader("Accept", "application/json");
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.setRequestHeader("Authorization", conf.authorization);
    xhttp.send();
    if (xhttp.responseText && xhttp.responseText.length < 1000) {
      var response = JSON.parse(xhttp.responseText);
      console.log(response.result);
    }
    process.exit(0);
  } else if (command == "download") {
    var app = args[args.indexOf("--app") + 1];
    var name = args[args.indexOf("--name") + 1];
    var xhttp = new XMLHttpRequest();
    const link = "https://" + conf.instance + ".service-now.com/api/x_149971_test/synow_us?app=" + app + "&name=" + name;
    xhttp.open("PUT", link, false);
    xhttp.setRequestHeader("Accept", "application/json");
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.setRequestHeader("Authorization", conf.authorization);
    xhttp.send();
    var downloadUrl = "https://" + conf.instance + ".service-now.com/" + JSON.parse(xhttp.responseText).result;

    var xdownload = new XMLHttpRequest();
    xdownload.open("GET", downloadUrl, false);
    xdownload.setRequestHeader("Accept", "application/json");
    xdownload.setRequestHeader("Content-Type", "application/json");
    xdownload.setRequestHeader("Authorization", conf.authorization);
    xdownload.send();
    fs.outputFile("./" + app + "-" + name + ".xml", xdownload.responseText.toString(), "utf8", () => process.exit(0));
  } else if (command == "set") {
    var app = args[args.indexOf("--app") + 1];
    var name = args[args.indexOf("--name") + 1];
    var status = args[args.indexOf("--status") + 1];
    var xhttp = new XMLHttpRequest();
    const link = "https://" + conf.instance + ".service-now.com/api/x_149971_test/synow_us?app=" + app + "&name=" + name + "&status=" + status;
    xhttp.open("POST", link, false);
    xhttp.setRequestHeader("Accept", "application/json");
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.setRequestHeader("Authorization", conf.authorization);
    xhttp.send();
    process.exit(0);
  }
} else if (hasFlag("--exec")) {
  var number = args.indexOf("--exec") + 1;
  if (args.length > number) {
    var filename = args[number];
    fs.readFile(filename, "utf8", (err, data) => {
      sendCommand(data);
      process.exit(0);
    });
  } else {
    console.log("You must provide filename of script you want to execute");
  }
} else {
  enableSetup();
  if (!conf.authorization || !conf.instance) {
    console.log("You have not configured the instance, please run this command with --setup flag");
  } else {
    getAppFilesInfo(conf);
    runAppSync(conf);
  }
}

function getAppFilesInfo(conf) {
  if (conf.app != null) {
    console.log("You are syncing application: " + conf.app);
    const app = "https://" + conf.instance + ".service-now.com/api/now/table/sys_app";
    var response = syncWidgetCode(app, '', "GET");
    if (response.length > 0) {
      var filtered = response.filter(e => e.name == conf.app).reduce(e => e);
      const appFiles = "https://" + conf.instance + ".service-now.com/api/now/table/sys_metadata?sysparm_query=sys_scope=" + filtered.sys_id;
      var appFilesData = syncWidgetCode(appFiles, '', "GET");
      appFilesData.forEach(e => {
        var element = conf.tables.filter(table => table.name == e.sys_class_name);
        if (element.length > 0) {
          element[0].sys_ids.push(e.sys_id);
        } else {
          console.log(e.sys_class_name + " is not supported in this version");
        }
      });
    }
  }
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
          .then(chokidar.watch("./" + table.name + "/" + foldername + "/" + e.filename, {
              persistent: true,
              interval: conf.watcherFrequency
            })
            .on('change', (event, path) => {
              console.log("Syncing " + event);
              var data = fs.readFile("./" + table.name + "/" + foldername + "/" + e.filename, "utf8", (err, data) => {
                if (err || !data) {} else {
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
  console.log(response);
  return response.result;
}

var commands = [];

function executeCommand(command) {
  commands.push(command);
  var xhttp = new XMLHttpRequest();
  const link = "https://" + conf.instance + ".service-now.com/api/x_149971_test/synow";
  xhttp.open("PUT", link, false);
  xhttp.setRequestHeader("Accept", "application/json");
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.setRequestHeader("Authorization", conf.authorization);
  xhttp.send(commands.join("\n"));
  if (xhttp.responseText && xhttp.responseText.length < 1000) {
    var response = JSON.parse(xhttp.responseText);
    console.log(response.result);
  }
}

function sendCommand(command) {
  var xhttp = new XMLHttpRequest();
  const link = "https://" + conf.instance + ".service-now.com/api/x_149971_test/synow";
  xhttp.open("PUT", link, false);
  xhttp.setRequestHeader("Accept", "application/json");
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.setRequestHeader("Authorization", conf.authorization);
  xhttp.send(command);
  if (xhttp.responseText && xhttp.responseText.length < 1000) {
    var response = JSON.parse(xhttp.responseText);
    console.log(response.result);
  }
}


function enableCli() {
  interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "snow> "
  });


  interface.on("line", (line) => {
    switch (line.trim()) {
      case "close":
        console.log("Exiting the application!");
        process.exit(0);
      default:
        executeCommand(line.trim());
        break;
    }
    interface.prompt();
  }).on("close", () => {
    console.log("Exiting the application!");
    process.exit(0);
  })
  interface.prompt();
}

function enableSetup() {
  interface = readline.createInterface(process.stdin, process.stdout);
  interface.setPrompt('');
  interface.on('line', function (line) {
    if (line === "exit") interface.close();
    interface.prompt();
  }).on('close', function () {
    process.exit(0);
  });
  interface.prompt();
}

function hasFlag(arg) {
  return args.filter(e => e == arg).length
}