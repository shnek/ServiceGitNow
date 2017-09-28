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
Required properties to change are:
- Instance name, for example if your personal instance name is `jahnelgroup.service-now.com`: 

```json
"instance": "jahnelgroup"
```

 
- Authorization token, which you can generate from [this service](https://www.blitter.se/utils/basic-authentication-header-generator/).
The configuration file should have the whole authorization token, for example:
```json
"authorization": "Basic abCDeFgHJkLMnOpQrsTuvw=="
```
- Widgets that you want to synchronize between this script and your instance, using `sys_id` of the widget, for instance:
```json
    "widgets": [
        "ba765cd6a764b76548e786587a786587",
        "b87c5876ad87659a8654bdc8ba654d58",
        "ad876b5d876ad87b65d8b6a54d5c865d"
    ]
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
