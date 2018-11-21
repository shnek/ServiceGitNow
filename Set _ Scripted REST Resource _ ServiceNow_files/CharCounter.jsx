/*! RESOURCE: /scripts/plugins/CharCounter.js */
Plugin.create('charCounter', {
initialize: function(elem, options){
var defaults = {
allowed: 140,
warning: 25,
css: 'counter',
counterElement: 'span',
cssWarning: 'warning',
cssExceeded: 'exceeded',
counterText: ''
};
var options = Object.extend(defaults, options);
function calculate(obj){
var count = $(obj).getValue().length,
available = options.allowed - count;
if (available <= options.warning && available >= 0){
$(obj).next().addClassName(options.cssWarning);
}else{
$(obj).next().removeClassName(options.cssWarning);
}
if (available < 0){
$(obj).next().addClassName(options.cssExceeded);
}else{
$(obj).next().removeClassName(options.cssExceeded);
}
$(obj).next().update(options.counterText + available);
};
$(elem).insert({
after: ('<'+ options.counterElement +' class="' + options.css + '">'+ options.counterText +'</'+ options.counterElement +'>')
});
calculate(elem);
$(elem).observe('keyup', function(){calculate(this)});
$(elem).observe('change', function(){calculate(this)});
}
});
;
