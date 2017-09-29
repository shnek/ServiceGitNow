# Service Git Now
This framework was created to fix some quirks during working with the ServiceNow platform. First of all, it enables developers working on ServiceNow code in their preferred integrated desktop environment. This feature is important for developers used to their own IDE and shortcuts and all the features that the integrated desktop environment provides. 
The other feature of this framework is that developers are now able to run a separate repository for the code, work on different branches and use full power of version control features like merging, amending etc.

## Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.
### Prerequisites
This project requires [node](https://nodejs.org/en/) and [npm](https://www.npmjs.com/). Please follow instructions for installing included in the links. After installation verify that the applications were installed correctly:

```
node --version
```
```
npm --version
```

Your ServiceNow instance has to have enabled read and write access to Service Portal widget table: `sp_widget` in order to grant permissions to read and write using *REST API* calls. 
### Installing
Clone the repository:
```
git clone https://repository
```
Install required node modules:
```
npm install
```
And you are done!

### Configuration file

After installing required modules you need to configure the `sgn.conf.json` file.
The configuration has two parts, first is instance dependent, having properties listed below:

- Instance name, for example if your personal instance name is `jahnelgroup.service-now.com`: 

```json
"instance": "jahnelgroup"
```

 
- Authorization token, which you can generate from [this service](https://www.blitter.se/utils/basic-authentication-header-generator/).
The configuration file should have the whole authorization token, for example:
```json
"authorization": "Basic abCDeFgHJkLMnOpQrsTuvw=="
```

- Watcher frequency, a time in miliseconds that is the maximum time before the script notices a change inside a file and react with updating the ServiceNow instance:
```json
"watcherFrequency": 1000
```

The second parth of the configuration file are related to mapping ServiceNow tables onto local files. Configuration begins with an array of tables which consist of configuration for specific table:
```json
"tables": [
    {
        "name": "table_name",
        "foldername": "folder_name",
        "sys_ids": ["sys_id1", "sys_id2"],
        "files": [{
            "filename": "name.txt",
            "bodyname": "record"
            }
        ]
    }
]
```
The `name` property represents the table name in the ServiceNow instance. If you can access the table records by inputing `table.list` into the search bar in ServiceNow, you can use the `table` as a name to acces this table in the script.

The `foldername` property creates a folder having all the fields related to specific record. You have to set it to a value exisiting in the record for this table. For example `sp_widget` table has an `id` field having a name of the widget.

**NOTE:** The value of `foldername` shouldn't include any spaces or slashes. This may result in a script error!

The `sys_ids` array consists of `sys_id` of specific records inside the table that you want to access.

The `files` array consists of a mapping between files on a local drive, named by the `filename` property, and records in the ServiceNow table, named by the `bodyname` property.

### Example configuration file

In order to give an example of good configuration file, there is one attached below:

```json
{
    "instance": "dev12345",
    "authorization": "Basic YWRtaW46VGVzdDEyMyQlXg==",
    "tables": [
      {
        "name" : "sp_widget",
        "foldername" : "id",
        "sys_ids" : [
          "e8e4e62f0f1103005bc087ece1050e2e"
        ], 
        "files" : [
          {
            "filename": "client.js",
            "bodyname": "client_script"
          },
          {
            "filename": "server.js",
            "bodyname": "script"
          },
          {
            "filename": "page.html",
            "bodyname": "template"
          },
          {
            "filename": "style.scss",
            "bodyname": "css"
          }
        ]
      },
      {
        "name" : "sys_script",
        "foldername" : "sys_id",
        "sys_ids" : [
          "562f7ed04fb00300ab7100f18110c7ab"
        ],
        "files" : [
          {
            "filename" : "business.js",
            "bodyname" : "script"
          }
        ]
      }
    ]
    ,
    "watcherFrequency": 1000  
}

```
### Running the script

In order to run the script you have to execute the `ServiceGitNow.js` file with node:
```bash
node ServiceGitNow.js
```

## Version
This software is currently in an beta stage, version `1.0.0`.

## License
This project is licensed under the MIT License

## Author
* **Jakub Synowiec** - [GitHub](https://github.com/shnek)

## Acknowledgments
* The project is currently serving only widget code. In the future there is plan to add similar functionality to other ServiceNow places that you can develop code at, for instance Business Scripts, Client Scripts.
* The application is not tested outside of user testing on my personal developer instance. Upon granting read and write privileges to specific tables and enabling REST calls to your instance it should work with any instance, but I cannot guarantee that.
* This script has been developed under Manjaro Linux and has not been tested with either Mac or Windows operating systems.
