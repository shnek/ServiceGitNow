/*! RESOURCE: /scripts/gwt_tree2.js */
var SPACER_IMG = "<img src='images/16square.gifx' alt=''/>";
var GwtTree2 = Class.create({
initialize: function(treeName, element, addToTreeMapFlag, checkboxesFlag, menuFlag) {
var e = $(element);
e.innerHTML = '';
this.targetPath = null;
this.id = e.id;
this.name = treeName;
this.tooltip = '';
this.root = null;
this.focusID = -1;
this.children = cel("div", e);
this.children.id = 'treenode_' + GwtTree2.counter++;
this.imgCollapsed = "images/gwt/treenode_expand_plus.gifx";
this.imgExpanded = "images/gwt/treenode_expand_minus.gifx";
this.imgDefault = "images/gwt/document.gifx";
this.imgOpen = "images/gwt/folder_open.gifx";
this.imgClosed = "images/gwt/folder_closed.gifx";
this.imgCheckboxOn = "images/gwt/checkbox_on.gifx";
this.imgCheckboxOff = "images/gwt/checkbox_off.gifx";
this.imgCheckboxOnPartial = "images/gwt/checkbox_on_partial.gifx";
this.xmlItemNodeName = "node";
this.showRootNode = false;
if (addToTreeMapFlag) {
if (!top.navTrees) {
top.navTrees = {};
}
top.navTrees[this.name] = this;
}
this.nodes = {};
this.childNodes = {};
this.expandIdList = null;
this.processor = "com.jbmc.UIComponents.AjaxTreeProcessor";
this.method = "getTreeNodes";
this.childTable = "";
this.parentField = "";
this.nameField = "";
this.menuFlag = menuFlag;
if (this.menuFlag)
{
this.menuItems = [];
this.contextMenu = new GwtContextMenu("context_" + this.id);
}
if (checkboxesFlag) {
this.checkboxes = true;
this.checkboxCascadeUp = false;
this.checkboxCascadeDown = false;
}
else {
this.checkboxes = false;
}
this.sorted = false;
e.tree = this;
},
destroy: function() {
if (this.root)
this.root.destroy();
},
setSorted: function(flag) {
this.sorted = flag;
},
setCanExpand: function() {
},
setOpenImage: function(image) {
this.imgOpen = image;
},
setCloseImage: function(image) {
this.imgClosed = image;
},
setTargetPath: function(path) {
if (path == '')
return;
this.targetPath = {};
var entries = path.split(",");
for (var i = 0; i < entries.length; i++)
this.targetPath[entries[i]] = this;
},
setFocusID: function(id) {
this.focusID = id;
},
setCheckboxes: function(flag) {
this.checkboxes = flag;
},
setCheckboxCascade: function(flag) {
this.checkboxCascadeUp = flag;
this.checkboxCascadeDown = flag;
},
setCheckboxCascadeUp: function(flag) {
this.checkboxCascadeUp = flag;
},
setCheckboxCascadeDown: function(flag) {
this.checkboxCascadeDown = flag;
},
setCheckboxOnImage: function(image) {
this.imgCheckboxOn = image;
},
setCheckboxOffImage: function(image) {
this.imgCheckboxOff = image;
},
setCheckboxOnPartialImage: function(image) {
this.imgCheckboxOnPartial = image;
},
setCheckedIds: function(idList) {
this.checkedIdList = idList;
this._setCheckedIds();
},
_setCheckedIds: function() {
if (this.checkboxes) {
var flag = this.checkboxCascadeDown;
this.checkboxCascadeDown = false;
this.checkboxCascadeUp = flag;
idList = this.checkedIdList;
if (this.checkboxes && idList) {
var ids = idList.split(",");
for (var i = 0; i < ids.length; i++) {
if (ids[i] != "") {
var node = this.nodes[ids[i]];
if (node) {
node.setChecked(true);
}
}
}
}
this.checkboxCascadeDown = flag;
}
},
inPath: function(id) {
if (this.targetPath == null)
return false;
if (this.targetPath[id] == this)
return true;
return false;
},
getPath: function(id) {
var node = this.getNode(id);
if (node) {
var path = [];
path.push(this.pathID);
while (node.parent) {
node = node.parent;
if (node == this)
break;
path.push(node.pathID);
}
path.reverse();
var pathStr = path.join(",");
return pathStr;
}
return "";
},
getCheckedIds: function(includeTableName, excludePartial) {
if (this.checkboxes) {
var ids = [];
this._getCheckedIds(this.root, ids, includeTableName, excludePartial);
return ids.join(',');
}
else {
return "";
}
},
_getCheckedIds: function(node, ids, includeTableName, excludePartial) {
if (!node)
return;
if (node.checked && (!excludePartial || !node.checkedPartial)) {
var id = node.id;
if (includeTableName && node.tableName != '')
id = node.tableName + "." + id;
ids[ids.length] = id;
}
for (n in node.childNodes) {
if (node.childNodes[n])
this._getCheckedIds(node.childNodes[n], ids, includeTableName, excludePartial);
}
},
getExpandedIds: function() {
var ids = [];
this._getExpandedIds(this.root, ids);
return ids.join(',');
},
_getExpandedIds: function(node, ids) {
if (!node) {
return;
}
if ((node.expanded) && (node.id != "")) {
ids[ids.length] = node.id;
}
for (n in node.childNodes) {
if (node.childNodes[n]) {
this._getExpandedIds(node.childNodes[n], ids);
}
}
},
setExpandIds: function(ids) {
this.expandIdList = ids.split(',');
},
getAll: function() {
var ajax = this._defaultAjax();
ajax.getXML(this.getAllResponse.bind(this), null, null);
},
_defaultAjax: function() {
var ajax = new GlideAjax(this.processor, null);
ajax.disableRunInBatch();
ajax.addParam("method", this.method);
ajax.addParam('data', '<data type="all' +
'" tree_name="' + this.treeName +
'" child_table="' + this.childTable +
'" parent_field="' + this.parentField +
'" name_field="' + this.nameField +
'" />');
return ajax;
},
getAllResponse: function(response) {
var nodes = response.responseXML.getElementsByTagName(this.xmlItemNodeName);
this.root._addChildNodes(nodes);
this._setCheckedIds();
this.root.expand();
},
insert: function(parentId, id) {
var node;
if (parentId == "") {
node = this.root;
return;
}
else {
node = this.nodes[parentId];
}
if (node) {
node.addChildNodeById(id);
}
},
update: function(id) {
var node = this.nodes[id];
if (node) {
node.checkUpdates();
}
},
deleteNode: function(id) {
var node = this.nodes[id];
if (node) {
node.deleteMe();
}
},
renameNode: function(id, text) {
var node = this.nodes[id];
if (node) {
node.rename(text);
}
},
getNode: function(id) {
return this.nodes[id];
},
moveNode: function(id, newParent) {
},
addMenuItem: function(appliesTo, text, type, url, target) {
if (this.menuFlag) {
var item = new GwtTree2MenuItem();
item.appliesTo = appliesTo;
item.text = text;
item.type = type;
item.url = url;
item.target = target;
this.menuItems[this.menuItems.length] = item;
}
},
buildMenu: function(node) {
if (this.menuFlag) {
this.contextMenu.clear();
for (var i = 0; i < this.menuItems.length; i++) {
var menuItem = this.menuItems[i];
if ((menuItem.appliesTo == "*") ||
(menuItem.appliesTo == node.tableName) ||
(menuItem.appliesTo == node.id)) {
if (menuItem.type == "url") {
this.contextMenu.addURL(menuItem.text, this._handleReplacements(menuItem.url, node), menuItem.target);
}
else if (menuItem.type == "href") {
this.contextMenu.addHref(menuItem.text, this._handleReplacements(menuItem.url, node));
}
else if (menuItem.type == "line") {
this.contextMenu.addLine();
}
}
}
}
},
_handleReplacements: function(txt, node) {
txt = txt.replace(/\{id\}/g, node.id);
txt = txt.replace(/\{name\}/g, node.text);
return txt;
}
});
GwtTree2.counter = 0;
var GwtTree2MenuItem = Class.create({
initialize: function() {
this.appliesTo = "";
this.type = "";
this.text = "";
this.url = "";
this.target = "";
}
});
var GwtTree2Node = Class.create(GwtObservable, {
LOADING_IMAGE : 'images/loading_tree_anim.gifx',
initialize: function(parent, id, text) {
if (arguments.length == 0) {
return;
}
if ((id == "-1") || (id == null)) {
id = "";
}
this.clickAble = false;
this.onClick = null;
this.onClickFunc = null;
this.id = id;
this.pathID = id;
this.text = text;
this.parent = parent;
this.childNodes = {};
this.tableName = "";
this.canExpand = true;
if (typeof(this.parent.addChildNode) != "function") {
this.tree = parent;
if (this.tree.showRootNode)
this.level = 0;
else
this.level = -1;
parent.root = this;
if (this.tree.childTable) {
this.setURL(this.tree.childTable + "_list.do");
this.clickAble = true;
}
this.hasParent = false;
}
else {
this.tree = parent.tree;
this.level = parent.level + 1;
this.hasParent = true;
}
this.tree.nodes[id] = this;
this.xmlItemNodeName = parent.xmlItemNodeName;
this.processor = parent.processor;
this.method = this.tree.method;
this.childTable = this.tree.childTable;
this.parentField = this.tree.parentField;
this.nameField = this.tree.nameField;
this.textDiv = "";
this.image = "";
this.imageTitle = "";
this.color = "#999999";
this.div = document.createElement("div");
if (!this.hasParent)
this.div.setAttribute('role', 'tree');
this.table = cel("table", this.div);
this.table.setAttribute('role', 'presentation');
this.table.style.backgroundColor = "transparent"
this.table.cellSpacing = "0px";
this.table.cellPadding = "0px";
this.decorations = [];
var b = cel("tbody", this.table);
this.row = cel("tr", b);
if ((typeof(this.parent.addChildNode) != "function") && (!this.tree.showRootNode)) {
this.row.style.display = "none";
}
if ((this.tree.sorted || this.parent.sorted) && (this.hasParent)) {
var pos = null;
for (id in this.parent.childNodes) {
if (this.parent.childNodes[id]) {
node = this.parent.childNodes[id];
if (this.text < node.text) {
if (!pos || (node.text < pos.text)) {
pos = node;
}
}
}
}
if (pos == null)
this.parent.children.appendChild(this.div);
else
this.parent.children.insertBefore(this.div, pos.div);
} else
this.parent.children.appendChild(this.div);
parent.childNodes[this.id] = this;
this.children = cel("div", this.div);
this.children.setAttribute('role', 'group');
d = cel("td");
this.row.appendChild(d);
var imgCell = cel("td");
imgCell.className = "tree_spacer";
this.img = cel("img", imgCell);
this.img.alt = "";
this.img.setAttribute('aria-hidden', 'true');
this.row.appendChild(imgCell);
this.checked = false;
this.checkedPartial = false;
this.checkboxImg = "";
if ((this.tree.checkboxes) && (this.hasParent)) {
var s = cel("td");
s.className = "tree_spacer";
this.checkboxImg = cel("img", s);
this.checkboxImg.src = this.tree.imgCheckboxOff;
this.checkboxImg.alt = "Select";
this.row.appendChild(s);
Event.observe(this.checkboxImg, "click", this.checkboxToggle.bindAsEventListener(this));
}
if (this.tree.menuFlag) {
Event.observe(imgCell, "contextmenu", this.showMenu.bindAsEventListener(this));
}
this.parent.setCanExpand(true);
this.expanded = false;
this.colex = cel("img", d);
this.colex.className = "tree";
this.colex.setAttribute('aria-hidden', 'true');
var margin = 16 * (this.level);
this.colex.style.marginLeft = margin + 'px';
Event.observe(this.colex, "click", this.collapseExpand.bindAsEventListener(this));
},
deleteMe: function() {
this.parent.children.removeChild(this.div);
this.parent.childNodes[this.id] = null;
this.tree.nodes[this.id] = null;
if (this.hasParent && (this.parent._getChildCount() == 0)) {
this.parent.setCanExpand(false);
}
this.parent = "";
this.childNodes = "";
this.tree = "";
this.textDiv = "";
this.image = "";
this.div = "";
this.table = "";
this.decorations = "";
this.row = "";
this.children = "";
var imgCell = "";
this.img = "";
this.checkboxImg = "";
this.colex = "";
},
destroy: function() {
for(var key in this.childNodes) {
var node = this.childNodes[key];
node.destroy();
}
this.deleteMe();
},
setCanExpand: function(value) {
this.canExpand = value;
this.setColexImg();
},
setPathID: function(id) {
this.pathID = id;
},
setOnClick: function(click) {
this.setCanClick(true);
if (typeof(click) == "function")
this.onClickFunc = click;
else
this.onClick = click;
},
getPathID: function() {
return this.pathID;
},
setColexImg: function() {
if (!this.canExpand) {
this.colex.src = "images/s.gifx";
this.colex.alt = "";
}
else {
if (this.expanded) {
this.colex.src = this.tree.imgExpanded;
this.colex.alt = "";
}
else {
this.colex.src = this.tree.imgCollapsed;
this.colex.alt = "";
}
if (this.textDiv)
this.textDiv.setAttribute('aria-expanded', this.expanded);
}
},
setCanClick: function(value) {
this.clickAble = value;
},
setColor: function(color) {
this.color = color;
},
addChildNodeById: function(id) {
var ajax = new GlideAjax(this.processor, null);
ajax.disableRunInBatch();
ajax.addParam("method", this.method);
this.buildAjaxDocument(false, id, ajax);
ajax.getXML(this.expandResponse.bind(this), null, null);
},
checkUpdates: function() {
var ajax = new GlideAjax(this.processor, null);
ajax.disableRunInBatch();
ajax.addParam("method", this.method);
url += this.buildAjaxDocument(false, this.id, ajax);
ajax.getXML(this._checkUpdatesResponse.bind(this), null, null);
},
_checkUpdatesResponse: function(response) {
var nodes = response.responseXML.getElementsByTagName(this.xmlItemNodeName);
if (nodes.length == 1) {
var node = nodes[0];
var parentId = node.getAttribute("parent_id");
var name = node.getAttribute("name");
if (this.text != name) {
this.rename(name);
}
if (this.parent.id != parentId) {
var parent = this.tree.nodes[parentId];
var id = this.id;
var oldParent = this.parent;
this.deleteMe();
if (parent) {
parent.addChildNodeById(id);
}
}
}
},
expand: function() {
if (this.expanded)
return true;
if (this.canExpand) {
this.expanded = true;
this.canExpand = true;
if (this.processedChildren) {
if (this._getChildCount() == 0) {
this.setCanExpand(false);
}
else {
this.setColexImg();
}
show(this.children);
return true;
}
this.expander();
}
return false;
},
expander: function() {
if (!this.hasParent) {
var xml = getXMLIsland('root_node_xml');
if (xml != null) {
this.children.innerHTML = "";
this.processXML(xml);
return;
}
}
var ajax = new GlideAjax(this.processor, null);
ajax.disableRunInBatch();
ajax.addParam("method", this.method);
this.buildAjaxDocument(true, this.id, ajax);
this.children.innerHTML = "";
this.children.style.display = "block";
this.colex.src = this.LOADING_IMAGE;
ajax.getXML(this.expandResponseFull.bind(this), null, null);
},
expandResponseFull: function(response) {
this.children.innerHTML = "";
this.expandResponse(response);
},
expandResponse: function(response) {
var nodes = response.responseXML.getElementsByTagName(this.xmlItemNodeName);
for (var i = 0; i < nodes.length; i++)	{
var node = nodes[i];
this.addChildNode(node);
}
this.checkChildState();
if (this.tree.expandIdList) {
for (var i = 0; i < this.tree.expandIdList.length; i++) {
if (this.tree.expandIdList[i] != null) {
var node = this.tree.getNode(this.tree.expandIdList[i]);
this.tree.expandIdList[i] = null;
if ((node) && (!node.expand())) {
break;
}
}
}
var isEmpty = true;
for (var i = 0; i < this.tree.expandIdList.length; i++) {
if (this.tree.expandIdList[i] != null) {
isEmpty = false;
break;
}
}
if (isEmpty) {
this.tree.expandIdList = null;
}
}
if (this._getChildCount() == 0) {
this.collapse();
this._showClosedImage();
}
},
_addChildNodes: function(nodes) {
for (var i = 0; i < nodes.length; i++)	{
var node = nodes[i];
var parentId = node.getAttribute("parent_id");
if (parentId == this.id) {
var item = this.addChildNode(node);
item.processedChildren = true;
item.checkChildState();
this.checkChildState();
item._addChildNodes(nodes);
}
}
if (this.startOpened) {
this.startOpened = false;
this.expand();
} else
this.collapse();
},
addChildNode: function(xmlNode) {
this.processedChildren = true;
var item = this.createChildNode(this, xmlNode);
if (!item)
return;
item.collapse();
var children = xmlNode.getAttribute("children");
if (children) {
if (children == "0") {
item.setCanExpand(false);
}
}
var expanded = xmlNode.getAttribute("expanded");
if (expanded)
item.expand();
item.show();
return item;
},
appendChild: function(child) {
this.processedChildren = true;
child.collapse();
child.show();
},
checkChildState: function() {
var cnt = this._getChildCount();
if (cnt > 0) {
this.setCanExpand(true);
this.expand();
}
else {
this.setCanExpand(false);
}
},
_getChildCount: function() {
var cnt = 0;
for (id in this.childNodes) {
if (this.childNodes[id]) {
cnt++;
}
}
return cnt;
},
buildAjaxDocument: function(allChildrenFlag, id, ajax) {
if (id == null)
{
id = "-1";
}
var type;
if (allChildrenFlag) {
type = "child";
}
else {
type = "node";
}
ajax.addParam("data", "<data type='" + type +
"' tree_name='" + this.tree.treeName +
"' id='" + id +
"' child_table='" + this.childTable +
"' parent_field='" + this.parentField +
"' checked='" + this.checked +
"' name_field='" + this.nameField +
"' />");
},
_createNode: function(parent, id, name) {
return new GwtTree2Node(parent, id, name);
},
createChildNode: function(parent, xmlNode) {
var id = xmlNode.getAttribute("id");
var table = xmlNode.getAttribute("table");
var name = xmlNode.getAttribute("name");
var item = this._createNode(parent, id, name);
item.setTableName(table);
var url = xmlNode.getAttribute("click_url");
if ((url) && (url.length > 0)) {
item.setURL(url);
item.setCanClick(true);
}
else {
item.setCanClick(false);
}
var method = xmlNode.getAttribute("method");
if ((method) && (method.length > 0)) {
item.method = method;
}
var child_table = xmlNode.getAttribute("child_table");
if ((child_table) && (child_table.length > 0)) {
item.childTable = child_table;
}
var ichecked = xmlNode.getAttribute("checked");
if ((ichecked) && (ichecked.length > 0)) {
item.setChecked(ichecked);
}
var name_field = xmlNode.getAttribute("name_field");
if ((name_field) && (name_field.length > 0)) {
item.nameField = name_field;
}
var parent_field = xmlNode.getAttribute("parent_field");
if ((parent_field) && (parent_field.length > 0)) {
item.parentField = parent_field;
}
item.xmlReference = xmlNode;
return item;
},
collapse: function() {
if (this.expanded)
hide(this.children);
this.expanded = false;
this.setColexImg();
},
setId: function(id) {
this.id = id;
},
setText: function(text) {
this.text = text;
},
setSelected: function() {
this.style = 'font-weight:bold';
},
setURL: function(url) {
this.url = url;
},
setFrame: function(frame) {
this.target = frame;
},
setTableName: function(tableName) {
this.tableName = tableName;
},
setNodeOpenImage: function(image) {
this.nodeOpenImage = image;
},
setNodeClosedImage: function(image) {
this.nodeClosedImage = image;
},
setImage: function(image) {
this.image = image;
},
setImageTitle: function(title) {
this.imageTitle = title;
},
show: function() {
if (this.image.length) {
this.img.src = this.image;
if (this.imageTitle.length) {
this.img.title = this.imageTitle;
this.img.alt = this.imageTitle;
}
}
else if (this.canExpand) {
this.setExpandImage();
}
else {
this.img.src = this.tree.imgDefault;
this.img.setAttribute('aria-hidden', 'true');
this.img.alt = "";
if (this.imageTitle.length) {
this.img.title = this.imageTitle;
}
}
this.showTextAndDecorations();
this.row.appendChild(this.textDiv);
},
setBold: function(b) {
this.showTextAndDecorations();
if (b)
this.textDiv.className = "tree_item_text_bold";
else
this.textDiv.className = "tree_item_text";
},
showTextAndDecorations: function() {
if (this.textDiv == "") {
this.textDiv = cel("td");
if (this.tooltip)
this.textDiv.title = this.tooltip;
else
this.textDiv.title = '';
this.textDiv.className = "tree_item_text";
if (this.id == this.tree.focusID)
this.textDiv.className = "tree_item_text_focus";
} else {
this.textDiv.innerHTML = "";
}
if (this.clickAble) {
var ref = cel("a");
ref = $(ref);
ref.setAttribute("name", this.id);
this._setupTreeItem(ref);
if (this.style)
ref.setAttribute('style', this.style);
if ((this.onClick == null) && (this.onClickFunc == null)) {
ref.href = this.url;
if (typeof ref.textContent != 'undefined') {
ref.textContent = this.text
} else {
ref.innerText = this.text;
}
if (this.target)
ref.target = this.target;
} else {
ref.onclick = this.deferredClickHandler.bind(this);
if (typeof ref.textContent != 'undefined') {
ref.textContent = this.text;
} else {
ref.innerText = this.text;
}
}
this.textDiv.appendChild(ref);
}
else {
if (this.style) {
this.textDiv.setAttribute('style', this.style);
}
if (typeof this.textDiv.textContent != 'undefined') {
this.textDiv.textContent = this.text;
} else {
this.textDiv.innerText = this.text;
}
this.textDiv.style.color = this.color;
this._setupTreeItem(this.textDiv);
}
var span = cel("span");
for (var d = 0; d < this.decorations.length; d++) {
this.decorations[d].addHTML(span);
}
this.textDiv.appendChild(span);
},
_setupTreeItem: function(node) {
node.setAttribute('role', 'treeitem');
node.setAttribute('tabindex', '0');
node.setAttribute('aria-level', this.level);
if (this.canExpand) {
node.setAttribute('aria-expanded', this.expanded);
node.setAttribute('aria-controls', this.children.id);
}
node.on('keydown', this._nodeKeyDown.bind(this));
},
deferredClickHandler: function() {
if (this.onClickFunc)
this.onClickFunc(this);
else {
var evalMe = "var f = function() {" + this.onClick + "}";
eval(evalMe);
f();
}
},
addDecoration: function(decorate) {
this.decorations[this.decorations.length++] = decorate;
},
selected: function() {
this.selecter();
},
collapseExpand: function() {
if (this.expanded) {
if (this._getChildCount() == 0) {
this.setCanExpand(false);
}
else {
this.collapse();
}
}
else {
this.expand();
}
this.setExpandImage();
},
checkboxToggle: function() {
this.setChecked(!this.checked);
},
showMenu: function(event) {
if (this.tree.menuFlag) {
this.tree.buildMenu(this);
Event.stop(event);
var elem = event.target || event.srcElement;
var contextMenu = this.tree.contextMenu.getMenu().context;
contextMenu.setProperty('timeout', 200);
contextMenu.setProperty('top', grabOffsetTop(elem));
contextMenu.setProperty('left', grabOffsetLeft(elem));
contextMenu.display(event);
return false;
}
},
hideMenu: function(event) {
return contextTimeout(event, this.tree.id);
},
setChecked: function(flag) {
if (this.tree.checkboxes)
{
this.checked = flag;
this.checkedPartial = false;
if (this.tree.checkboxCascadeDown) {
this.setCheckboxForChildren(this.checked);
}
if (this.tree.checkboxCascadeUp) {
this.setPartialCheckboxState();
this.setParentCheckboxState();
}
this.showCheckbox();
}
},
setCheckboxForChildren: function(checkedState) {
for (id in this.childNodes) {
if (this.childNodes[id]) {
var node = this.childNodes[id];
node.checked = checkedState;
node.checkedPartial = false;
node.showCheckbox();
node.setCheckboxForChildren(checkedState);
}
}
},
setParentCheckboxState: function() {
if (this.hasParent && this.tree.checkboxCascadeUp) {
var theParent = this.parent;
if (theParent.isChildChecked(true)) {
theParent.checked = true;
}
theParent.setPartialCheckboxState();
theParent.showCheckbox();
theParent.setParentCheckboxState();
}
},
setPartialCheckboxState: function() {
if (this.hasParent && this.tree.checkboxCascadeUp) {
this.checkedPartial = false;
if (this.isChildChecked(true)) {
if (this.isChildChecked(false)) {
this.checkedPartial = true;
}
}
else if (this.checked && this.isChildChecked(false)) {
this.checkedPartial = true;
}
}
},
isChildChecked: function(state) {
for (id in this.childNodes) {
if (this.childNodes[id]) {
var node = this.childNodes[id];
if (state && node.checked) {
return true;
}
if (!state && !node.checked) {
return true;
}
}
}
return false;
},
showCheckbox: function() {
if (this.hasParent && this.tree.checkboxes) {
if (this.checked) {
if (this.checkedPartial) {
this.checkboxImg.src = this.tree.imgCheckboxOnPartial;
}
else {
this.checkboxImg.src = this.tree.imgCheckboxOn;
}
}
else {
this.checkboxImg.src = this.tree.imgCheckboxOff;
}
}
},
setExpandImage: function() {
if(this.canExpand) {
if (this.expanded)
this._showOpenImage();
else
this._showClosedImage();
}
},
_showOpenImage: function() {
if (this.nodeOpenImage == null)
this.img.src = this.tree.imgOpen;
else
this.img.src = this.nodeOpenImage;
this.img.alt = "";
},
_showClosedImage: function() {
if (this.nodeClosedImage == null)
this.img.src = this.tree.imgClosed;
else
this.img.src = this.nodeClosedImage;
this.img.alt = "";
},
_nodeKeyDown: function(evt) {
var keycode = evt.keyCode;
if (keycode == 37) {
if (this.canExpand && this.expanded)
this.collapseExpand();
else if (this.canExpand)
this._focusParent();
else
this._focusPrevious(evt.target);
}
else if (keycode == 39) {
if (this.canExpand && !this.expanded)
this.collapseExpand();
else
this._focusNext(evt.target);
}
else if (keycode == 40) {
this._focusNext(evt.target);
evt.preventDefault();
evt.stop();
}
else if (keycode == 38) {
this._focusPrevious(evt.target);
evt.preventDefault();
evt.stop();
}
},
_focusParent: function() {
if (!this.hasParent)
return;
var parentLink = this.parent.clickAble ? this.parent.textDiv.select('a')[0] : this.parent.textDiv;
parentLink.focus();
},
_focusNext: function(fromNode) {
this._focusDirection(fromNode, 1);
},
_focusPrevious: function(fromNode) {
this._focusDirection(fromNode, -1);
},
_focusDirection: function(fromNode, difference) {
var treeItems = this.tree.children.select('[role=treeitem]');
for (var i = 0; i < treeItems.length; i++) {
if (treeItems[i] == fromNode) {
var targetItem = treeItems[i + difference];
while (targetItem && !targetItem.offsetParent) {
difference = difference + Math.sign(difference) * 1;
targetItem = treeItems[i + difference];
}
if (!targetItem)
return;
treeItems[i + difference].focus();
break;
}
}
},
rename: function(text) {
this.setText(text);
this.showTextAndDecorations();
},
type: "GwtTree2"
});
var GwtTree2NodeDecoration = Class.create({
initialize: function() {
this.text = "";
this.clickAble = false;
this.image = "";
this.imageTitle = "";
this.url = "";
this.target = "";
},
addHTML: function(parent) {
if (this.clickAble || this.popup) {
var ref = cel("a");
if (this.popup) {
ref.href = "javascript:doNothing()";
ref.popup = this.popup;
ref.onmouseover = function(event) { eval(this.popup); }
ref.onmouseout = function(e) { if (document.all&&document.getElementById) {e=event;}; lockPopup(e); }
}
else {
ref.href = this.url;
if (this.target)
ref.target = this.target;
}
ref.title = this.text;
var img = cel("img", ref);
img.src = this.image;
img.alt = this.text;
parent.appendChild(ref);
}
else {
var ref = cel("span");
var img = cel("img", ref);
img.src = this.image;
img.title = this.text;
img.alt = this.text;
parent.appendChild(ref);
}
},
setText: function(text) {
this.text = text;
},
setURL: function(url) {
this.url = url;
this.clickAble = true;
},
setImage: function(image) {
this.image = image;
},
setPopup: function(popup) {
this.popup = popup;
}
});
function treeSyncOperation(operation) {
if (top.navTrees) {
var pos = operation.indexOf(',');
if ((pos == -1) || (pos > (operation.length - 2))) {
return;
}
var treeName = operation.substring(0, pos);
var type = operation.substr(pos + 1, 1);
var sysId = operation.substring(pos + 2).split(',');
var tree = top.navTrees[treeName];
if (tree) {
if (type == '-') {
tree.deleteNode(sysId[0]);
}
else if (type == '.') {
tree.update(sysId[0]);
}
else if (type == '+') {
tree.insert(sysId[1], sysId[0]);
}
}
}
}
;
