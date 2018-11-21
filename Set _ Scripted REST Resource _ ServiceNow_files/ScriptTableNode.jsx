/*! RESOURCE: /scripts/classes/ScriptTableNode.js */
var ScriptTableNode = Class.create(GwtTree2Node, {
initialize: function(parent, id, label) {
GwtTree2Node.prototype.initialize.call(this, parent, id, label);
this.funcCall = "";
},
buildAjaxDocument: function(allChildrenFlag, id, ajax) {
ajax.addParam("sysparm_name", this.id);
},
createChildNode: function(parent, xmlNode) {
var name = xmlNode.getAttribute("name");
var args = xmlNode.getAttribute("args");
var item = new ScriptTableNode(parent, name, name);
if (!args)
args = "";
else {
var args = args.split(',');
for (var i = 0; i < args.length; i++) {
var a = args[i].split('.');
args[i] = trim(a[a.length - 1]);
}
args = args.join(', ');
}
item.funcCall = name + "(" + args + ")";
item.setImage("images/function_obj.gifx");
item.setOnClick(item._onClick.bind(item));
item.setCanExpand(false);
return item;
},
_onClick: function() {
if (this.tree.syntaxEditor)
insertFieldIntoEditor(this.funcCall, this.tree.target);
else
insertFieldName(this.tree.target, this.funcCall);
}
});
;
