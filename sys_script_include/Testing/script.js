var Testing = Class.create();
Testing.prototype = {
    initialize: function() {
    },

    trying: function(){

        gs.info("Will this change be in the global scope?");
        gs.info("This is a sample function");
        gs.info("Now testing the custom update set!");
        gs.info("Please go in there as a custom update!");
        gs.info("is it going to work now?");
    },

    type: 'Testing'
};