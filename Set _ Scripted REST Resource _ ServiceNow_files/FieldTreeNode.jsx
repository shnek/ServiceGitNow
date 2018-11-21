/*! RESOURCE: /scripts/classes/FieldTreeNode.js */
var FieldTreeNode = Class.create(GwtTree2Node, {
initialize: function(parent, id, label) {
GwtTree2Node.prototype.initialize.call(this, parent, id, label);
this.isIndexed = false;
this.isForeign = false;
},
buildAjaxDocument: function(allChildrenFlag, id, ajax) {
ajax.addParam("sysparm_type", "column");
ajax.addParam("sysparm_value", this.tableName);
ajax.addParam("sysparm_include_sysid", "true");
ajax.addParam("sysparm_flag_indexed", "yes");
},
createChildNode: function(parent, xmlNode) {
var label = xmlNode.getAttribute("label");
var item = this._createNode(parent, "", label);
var value = xmlNode.getAttribute("value");
value = value.split('.')[1];
if (parent.elementName) {
item.elementName = parent.elementName + "." + value;
item.elementLabel = parent.elementLabel + " " + label;
item.tooltip = item.elementName;
} else {
item.elementName = value;
item.elementLabel = label;
}
var table = xmlNode.getAttribute("table");
if (!table)
item.elementTableName = parent.tableName;
else
item.elementTableName = table;
if (item.elementTableName != parent.tableName)
item.isForeign = true;
item.title = item.elementTableName;
item.type = xmlNode.getAttribute("type");
item.isIndexed = (xmlNode.getAttribute("indexed") == 'yes');
var reference = xmlNode.getAttribute("reference");
if (!reference || (item.type == 'glide_list'))
reference = '';
if (reference) {
item.tableName = reference;
item.setCanExpand(true);
} else
item.setCanExpand(false);
this._setImages(item);
item.setOnClick(item._onClick.bind(item));
return item;
},
_setImages: function(item) {
if (item.type == 'index') {
item.setImage("images/index1.gifx");
item.setNodeOpenImage("images/index1.gifx");
item.setNodeClosedImage("images/index1.gifx");
} else if (item.type == 'function') {
item.setImage("images/function_obj.gifx");
} else if (!item.tableName) {
if (item.isIndexed)
item.setImage("images/indexed2.gifx");
else if (item.isForeign)
item.setImage("images/foreign.gifx");
else
item.setImage("images/element.gifx");
} else {
item.setImage("images/table.gifx");
item.setNodeOpenImage("images/table.gifx");
item.setNodeClosedImage("images/table.gifx");
}
item.setImageTitle(item.title);
},
_createNode: function(parent, id, label) {
return new FieldTreeNode(parent, id, label);
},
_onClick: function() {
var value;
if (this.tree.email)
value = this.elementLabel + ": $" + "{" + this.elementName + "}";
else
value = "current." + this.elementName;
if (this.tree.tinymce && this.tree.tinymce.editors)
this.tree.tinymce.execCommand('mceInsertRawHTML', false, value + "<br />");
else if (this.tree.syntaxEditor)
insertFieldIntoEditor(value, this.tree.target);
else
insertFieldName(this.tree.target, value);
}
});
;
