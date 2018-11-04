function onLoad() {
   //Type appropriate comment here, and begin script below
   
var ga = new GlideAjax('x_149971_test.HelloWorld');
ga.addParam('sysparm_name', 'helloWorld');
ga.addParam('sysparm_user_name', "Bob");
ga.getXML(HelloWorldParse);
 
function HelloWorldParse(response) {
  var answer = response.responseXML.documentElement.getAttribute("answer");
  alert(answer); }
}