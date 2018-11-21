/*! RESOURCE: /scripts/js_includes_customer.js */
/*! RESOURCE: ConnectionUtils */
var ConnectionUtils = {
getSysConnection: function() {
var connGR = new GlideRecord("sys_connection");
connGR.addQuery('active', true);
connGR.addQuery("connection_alias", g_form.getValue("connection_alias"));
connGR.addQuery("sys_domain", g_form.getValue("sys_domain"));
connGR.addQuery("sys_id", "!=", g_form.getUniqueValue());
connGR.query();
return connGR;
},
doConnection: function(verb) {
if (g_form.getValue("active") == "false") {
gsftSubmit(null, g_form.getFormElement(), verb);
}
var connGR;
var performOverride = function() {
connGR.active = false;
connGR.update();
gsftSubmit(null, g_form.getFormElement(), verb);
};
var grConnAlias = new GlideRecord("sys_alias");
if (grConnAlias.get(g_form.getValue("connection_alias"))) {
if (grConnAlias.multiple_connections == 'true') {
gsftSubmit(null, g_form.getFormElement(), verb);
} else {
connGR = this.getSysConnection();
if (connGR.next()) {
var currName = g_form.getValue("name");
if (connGR.name.toUpperCase() == currName.toUpperCase()) {
var uniqueErrMsg = new GwtMessage().getMessage("A connection with {0} name already exists, duplicate connection names are not allowed", currName);
g_form.addErrorMessage(uniqueErrMsg);
return false;
}
var title = new GwtMessage().getMessage("Confirm inactivation");
var question = new GwtMessage().getMessage("You already have a {0} connection active, {1}.<br/>By making this one active, {2} will become inactive. <br/>Are you sure you want to make {3} the active connection?", connGR.protocol, connGR.name, connGR.name, currName);
this.confirmOverride(title, question, performOverride);
} else {
gsftSubmit(null, g_form.getFormElement(), verb);
}
}
}
},
confirmOverride: function(title, question, onPromptComplete) {
var dialogClass = (window.GlideModal) ? GlideModal : GlideDialogWindow;
var dialog = new GlideDialogWindow('glide_confirm_basic');
dialog.setTitle(title);
dialog.setSize(400, 325);
dialog.setPreference('title', question);
dialog.setPreference('onPromptComplete', onPromptComplete);
dialog.render();
},
};
/*! RESOURCE: PlannedTaskDateUtil */
var PlannedTaskDateUtil = Class.create();
PlannedTaskDateUtil.prototype = {
initialize: function(g_form, g_scratchpad) {
this.g_form = g_form;
this.g_scratchpad = g_scratchpad;
var tableName = g_form.getTableName();
this.dayField = "ni." + tableName + ".durationdur_day";
this.hourField = "ni." + tableName + ".durationdur_hour";
this.minuteField = "ni." + tableName + ".durationdur_min";
this.secondField = "ni." + tableName + ".durationdur_sec";
this.tableName = tableName;
},
_showErrorMessage: function(column, message) {
if (!message && !column) {
try {
this._gForm.showFieldMsg(column, message, 'error');
} catch(e) {}
}
},
setEndDate: function(answer) {
this.g_scratchpad.flag = true;
this.g_form.setValue('end_date', answer);
},
setDuration: function(answer) {
this.g_scratchpad.flag = true;
this.g_form.setValue('duration', answer);
},
getStartDate: function() {
return this.g_form.getValue('start_date');
},
getDays: function() {
var days = this.g_form.getValue(this.dayField);
return this._getIntValue(days);
},
getHours: function() {
var hours = this.g_form.getValue(this.hourField);
return this._getIntValue(hours);
},
getMinutes: function() {
var minutes = this.g_form.getValue(this.minuteField);
return this._getIntValue(minutes);
},
getSeconds: function() {
var seconds = this.g_form.getValue(this.secondField);
return this._getIntValue(seconds);
},
_getIntValue: function(value) {
var intValue = 0;
if (value && !isNaN(value))
intValue = parseInt(value);
return intValue;
},
setDurationHoursAndDays: function() {
var g_form = this.g_form;
var days = this.getDays();
var hours = this.getHours();
var minutes = this.getMinutes();
var seconds = this.getSeconds();
this.g_scratchpad.flag = false;
if (seconds >= 60) {
minutes += Math.floor(seconds / 60);
seconds = seconds % 60;
}
if (minutes >= 60) {
hours += Math.floor(minutes / 60);
minutes = minutes % 60;
}
if (hours >= 24) {
days += Math.floor(hours / 24);
hours = hours % 24;
}
if (hours < 9)
hours = "0" + hours;
if (minutes < 9)
minutes = "0" + minutes;
if (seconds < 9)
seconds = "0" + seconds;
g_form.setValue(this.dayField, days);
g_form.setValue(this.hourField, hours);
g_form.setValue(this.minuteField, minutes);
g_form.setValue(this.secondField, seconds);
},
validateDurationFields: function() {
var g_form = this.g_form;
var day = g_form.getValue(this.dayField);
var hour = g_form.getValue(this.hourField);
var minute = g_form.getValue(this.minuteField);
var second = g_form.getValue(this.secondField);
if (!day || day.trim() == '')
g_form.setValue(this.dayField, "00");
if (!hour || hour.trim() == '')
g_form.setValue(this.hourField, "00");
if (!minute || minute.trim() == '')
g_form.setValue(this.minuteField, "00");
if (!second || second.trim() == '')
g_form.setValue(this.secondField, "00");
var startDate = g_form.getValue("start_date");
if (g_form.getValue("duration") == '')
g_form.setValue("end_date", g_form.getValue("start_date"));
},
handleResponse: function(response, column) {
if (response && response.responseXML) {
var result = response.responseXML.getElementsByTagName("result");
if (result) {
result = result[0];
var status = result.getAttribute("status");
var answer = result.getAttribute("answer");
if (status == 'error') {
var message = result.getAttribute('message');
this._showErrorMessage(result.getAttribute("column"), message);
} else {
if (column == 'duration' || column == 'start_date')
this.setEndDate(answer);
else if (column == 'end_date')
this.setDuration(answer);
}
}
}
},
calculateDateTime: function(column) {
var self = this;
var ga = new GlideAjax('AjaxPlannedTaskDateUtil');
ga.addParam('sysparm_start_date', this.g_form.getValue('start_date'));
if (column == 'duration' || column == 'start_date') {
ga.addParam('sysparm_duration', this.g_form.getValue('duration'));
ga.addParam('sysparm_name', 'getEndDate');
} else if (column == 'end_date') {
ga.addParam('sysparm_end_date', this.g_form.getValue('end_date'));
ga.addParam('sysparm_name', 'getDuration');
}
ga.getXML(function(response) {
self.handleResponse(response, column);
});
},
calculateEndDateFromDuration: function(control, oldValue, newValue, isLoading, isTemplate) {
var g_form = this.g_form;
var g_scratchpad = this.g_scratchpad;
this.validateDurationFields();
if (isLoading || g_scratchpad.flag) {
g_scratchpad.flag = false;
return;
}
var startDate = this.getStartDate();
var startDateEmpty = !startDate || startDate.trim() === '';
if (newValue.indexOf("-") > -1 || startDateEmpty)
return;
this.setDurationHoursAndDays();
this.calculateDateTime('duration');
},
calculateEndDateFromStartDate: function(control, oldValue, newValue, isLoading, isTemplate) {
var g_form = this.g_form;
var g_scratchpad = this.g_scratchpad;
try {
g_form.hideFieldMsg('start_date');
} catch (e) {
}
if (isLoading || g_scratchpad.flag) {
g_scratchpad.flag = false;
return;
}
if (newValue == '')
return;
this.calculateDateTime('start_date');
},
calculateDurationFromEndDate: function(control, oldValue, newValue, isLoading, isTemplate) {
var g_form = this.g_form;
var g_scratchpad = this.g_scratchpad;
var startDateColumn = 'start_date';
var startDate;
if (isLoading || g_scratchpad.flag) {
g_scratchpad.flag = false;
return;
}
startDate = g_form.getValue(startDateColumn);
this.calculateDateTime('end_date');
},
type: "PlannedTaskDateUtil"
};
/*! RESOURCE: Validate Client Script Functions */
function validateFunctionDeclaration(fieldName, functionName) {
var code = g_form.getValue(fieldName);
if (code == "")
return true;
code = removeCommentsFromClientScript(code);
var patternString = "function(\\s+)" + functionName + "((\\s+)|\\(|\\[\r\n])";
var validatePattern = new RegExp(patternString);
if (!validatePattern.test(code)) {
var msg = new GwtMessage().getMessage('Missing function declaration for') + ' ' + functionName;
g_form.showErrorBox(fieldName, msg);
return false;
}
return true;
}
function validateNoServerObjectsInClientScript(fieldName) {
var code = g_form.getValue(fieldName);
if (code == "")
return true;
code = removeCommentsFromClientScript(code);
var doubleQuotePattern = /"[^"\r\n]*"/g;
code = code.replace(doubleQuotePattern,"");
var singleQuotePattern = /'[^'\r\n]*'/g;
code = code.replace(singleQuotePattern,"");
var rc = true;
var gsPattern = /(\s|\W)gs\./;
if (gsPattern.test(code)) {
var msg = new GwtMessage().getMessage('The object "gs" should not be used in client scripts.');
g_form.showErrorBox(fieldName, msg);
rc = false;
}
var currentPattern = /(\s|\W)current\./;
if (currentPattern.test(code)) {
var msg = new GwtMessage().getMessage('The object "current" should not be used in client scripts.');
g_form.showErrorBox(fieldName, msg);
rc = false;
}
return rc;
}
function validateUIScriptIIFEPattern(fieldName, scopeName, scriptName) {
var code = g_form.getValue(fieldName);
var rc = true;
if("global" == scopeName)
return rc;
code = removeCommentsFromClientScript(code);
code = removeSpacesFromClientScript(code);
code = removeNewlinesFromClientScript(code);
var requiredStart =  "var"+scopeName+"="+scopeName+"||{};"+scopeName+"."+scriptName+"=(function(){\"usestrict\";";
var requiredEnd = "})();";
if(!code.startsWith(requiredStart)) {
var msg = new GwtMessage().getMessage("Missing closure assignment.");
g_form.showErrorBox(fieldName,msg);
rc = false;
}
if(!code.endsWith(requiredEnd)) {
var msg = new GwtMessage().getMessage("Missing immediately-invoked function declaration end.");
g_form.showErrorBox(fieldName,msg);
rc = false;
}
return rc;
}
function validateNotCallingFunction (fieldName, functionName) {
var code = g_form.getValue(fieldName);
var rc = true;
var reg = new RegExp(functionName, "g");
var matches;
code = removeCommentsFromClientScript(code);
if (code == '')
return rc;
matches = code.match(reg);
rc = (matches && (matches.length == 1));
if(!rc) {
var msg = "Do not explicitly call the " + functionName + " function in your business rule. It will be called automatically at execution time.";
msg = new GwtMessage().getMessage(msg);
g_form.showErrorBox(fieldName,msg);
}
return rc;
}
function removeCommentsFromClientScript(code) {
var pattern1 = /\/\*(.|[\r\n])*?\*\//g;
code = code.replace(pattern1,"");
var pattern2 = /\/\/.*/g;
code = code.replace(pattern2,"");
return code;
}
function removeSpacesFromClientScript(code) {
var pattern = /\s*/g;
return code.replace(pattern,"");
}
function removeNewlinesFromClientScript(code) {
var pattern = /[\r\n]*/g;
return code.replace(pattern,"");
}
/*! RESOURCE: UI Action Context Menu */
function showUIActionContext(event) {
if (!g_user.hasRole("ui_action_admin"))
return;
var element = Event.element(event);
if (element.tagName.toLowerCase() == "span")
element = element.parentNode;
var id = element.getAttribute("gsft_id");
var mcm = new GwtContextMenu('context_menu_action_' + id);
mcm.clear();
mcm.addURL(getMessage('Edit UI Action'), "sys_ui_action.do?sys_id=" + id, "gsft_main");
contextShow(event, mcm.getID(), 500, 0, 0);
Event.stop(event);
}
addLoadEvent(function() {
document.on('contextmenu', '.action_context', function (evt, element) {
showUIActionContext(evt);
});
});
/*! RESOURCE: ValidateStartEndDates */
function validateStartEndDate(startDateField, endDateField, processErrorMsg){
var startDate = g_form.getValue(startDateField);
var endDate = g_form.getValue(endDateField);
var format = g_user_date_format;
if (startDate === "" || endDate === "")
return true;
var startDateFormat = getDateFromFormat(startDate, format);
var endDateFormat = getDateFromFormat(endDate, format);
if (startDateFormat < endDateFormat)
return true;
if (startDateFormat === 0 || endDateFormat === 0){
processErrorMsg(new GwtMessage().getMessage("{0} is invalid", g_form.getLabelOf(startDate === 0? startDateField : endDateField)));
return false;
}
if (startDateFormat > endDateFormat){
processErrorMsg(new GwtMessage().getMessage("{0} must be after {1}", g_form.getLabelOf(endDateField), g_form.getLabelOf(startDateField)));
return false;
}
return true;
}
/*! RESOURCE: pdb_HighchartsConfigBuilder */
var HighchartsBuilder = {
getChartConfig: function(chartOptions, tzOffset) {
var chartTitle = chartOptions.title.text,
xAxisTitle = chartOptions.xAxis.title.text,
xAxisCategories = chartOptions.xAxis.categories,
yAxisTitle = chartOptions.yAxis.title.text,
series = chartOptions.series;
this.convertEpochtoMs(xAxisCategories);
this.formatDataSeries(xAxisCategories, series);
var config = {
chart: {
type: 'area',
zoomType: 'x'
},
credits: {
enabled: false
},
title: {
text: chartTitle
},
xAxis: {
type: 'datetime',
title: {
text: xAxisTitle,
style: {textTransform: 'capitalize'}
}
},
yAxis: {
reversedStacks: false,
title: {
text: yAxisTitle,
style: {textTransform: 'capitalize'}
}
},
plotOptions: {
area: {
stacking: 'normal'
},
series: {
marker: {
enabled: true,
symbol: 'circle',
radius: 2
},
step: 'center'
}
},
tooltip: {
valueDecimals: 2,
style: {
whiteSpace: "wrap",
width: "200px"
}
},
series: series
};
var convertedOffset = -1 * (tzOffset/60);
Highcharts.setOptions({
lang: {
thousandsSep: ','
},
global: {
timezoneOffset: convertedOffset
}
});
return config;
},
convertEpochtoMs: function(categories) {
categories.forEach(function(point, index, arr) {
arr[index] *= 1000;
});
},
formatDataSeries: function(categories, series) {
series.forEach(function(row, index, arr) {
arr[index].data.forEach(function(innerRow, innerIndex, innerArr) {
var value = innerRow;
if (value == "NaN") {
value = 0;
}
var xValue = categories[innerIndex];
innerArr[innerIndex] = [xValue, value];
});
});
}
};
/*! RESOURCE: /scripts/lib/jquery/jquery_clean.js */
(function() {
if (!window.jQuery)
return;
if (!window.$j_glide)
window.$j = jQuery.noConflict();
if (window.$j_glide && jQuery != window.$j_glide) {
if (window.$j_glide)
jQuery.noConflict(true);
window.$j = window.$j_glide;
}
})();
;
;
