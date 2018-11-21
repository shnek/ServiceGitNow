/*! RESOURCE: /scripts/classes/ScriptTableTree.js */
var ScriptTableTree = Class.create(GwtTree2, {
initialize: function(treeName, element, table, target, includeFunctions) {
GwtTree2.prototype.initialize.call(this, treeName, element);
this.xmlItemNodeName = "item";
this.showRootNode = false;
this.tableName = table;
this.target = target;
this.treeElement= element;
this.includeFunctions = includeFunctions;
this.email = false;
this.syntaxEditor = false;
this.tinymce = false;
this.fieldMsg = getMessage("uppercase_fields");
},
_init: function() {
var rootNode = new GwtTree2Node(this, "", "Root");
rootNode.processedChildren = true;
rootNode.show();
var fieldNode = new FieldTreeNode(rootNode, this.tableName, this.fieldMsg);
fieldNode.tableName = this.tableName;
fieldNode.processor = "SysMeta";
rootNode.appendChild(fieldNode);
if (this.includeFunctions) {
var node = new ScriptTableNode(rootNode, "current", "GlideRecord");
node.processor = "Slots";
node.sorted = true;
rootNode.appendChild(node);
node = new ScriptTableNode(rootNode, "element", "GlideElement");
node.processor = "Slots";
node.sorted = true;
rootNode.appendChild(node);
node = new ScriptTableNode(rootNode, "gs", "System");
node.processor = "Slots";
node.sorted = true;
rootNode.appendChild(node);
if (typeof g_scratchpad != "undefined" && g_scratchpad.isGlobalScope) {
node = new ScriptTableNode(rootNode, "gs DateTime", "System Date/Time");
node.processor = "Slots";
node.sorted = true;
rootNode.appendChild(node);
node = new ScriptTableNode(rootNode, "gs Logging", "System Logging");
node.processor = "Slots";
node.sorted = true;
rootNode.appendChild(node);
}
node = new ScriptTableNode(rootNode, "aggregate", "GlideAggregate");
node.processor = "Slots";
node.sorted = true;
rootNode.appendChild(node);
}
rootNode.expand();
},
dependChange: function(el, oldVal, newVal) {
if (this.root)
this.root.deleteMe();
this.tableName = newVal;
this._init();
}
});
;
