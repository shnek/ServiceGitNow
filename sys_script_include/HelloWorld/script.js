var HelloWorld = Class.create();
HelloWorld.prototype = Object.extendsObject(AbstractAjaxProcessor, {
   helloWorld:function() { return "Hello " + this.getParameter('sysparm_user_name') + "!"; } ,
   _privateFunction: function() { // this function is not client callable     
    }
 });