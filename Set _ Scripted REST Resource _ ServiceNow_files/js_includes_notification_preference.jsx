/*! RESOURCE: /scripts/notification_preference/js_includes_notification_preference.js */
/*! RESOURCE: /scripts/sn/common/keyboard/js_includes_keyboard.js */
/*! RESOURCE: /scripts/sn/common/keyboard/_module.js */
angular.module('sn.common.keyboard', []);
;
/*! RESOURCE: /scripts/sn/common/keyboard/directive.snKeyCode.js */
angular.module('sn.common.keyboard').directive('snKeyCode', function() {
"use strict";
return {
restrict: 'A',
link: function(scope, element, attrs) {
element.bind("keypress", function(event) {
var keyCode = event.which || event.keyCode;
var codes;
if (!attrs.code)
return;
codes = attrs.code
.split(',')
.map(function(item) {
return parseInt(item, 10);
});
if (!event.shiftKey && codes.indexOf(keyCode) > -1) {
scope.$apply(function() {
scope.$eval(attrs.snKeyCode, {$event: event});
});
}
});
}
};
});
;
/*! RESOURCE: /scripts/sn/common/keyboard/directive.snKeyTrap.js */
angular.module('sn.common.keyboard').directive('keyTrap', function() {
return function( scope, elem ) {
elem.bind('keydown', function( event ) {
scope.$broadcast('keydown', { code: event.keyCode } );
});
};
});
;
;
/*! RESOURCE: /scripts/notification_preference/_module.js */
angular.module('sn.notification_preference', [
'sn.common.glide',
'sn.common.keyboard',
'sn.i18n',
'ngAria'
]);
angular.element(document).ready(function() {
window.NOW = window.NOW || {};
window.NOW.ngLoadModules = window.NOW.ngLoadModules || [];
NOW.ngLoadModules = NOW.ngLoadModules.concat(['sn.notification_preference', 'sn.common.glide', 'sn.common.keyboard', 'ngAria', 'sn.concourse_view_stack']);
});
;
/*! RESOURCE: /scripts/notification_preference/directive.notificationCategoryList.js */
angular.module('sn.notification_preference').directive('notificationCategoryList', function(getTemplateUrl) {
'use strict';
return {
restrict: 'E',
replace: true,
scope: true,
templateUrl: getTemplateUrl('notification_preference_category_list.xml'),
controller: function($scope, $element, notificationCategoriesService, notificationPreferencesService, viewStackService, i18n, snCustomEvent, systemProperties, userPreferences, keydownHandler) {
$scope.loading = true;
$scope.subscriptionsEnabled = systemProperties.subscriptions;
$scope.categories = [];
var pageSize = 100;
var pageIndex = 0;
userPreferences.getPreference('glide.ui.accessibility')
.then(function(val){
$scope.accessibilityEnabled = val;
});
function loadCategories() {
$scope.loading = true;
var options = {
sysparm_limit: pageSize,
sysparm_offset: pageIndex * pageSize
};
notificationCategoriesService.load(options).then(function(categories) {
$scope.categories = $scope.categories.concat(categories);
$scope.loading = false;
});
}
function notificationInserted(response) {
notificationPreferencesService.load({
preference: response.sys_id
}).then(function (preference) {
var filteredCategories = $scope.categories.filter(function(category) {
return category.sys_id === preference.category;
});
if (filteredCategories.length === 0) {
return;
}
var category = filteredCategories[0];
$scope.openCategoryView(null, category);
var view = viewStackService.get('notifications_channel', {
title: i18n.getMessage('Notification'),
params: {
category: preference.category,
preference: preference
}
});
$scope.$emit('concourse_settings.view.open', view);
});
unregisterEvents();
}
function unregisterEvents() {
snCustomEvent.un('iframe_form.sysverb_insert', notificationInserted);
}
$scope.openCategoryListItemMessage = function (categoryName) {
return i18n.getMessage('Open Notification Settings for {0}').withValues([categoryName]);
};
$scope.openCreateView = function openCreateView($event) {
if (keydownHandler.isNonSpaceOrEnterKeydownEvent($event))
return;
var view = viewStackService.get('notifications_form', {
title: i18n.getMessage('New Personal Notification'),
params : {
view: 'concourse_notification_preferences',
table : 'sys_notif_subscription'
},
previouslyFocusedElement: $event.currentTarget
});
$scope.$emit('concourse_settings.view.open', view);
snCustomEvent.on('iframe_form.sysverb_insert', notificationInserted);
};
$scope.openCategoryView = function openCategoryView($event, category) {
if (keydownHandler.isNonSpaceOrEnterKeydownEvent($event))
return;
var view = viewStackService.get('notifications_category', {
title: category.name,
template: 'notification_preference_category.xml',
params: {
category: category.sys_id
}
});
if ($event) {
view.previouslyFocusedElement = $event.currentTarget;
if (($event.type === 'keydown' && ($event.keyCode === 13 || $event.keyCode === 32)) || ($scope.accessibilityEnabled === 'true')) {
view.initFocus = "#notif_prefs_personal_notifs_list li:first,#notif_prefs_system_notifs_list li:first";
}
}
$scope.$emit('concourse_settings.view.open', view);
};
$scope.$on('concourse_settings.view.refresh', function () {
pageIndex = 0;
$scope.categories.length = 0;
loadCategories();
});
$scope.$on('concourse_settings.view.closed', unregisterEvents);
$scope.$on('$destroy', unregisterEvents);
loadCategories();
if ($element.parent() && $element.parent().scrollParent) {
var scrollContainer = angular.element($element.parent().scrollParent());
scrollContainer.on('scroll', function() {
if ($scope.loading) {
return;
}
if (this.scrollTop + this.offsetHeight < this.scrollHeight - 100) {
return;
}
if ($scope.categories.length === notificationCategoriesService.totalCount) {
return;
}
if ((pageIndex + 1) * pageSize > notificationCategoriesService.totalCount) {
return;
}
pageIndex++;
loadCategories();
});
}
}
};
});
;
/*! RESOURCE: /scripts/notification_preference/directive.notificationPreferenceList.js */
angular.module('sn.notification_preference').directive('notificationPreferenceList', function(getTemplateUrl) {
'use strict';
return {
restrict: 'E',
scope: {
category: '=?',
search: '=?'
},
templateUrl: getTemplateUrl('notification_preference_list.xml'),
controller: function($scope, $element, snCustomEvent, notificationPreferencesService, systemProperties, i18n) {
$scope.subscriptionsEnabled = systemProperties.subscriptions;
var pageSize = 100;
var pageIndex = 0;
if (angular.isUndefined($scope.search))
$scope.search = "";
$scope.hasPreferencesOfType = function hasPreferencesOfType(type) {
if (!$scope.preferences) {
return false;
}
return $scope.preferences.some(function(preference) {
return preference.type === type;
});
};
$scope.preferencesOfType = function preferencesOfType(type) {
if (!$scope.preferences) {
return [];
}
return $scope.preferences.filter(function(preference) {
return preference.type === type;
});
};
function preferenceDeleted(response) {
if (response.table === 'sys_notif_subscription') {
notificationPreferencesService.remove(response.table, response.sys_id);
$scope.$emit('concourse_settings.view.back');
}
}
function loadPreferences() {
$scope.loading = true;
var options = {
sysparm_limit: pageSize,
sysparm_offset: pageIndex * pageSize,
category: $scope.category,
search: $scope.search
};
notificationPreferencesService.load(options).then(function(preferences) {
$scope.preferences = preferences;
$scope.loading = false;
var notifPrefMesgNode = document.getElementById('notif_prefs_count_mesg');
if (notifPrefMesgNode)
notifPrefMesgNode.innerHTML = i18n.getMessage('{0} search results returned').withValues([preferences.length]);
}, function() {
$scope.loading = false;
});
}
loadPreferences();
var scrollContainer = angular.element($element.parent().scrollParent());
scrollContainer.bind('scroll', function() {
if ($scope.loading) {
return;
}
if (this.scrollTop + this.offsetHeight < this.scrollHeight - 300) {
return;
}
if ($scope.preferences.length === notificationPreferencesService.totalCount) {
return;
}
pageIndex++;
loadPreferences();
});
$scope.$watch('search', function() {
if ($scope.category && !$scope.search)
return;
notificationPreferencesService.clear();
if ($scope.search.length > 0)
loadPreferences();
});
$scope.$on('concourse_settings.view.refresh', loadPreferences);
$scope.$on('$destroy', function() {
snCustomEvent.un('iframe_form.sysverb_delete', preferenceDeleted);
notificationPreferencesService.clear();
});
snCustomEvent.on('iframe_form.sysverb_delete', preferenceDeleted);
}
};
});
;
/*! RESOURCE: /scripts/notification_preference/directive.notificationPreferenceItem.js */
angular.module('sn.notification_preference').directive('notificationPreferenceItem', function(getTemplateUrl) {
"use strict";
return {
restrict: 'E',
replace: true,
scope: {
category: '=',
preference: '='
},
templateUrl: getTemplateUrl('notification_preference_item.xml'),
controller: function($scope, i18n, viewStackService, userPreferences, keydownHandler) {
userPreferences.getPreference('glide.ui.accessibility')
.then(function(val){
$scope.accessibilityEnabled = val;
});
$scope.openPreferenceView = function openPreferenceView($event) {
if (keydownHandler.isNonSpaceOrEnterKeydownEvent($event))
return;
var view = viewStackService.get('notifications_channel', {
title: i18n.getMessage('Notification'),
params: {
category: $scope.category,
preference: $scope.preference
},
previouslyFocusedElement: $event.currentTarget
});
if (($event.type === 'keydown' && ($event.keyCode === 13 || $event.keyCode === 32)) || ($scope.accessibilityEnabled === 'true')) {
view.initFocus = "#notif_prefs_record_list input[type='checkbox']:first";
}
$scope.$emit('concourse_settings.view.open', view);
};
$scope.formatPreferenceChannels = function formatPreferenceChannels() {
return $scope.preference.channels
.map(function(channel) {
return channel.name;
})
.join(', ');
};
}
};
});
;
/*! RESOURCE: /scripts/notification_preference/directive.notificationRecordList.js */
angular.module('sn.notification_preference').directive('notificationRecordList', function(getTemplateUrl) {
"use strict";
return {
restrict: 'E',
replace: true,
scope: {
preference: '=',
notification: '='
},
templateUrl: getTemplateUrl('notification_preference_record_list.xml'),
controller: function($scope, $element, snCustomEvent, viewStackService, i18n, notificationChannelsService, notificationPreferencesService, keydownHandler) {
if (!$scope.preference && $scope.notification) {
loadPreference();
}
function loadPreference() {
$scope.loading = true;
var options = {
search: $scope.notification
};
notificationPreferencesService.load(options).then(function(preferences) {
if (preferences) {
angular.forEach(preferences, function(preference) {
if (preference.type === 'system') {
$scope.preference = preference;
}
});
if (preferences.length === 0)
$scope.invalidNotification = true;
} else {
$scope.invalidNotification = true;
}
}).finally(function() {
$scope.loading = false;
});
}
function recordChanged(response) {
notificationPreferencesService.load({
preference: response.sys_id
}).then(function(preference) {
$scope.preference = preference;
});
unregisterEvents();
}
function unregisterEvents() {
snCustomEvent.un('iframe_form.sysverb_update', recordChanged);
snCustomEvent.un('iframe_form.sysverb_delete', unregisterEvents);
snCustomEvent.un('iframe_form.sysverb_cancel', unregisterEvents);
}
$scope.$on('$destroy', unregisterEvents);
$scope.$on('concourse_settings.view.closed', unregisterEvents);
$scope.$watch('preference', function() {
if (!$scope.preference)
return;
$scope.hasRecordsWithChannels = $scope.preference.records.some(function(record) {
return !!record.channel;
});
});
$scope.editPersonalNotification = function($event) {
if (keydownHandler.isNonSpaceOrEnterKeydownEvent($event))
return;
snCustomEvent.on('iframe_form.sysverb_update', recordChanged);
snCustomEvent.on('iframe_form.sysverb_delete', unregisterEvents);
snCustomEvent.on('iframe_form.sysverb_cancel', unregisterEvents);
var viewData = viewStackService.get('notifications_form', {
title: i18n.getMessage('Edit Notification'),
params: {
view: 'concourse_notification_preferences',
table: $scope.preference.records[0].table,
sys_id: $scope.preference.records[0].sys_id
},
previouslyFocusedElement: $event.currentTarget
});
$scope.$emit('concourse_settings.view.open', viewData);
};
}
};
});
;
/*! RESOURCE: /scripts/notification_preference/directive.notificationRecordItem.js */
angular.module('sn.notification_preference').directive('notificationRecordItem', function(getTemplateUrl) {
'use strict';
return {
restrict: 'E',
replace: true,
scope: {
record: '=',
preference: '='
},
templateUrl: getTemplateUrl('notification_preference_record_item.xml'),
link: function(scope, element) {
scope.$watch('record.readonly', function() {
element.find('.sn-tooltip-basic')
.tooltip(scope.record.readonly ? 'enable' : 'disable');
});
scope.$watch('record.readonly_reason', function() {
element.find('.sn-tooltip-basic')
.attr('data-original-title', scope.record.readonly_reason)
.tooltip('fixTitle');
});
if (scope.preference.type == 'personal') {
element.removeAttr('role');
element.removeAttr('tabindex');
}
},
controller: function($scope, $window, viewStackService, i18n, notificationPreferencesService,
snCustomEvent, snNotification, keydownHandler) {
function updateRecord(preference) {
var filteredRecords = preference.records.filter(function(record) {
return record.channel.sys_id === $scope.record.channel.sys_id;
});
if (filteredRecords.length > 0) {
$scope.record = filteredRecords[0];
}
}
function recordChanged(response) {
notificationPreferencesService.load({
preference: response.sys_id
}).then(function(preference) {
$scope.preference = preference;
updateRecord(preference);
});
unregisterEvents();
}
function recordDeleted() {
$scope.record.sys_id = '';
unregisterEvents();
}
function unregisterEvents() {
snCustomEvent.un('iframe_form.sysverb_delete', recordDeleted);
snCustomEvent.un('iframe_form.sysverb_update', recordChanged);
snCustomEvent.un('iframe_form.sysverb_insert', recordChanged);
snCustomEvent.un('iframe_form.sysverb_cancel', unregisterEvents);
}
function updatePreferenceChannels() {
if ($scope.record.logical_active) {
$scope.preference.channelIds.push($scope.record.channel.sys_id);
} else {
var channelIndex = $scope.preference.channelIds.indexOf($scope.record.channel.sys_id);
if (channelIndex > -1) {
$scope.preference.channelIds.splice(channelIndex, 1);
}
}
}
$scope.changeRecordState = function() {
if ($scope.record.readonly) {
return;
}
updatePreferenceChannels();
notificationPreferencesService.update({
notification_id: $scope.preference.notification.sys_id,
channel_id: $scope.record.channel.sys_id,
active: $scope.record.logical_active,
table: $scope.record.table,
sys_id: $scope.record.sys_id ? $scope.record.sys_id : null
}).then(function success(preference) {
$scope.preference = preference;
updateRecord(preference);
}, function error(message) {
$scope.record.logical_active = !$scope.record.logical_active;
updatePreferenceChannels();
snNotification.show('error', message.detail, 5000, null, '.record-notifications');
});
};
$scope.openEditRecord = function openEditRecord($event) {
$event.stopPropagation();
if (keydownHandler.isNonSpaceOrEnterKeydownEvent($event))
return;
if ($scope.preference.type !== 'system') {
return;
}
var sys_id = $scope.record.sys_id;
if (!$scope.record.sys_id) {
sys_id = -1;
var formParams = {
sysparm_query: 'name=' + $scope.preference.name +
'^notification=' + $scope.preference.notification.sys_id +
'^device=' + $scope.record.channel.sys_id +
'^user=' + $window.NOW.user_id
};
}
snCustomEvent.on('iframe_form.sysverb_insert', recordChanged);
snCustomEvent.on('iframe_form.sysverb_update', recordChanged);
snCustomEvent.on('iframe_form.sysverb_delete', recordDeleted);
snCustomEvent.on('iframe_form.sysverb_cancel', unregisterEvents);
var viewData = viewStackService.get('notifications_form', {
title: i18n.getMessage('Apply Conditions'),
params: {
sys_id: sys_id,
table: $scope.record.table,
view: 'concourse_notification_preferences',
formParams: formParams
},
previouslyFocusedElement: $event.currentTarget
});
$scope.$emit('concourse_settings.view.open', viewData);
};
$scope.$on('$destroy', unregisterEvents);
$scope.$on('concourse_settings.view.closed', unregisterEvents);
}
};
});
;
/*! RESOURCE: /scripts/notification_preference/directive.notificationChannelList.js */
angular.module('sn.notification_preference').directive('notificationChannelList', function(getTemplateUrl) {
"use strict";
return {
restrict: 'E',
scope: true,
templateUrl: getTemplateUrl('notification_preference_channel_list.xml'),
controller: function($scope, snCustomEvent, snNotification, i18n, viewStackService,
notificationChannelsService, notificationPreferencesService, keydownHandler) {
$scope.globalActive = notificationChannelsService.globalActive;
$scope.openCreateChannelView = function openCreateChannelView($event) {
if (keydownHandler.isNonSpaceOrEnterKeydownEvent($event))
return;
var viewData = viewStackService.get('notifications_form', {
title: i18n.getMessage('New Channel'),
params: {
table: 'cmn_notif_device',
view: 'concourse_notification_preferences'
},
previouslyFocusedElement: $event.currentTarget
});
$scope.$emit('concourse_settings.view.open', viewData);
snCustomEvent.on('iframe_form.sysverb_insert', channelInserted);
};
$scope.changeGlobalState = function() {
notificationPreferencesService.updateAll({
active: $scope.globalActive
}).then(function success() {
notificationChannelsService.globalActive = $scope.globalActive;
loadChannels();
}, function error(message) {
$scope.globalActive = !$scope.globalActive;
notificationChannelsService.globalActive = $scope.globalActive;
snNotification.show('error', message.detail, 5000, null, '.channel-notifications');
});
};
$scope.$on('concourse_settings.view.refresh', loadChannels);
$scope.$on('concourse_settings.view.closed', unregisterEvents);
$scope.$on('$destroy', unregisterEvents);
function unregisterEvents() {
snCustomEvent.un('iframe_form.sysverb_insert', channelInserted);
}
function channelInserted(response) {
notificationChannelsService.load({
channel: response.sys_id
});
unregisterEvents();
}
function loadChannels() {
$scope.loading = true;
notificationChannelsService.load().then(function(channels) {
$scope.globalActive = notificationChannelsService.globalActive;
$scope.channels = channels;
$scope.loading = false;
}, function() {
$scope.loading = false;
});
}
loadChannels();
}
};
});
;
/*! RESOURCE: /scripts/notification_preference/directive.notificationChannelItem.js */
angular.module('sn.notification_preference').directive('notificationChannelItem', function(getTemplateUrl) {
'use strict';
return {
restrict: 'E',
replace: true,
scope: {
channel: '='
},
templateUrl: getTemplateUrl('notification_preference_channel_item.xml'),
link: function(scope, element) {
scope.$watch('channel.readonly', function() {
element.find('.sn-tooltip-basic')
.tooltip(scope.channel.readonly ? 'enable' : 'disable');
});
scope.$watch('channel.readonly_reason', function() {
element.find('.sn-tooltip-basic')
.attr('data-original-title', scope.channel.readonly_reason)
.tooltip('fixTitle');
});
},
controller: function($scope, viewStackService, i18n, notificationChannelsService, snCustomEvent, snNotification, keydownHandler) {
function channelDeleted(response) {
notificationChannelsService.remove(response.sys_id);
unregisterEvents();
$scope.$emit('concourse_settings.view.back');
}
function channelUpdated(response) {
notificationChannelsService.load({
channel: response.sys_id
});
unregisterEvents();
}
function unregisterEvents() {
snCustomEvent.un('iframe_form.sysverb_delete', channelDeleted);
snCustomEvent.un('iframe_form.sysverb_update', channelUpdated);
}
$scope.changeChannelState = function() {
if (!$scope.channel.readonly) {
notificationChannelsService.update({
sys_id: $scope.channel.sys_id,
active: $scope.channel.logical_active
}).catch(function error(message) {
$scope.channel.logical_active = !$scope.channel.logical_active;
snNotification.show('error', message.detail, 5000, null, '.channel-notifications');
});
} else {
$scope.channel.logical_active = false;
}
};
$scope.openEditChannel = function openEditChannel($event) {
if (keydownHandler.isNonSpaceOrEnterKeydownEvent($event))
return;
snCustomEvent.on('iframe_form.sysverb_update', channelUpdated);
snCustomEvent.on('iframe_form.sysverb_delete', channelDeleted);
var viewData = viewStackService.get('notifications_form', {
title: i18n.getMessage('Edit Channel'),
params: {
sys_id: $scope.channel.sys_id,
table: 'cmn_notif_device',
view: 'concourse_notification_preferences'
},
previouslyFocusedElement: $event.currentTarget
});
$scope.$emit('concourse_settings.view.open', viewData);
};
$scope.$on('$destroy', unregisterEvents);
}
};
});
;
/*! RESOURCE: /scripts/notification_preference/directive.notificationPreferenceDigest.js */
angular.module('sn.notification_preference').directive('notificationPreferenceDigest', function(getTemplateUrl) {
"use strict";
return {
restrict: 'E',
replace: true,
scope: {
preference: '='
},
templateUrl: getTemplateUrl("notification_preference_digest.xml"),
controller: function($scope, $log, emailDigestPreference, emailDigestIntervals) {
$scope.updateDigestPreference = function (preference) {
if (!preference.digest)
return;
var active = preference.digest.active;
var digestPreferenceId = preference.digest.sys_id;
var intervalId = '';
if (preference.digest.interval)
intervalId = preference.digest.interval.sys_id;
else if ($scope.defaultInterval)
intervalId = $scope.defaultInterval.sys_id;
emailDigestPreference.updatePreference({
active: active,
notification_id: preference.notification.sys_id,
interval_id: intervalId,
sys_id: digestPreferenceId
}).then(function success(digestPreference) {
$scope.preference.digest = digestPreference;
}, function error(message) {
$log.error('Request to update email digest preference failed with message: ' + message);
});
};
function loadIntervals() {
var options = {
sysparm_limit: 100
};
emailDigestIntervals.load(options).then(function success(result) {
$scope.digestIntervals = result.intervals;
$scope.defaultInterval = result.default_interval;
$scope.intervalChoiceDisabled = emailDigestIntervals.getTotalCount() === 1;
}, function error(message) {
$log.error('Request to load email digest intervals failed with message: ' + message);
});
}
$scope.intervalChoiceDisabled = false;
loadIntervals();
}
};
});
;
/*! RESOURCE: /scripts/notification_preference/directive.notificationPreferenceLanding.js */
angular.module('sn.notification_preference').directive('notificationPreferenceLanding', function(getTemplateUrl, $timeout) {
'use strict';
return {
restrict: 'E',
replace: true,
scope: true,
templateUrl: getTemplateUrl('notification_preference_landing.xml'),
controller: function($scope) {
$scope.searchTerm = "";
$scope.hasSearchInput = function() {
return $scope.searchTerm.length > 2 || $scope.searchTerm == '**';
};
$timeout(function() {
angular.element('#notif_prefs_search').focus();
});
}
}
});
;
/*! RESOURCE: /scripts/notification_preference/directive.notificationSearchBar.js */
angular.module('sn.notification_preference').directive('notificationSearchBar', function(getTemplateUrl) {
"use strict";
return {
restrict: 'E',
scope: {
searchTerm: '='
},
replace: true,
templateUrl: getTemplateUrl('notification_preference_search_bar.xml'),
controller: function($scope, keydownHandler) {
if ($scope.searchTerm)
$scope.searchInputText = $scope.searchTerm;
else
$scope.searchInputText = "";
$scope.clearSearchInput = function($event) {
if (keydownHandler.isNonSpaceOrEnterKeydownEvent($event))
return;
$scope.searchInputText = "";
angular.element('#notif_prefs_search').focus();
};
$scope.$watch("searchInputText", function() {
if (shouldUpdateGlobalSearchTerm())
$scope.searchTerm = $scope.searchInputText;
});
function shouldUpdateGlobalSearchTerm() {
if ($scope.searchInputText == $scope.searchTerm)
return false;
if ($scope.searchInputText.length == 0)
return true;
if ($scope.searchInputText.length <= 2 && $scope.searchInputText != '**')
return false;
return true;
}
}
};
});
;
/*! RESOURCE: /scripts/notification_preference/directive.iframeForm.js */
angular.module('sn.notification_preference').directive('iframeForm', function(getTemplateUrl, glideUrlBuilder, snCustomEvent) {
"use strict";
return {
restrict: 'E',
replace: true,
scope: {
table: '=',
sysId: '=',
view: '=',
params: '='
},
templateUrl: getTemplateUrl('notification_preference_iframe_form.xml'),
controller: function($scope) {
$scope.formUrl = _makeFormUrl();
function _makeFormUrl() {
var action = $scope.table + '.do';
var url = glideUrlBuilder.newGlideUrl(action);
url.addParam('sysparm_titleless', true);
url.addParam('sysparm_form_only', true);
url.addParam('sysparm_nostack', true);
url.addParam('sysparm_view', $scope.view);
url.addParam('sysparm_goto_url', 'iframe_form_response.do?' +
'sysparm_skipmsgs=true&' +
'sysparm_nostack=true&' +
'sysparm_returned_action=$action&' +
'sysparm_returned_sysid=$sys_id&' +
'sysparm_returned_value=$display_value');
if ($scope.sysId) {
url.addParam('sys_id', $scope.sysId);
}
if ($scope.params) {
angular.forEach($scope.params, function(value, key) {
url.addParam(key, value);
});
}
return url.getURL();
}
},
link: function(scope, element) {
var FORM_FRAME = 'form-frame';
var frame = element.find('#' + FORM_FRAME);
scope.loading = true;
frame.on('load', function() {
scope.loading = false;
if (frame.contents().get(0).location.pathname.indexOf('iframe_form_response') == 1) {
var url = glideUrlBuilder.newGlideUrl(frame.contents().get(0).location.href);
var sys_id = url.getParam('sysparm_returned_sysid');
var action = url.getParam('sysparm_returned_action');
snCustomEvent.fire('iframe_form.' + action, {
action: action,
table: scope.table,
sys_id: sys_id
});
scope.formUrl = 'about:blank';
scope.$emit('concourse_settings.view.back');
}
var frameDoc = frame.get(0) && frame.get(0).contentDocument;
var frameHead = frameDoc && frameDoc.head;
if (frameHead) {
var customStyles = angular.element(document.createElement('style'));
customStyles.append('.section_header_content_no_scroll form.form_body.form-horizontal { padding: 24px 0 10px 24px; }');
customStyles.append('form .form_action_button_container { padding-right: 12.5%; display: flex; justify-content: flex-end; margin-right: -4px; }');
customStyles.append('html[dir="rtl"] form .form_action_button_container { padding-right: 0; padding-left: 12.5%; display: flex; justify-content: flex-end; margin-left: -4px; margin-right: 0; }');
customStyles.append('form .form-field-addons sn-record-preview { display: none !important; }');
customStyles.append('.form-field.input_controls.filter_controls, HTML[data-doctype=true] .section-content { overflow: visible !important }');
customStyles.append('body[data-formname=sys_form_template] form .ng-filter-widget { min-width: auto; background-color: #e7e9eb; width: calc(100% + 69px) !important; margin-left: -54px; overflow: visible; }');
customStyles.append('form .ng-filter-widget .predicate .filter-toggle-section .set { padding: 0 54px; }');
customStyles.append('form .ng-filter-widget .predicate .filter-toggle-section .filter-footer { padding: 5px 0 10px 54px }');
customStyles.append('form .ng-filter-widget-row { padding: 0 36px 2px 25px; }');
customStyles.append('.modal-header::before, .modal-header::after { content: " "; display: table; }');
customStyles.append('.modal-header::after { clear: both; }');
customStyles.append('.modal-header { display: none; }');
customStyles.append('.modal-content { height: 100%; border-radius: 0; box-shadow: none; border: none; }');
customStyles.append('.modal-dialog.modal-lg, .modal-dialog.modal-md, .modal-dialog.modal-alert { margin: 0; width: 100%; height: 100%; top: 0; bottom: 0; left: 0; right: 0; position: absolute; border-radius: 0; box-shadow: none; }');
customStyles.append('.modal-dialog.modal-md, .modal-dialog.modal-alert { font-size: 16px; }');
customStyles.append('.modal-body { padding: 24px 54px 10px; }');
customStyles.append('.modal .modal-body .modal-footer { padding-right: 0; }');
customStyles.append('.modal-dialog.modal-alert .modal-body { display: flex; justify-content: center; padding: 114px 125px 0; max-height: 100%; font-size: 20px; }');
customStyles.append('.modal-dialog.modal-alert .modal-footer { display: flex; justify-content: center; margin-top: -44px; }');
customStyles.append('.modal-dialog.modal-md .modal-body rendered_body div:first-child > div:first-of-type { display: none; }');
customStyles.append('form [data-type="reference_popup"] { display: none !important; }');
customStyles.append('form [data-type="sys_notif_subscription.affected_record_document_id_reference_popup"] { display: none !important; }');
customStyles.append('form [type="conditions"] { overflow: hidden !important; }');
customStyles.append('.form-group .lightweight-reference .icon-info { display: none !important; }');
customStyles.append('.timingDiv { display: none !important; }');
angular.element(frameHead).append(customStyles);
}
var firstFocusable = frame.contents().find('*[tabindex!="-1"]:focusable');
if (firstFocusable.length)
firstFocusable[0].focus();
scope.$apply();
});
function iframeFormCancelled() {
scope.$emit('concourse_settings.view.back');
scope.$apply();
}
snCustomEvent.on('iframe_form.sysverb_cancel', iframeFormCancelled);
scope.$on('$destroy', function() {
snCustomEvent.un('iframe_form.sysverb_cancel', iframeFormCancelled);
});
}
};
});
;
/*! RESOURCE: /scripts/notification_preference/directive.repeatComplete.js */
angular.module('sn.notification_preference').directive('repeatComplete', function() {
return {
scope: false,
link: function (scope) {
if (scope.$last) {
scope.$emit('concourse_settings.view.render_complete');
}
}
};
});
;
/*! RESOURCE: /scripts/notification_preference/service.notificationCategories.js */
angular.module('sn.notification_preference').factory('notificationCategoriesService', function($httpParamSerializer, snResource) {
var _totalCount = 0;
return {
load: function load(options) {
var url = '/api/now/v1/notification/preference/category';
var params = $httpParamSerializer(options);
if (params) {
url += '?' + params;
}
return snResource().get(url).then(function success(response) {
_totalCount = parseInt(response.headers()['x-total-count'] || 0, 10);
return response.data.result.categories;
});
},
get totalCount() {
return _totalCount;
}
};
});
;
/*! RESOURCE: /scripts/notification_preference/service.notificationChannels.js */
angular.module('sn.notification_preference').factory('notificationChannelsService', function($httpParamSerializer, $q, snResource, notificationChannelModel) {
var baseUrl = '/api/now/v1/notification/';
var channels = [];
var channelsBySysId = {};
var channelsByNotification = {};
var _globalActive = true;
return {
load: function load(options) {
var self = this;
var url = baseUrl + 'preference/channel';
options = options || {};
if (options.channel) {
url += '/' + options.channel;
} else {
var params = $httpParamSerializer(options);
if (params) {
url += '?' + params;
}
}
return snResource().get(url).then(function success(response) {
function processChannelData(channelData) {
self.add(notificationChannelModel(channelData), options.notification);
}
if (options.channel) {
processChannelData(response.data.result);
} else {
_globalActive = response.data.result.enable_notifications;
response.data.result.channels.forEach(processChannelData);
}
return options.notification ? channelsByNotification[options.notification] : channels;
});
},
exists: function exists(sysId) {
return !!channelsBySysId[sysId];
},
add: function add(channel, notification) {
if (this.exists(channel.sys_id)) {
this.remove(channel.sys_id, notification);
}
channels.push(channel);
channelsBySysId[channel.sys_id] = channel;
if (!notification) {
return;
}
if (!channelsByNotification[notification]) {
channelsByNotification[notification] = [];
}
var notificationHasChannel = channelsByNotification[notification].some(function(notificationChannel) {
return notificationChannel.sys_id === channel.sys_id;
});
if (!notificationHasChannel) {
channelsByNotification[notification].push(channel);
}
},
remove: function remove(sysId) {
var index = _.findIndex(channels, function(channel) {
return channel.sys_id === sysId;
});
if (index > -1) {
channels.splice(index, 1);
}
delete channelsBySysId[sysId];
},
get: function get(sysId) {
return channelsBySysId[sysId];
},
update: function update(channel) {
var deferred = $q.defer();
snResource().post(baseUrl + 'preference/channel', {
channel: channel
}).then(success, error);
function success(response) {
deferred.resolve(response.data.result);
}
function error(response) {
deferred.reject(response.data.error);
}
return deferred.promise;
},
clear: function clear(notification) {
if (notification && channelsByNotification[notification]) {
channelsByNotification[notification].length = 0;
}
},
get globalActive() {
return _globalActive;
},
set globalActive(value) {
_globalActive = value;
}
};
});
;
/*! RESOURCE: /scripts/notification_preference/service.notificationPreferences.js */
angular.module('sn.notification_preference').service('notificationPreferencesService', function($q, snResource, $httpParamSerializer, notificationPreferenceModel) {
var baseUrl = '/api/now/v1/notification/preference';
var preferences = [];
var _totalCount = 0;
function preferencesMatch(a, b) {
if (b.type === 'system') {
return a.type === b.type &&
a.notification.table === b.notification.table &&
a.notification.sys_id === b.notification.sys_id;
}
if (b.type === 'personal') {
return a.type === b.type &&
a.records.some(function (record) {
return b.records.some(function (newRecord) {
return record.table === newRecord.table && record.sys_id === newRecord.sys_id;
});
});
}
return false;
}
return {
load: function load(options) {
var self = this;
var url = baseUrl;
if (!options) {
throw 'Missing required options argument'
}
if (options.preference) {
url += '/' + options.preference;
} else {
if (!options.category && !options.search) {
throw 'Missing required options.category or options.search argument';
}
var params = $httpParamSerializer(options);
if (params) {
url += '?' + params;
}
}
return snResource().get(url).then(function success(response) {
function processPreferenceData(preferenceData) {
var preference = notificationPreferenceModel(preferenceData);
if (self.exists(preference)) {
self.replace(preference);
} else {
self.add(preference);
}
return preference;
}
if (options.preference) {
return processPreferenceData(response.data.result)
} else {
_totalCount = parseInt(response.headers()['x-total-count'] || 0, 10);
response.data.result.preferences.forEach(processPreferenceData);
return preferences;
}
});
},
exists: function exists(newPreference) {
if (!newPreference) {
throw 'Missing required newPreference argument'
}
return preferences.some(function (preference) {
return preferencesMatch(preference, newPreference);
});
},
add: function add(preference) {
if (!preference) {
throw 'Missing required preference argument'
}
preferences.push(preference);
},
replace: function replace(newPreference) {
var index = _.findIndex(preferences, function(preference) {
return preferencesMatch(preference, newPreference);
});
preferences.splice(index, 1, newPreference);
},
remove: function remove(table, sysId) {
var index = _.findIndex(preferences, function(preference) {
return preference.records.some(function (record) {
return record.table === table && record.sys_id === sysId;
});
});
preferences.splice(index, 1);
},
update: function update(preference) {
var self = this;
var deferred = $q.defer();
snResource().post(baseUrl, {
preference: preference
}).then(success, error);
function success(response) {
var newPreference = notificationPreferenceModel(response.data.result);
self.replace(newPreference);
deferred.resolve(newPreference);
}
function error(response) {
deferred.reject(response.data.error);
}
return deferred.promise;
},
updateAll: function updateAll(preference) {
var deferred = $q.defer();
snResource().post(baseUrl + '/all', {
enable_notifications: preference.active
}).then(success, error);
function success(response) {
deferred.resolve(response.data.result);
}
function error(response) {
deferred.reject(response.data.error);
}
return deferred.promise;
},
clear: function clear() {
preferences.length = 0;
},
get totalCount() {
return _totalCount;
}
};
});
;
/*! RESOURCE: /scripts/notification_preference/factory.emailDigestIntervals.js */
angular.module('sn.notification_preference').factory('emailDigestIntervals', function($q, $httpParamSerializer, snResource) {
var exposedApi = {};
var url = '/api/now/v1/notification/preference/interval';
var _totalCount = 0;
exposedApi.load = function(options) {
var deferred = $q.defer();
var params = $httpParamSerializer(options);
if (params)
url += '?' + params;
snResource().get(url).then(success, error);
function success(response) {
_totalCount = parseInt(response.headers()['x-total-count'] || 0, 10);
deferred.resolve(response.data.result);
}
function error(response) {
deferred.reject(response.data.error.message);
}
return deferred.promise;
},
exposedApi.getTotalCount = function() {
return _totalCount;
}
return exposedApi;
});
;
/*! RESOURCE: /scripts/notification_preference/factory.emailDigestPreference.js */
angular.module('sn.notification_preference').factory('emailDigestPreference', function(snResource, $q,
emailDigestPreferenceModel) {
var url = "api/now/v1/notification/preference/digest";
var exposedApi = {};
exposedApi.updatePreference = function(preference) {
var deferred = $q.defer();
snResource().post(url, {
preference: preference
}).then(success, error);
function success(response) {
var newPreference = new emailDigestPreferenceModel(response.data.result);
deferred.resolve(newPreference);
}
function error(response) {
deferred.reject(response.data.error.message);
}
return deferred.promise;
}
return exposedApi;
});
;
/*! RESOURCE: /scripts/notification_preference/factory.keydownHandler.js */
angular.module('sn.notification_preference').factory('keydownHandler', function() {
var exposedApi = {};
exposedApi.isNonSpaceOrEnterKeydownEvent = function(event) {
if (!event || event.type !== 'keydown')
return false;
var keyCode = event.keyCode || event.which;
if (keyCode !== 13 && keyCode !== 32) {
event.stopPropagation();
return true;
}
event.preventDefault();
return false;
}
return exposedApi;
});
;
/*! RESOURCE: /scripts/notification_preference/factory.notificationChannelModel.js */
angular.module('sn.notification_preference').factory('notificationChannelModel', function() {
'use strict';
var NotificationChannel = function(data) {
this.sys_id = data.sys_id;
this.name = data.name;
this.active = data.active;
this.logical_active = data.logical_active;
this.table = data.table;
this.readonly = data.readonly;
this.readonly_reason = data.readonly_reason;
};
NotificationChannel.prototype = {};
return function(data) {
return new NotificationChannel(data);
};
});
;
/*! RESOURCE: /scripts/notification_preference/factory.notificationPreferenceModel.js */
angular.module('sn.notification_preference').factory('notificationPreferenceModel', function(notificationChannelsService, notificationChannelModel) {
'use strict';
var NotificationPreference = function(data) {
this.notification = data.notification;
this.category = data.category.sys_id;
this.categoryName = data.category.name;
this.name = data.name;
this.type = data.type;
this.records = data.records;
this.digest = data.digest;
this.channelIds = data.records.filter(function (record) {
return record.logical_active;
}).map(function(record) {
if (!notificationChannelsService.exists(record.channel.sys_id)) {
notificationChannelsService.add(notificationChannelModel(record.channel), data.notification.sys_id);
}
return record.channel.sys_id;
});
this.recordForChannel = function (channelId) {
var channelRecord = null;
data.records.forEach(function (record) {
if (channelRecord) {
return;
}
if (record.channel.sys_id === channelId) {
channelRecord = record;
}
});
return channelRecord;
};
};
NotificationPreference.prototype = {
get channels() {
return this.channelIds.map(notificationChannelsService.get);
}
};
return function(data) {
return new NotificationPreference(data);
};
});
;
/*! RESOURCE: /scripts/notification_preference/factory.emailDigestPreferenceModel.js */
angular.module('sn.notification_preference').factory('emailDigestPreferenceModel', function() {
'use strict';
var EmailDigestPreference = function(data) {
this.active = data.active;
this.table = data.table;
this.sys_id = data.sys_id;
this.interval = {};
this.interval.table = 'sys_email_digest_interval';
this.interval.sys_id = data.interval_id;
}
return function(data) {
return new EmailDigestPreference(data);
}
});
;
/*! RESOURCE: /scripts/thirdparty/lodash.min.js */
/**
 * @license
 * Lo-Dash 3.0.0-pre (Custom Build) lodash.com/license | Underscore.js 1.6.0 underscorejs.org/LICENSE
 * Build: `lodash modern -o ./dist/lodash.js`
 */
;(function(){function n(n,t){for(var r=-1,e=t.length,u=Array(e);++r<e;)u[r]=n[t[r]];return u}function t(n,t){if(n!==t){if(n>t||typeof n=="undefined")return 1;if(n<t||typeof t=="undefined")return-1}return 0}function r(n,t,r){r=(r||0)-1;for(var e=n?n.length:0;++r<e;)if(n[r]===t)return r;return-1}function e(n,t){return n.has(t)?0:-1}function u(n){return n.charCodeAt(0)}function o(n,t){for(var r=-1,e=n.length;++r<e&&-1<t.indexOf(n.charAt(r)););return r}function i(n,t){for(var r=n.length;r--&&-1<t.indexOf(n.charAt(r)););return r
}function f(n,r){return t(n.a,r.a)||n.b-r.b}function a(n,r){for(var e=-1,u=n.a,o=r.a,i=u.length;++e<i;){var f=t(u[e],o[e]);if(f)return f}return n.b-r.b}function c(n){return function(t){for(var r=-1,e=(t=null!=t&&(t+"").replace(Z,l).match(X))?t.length:0,u="";++r<e;)u=n(u,t[r],r,t);return u}}function l(n){return xt[n]}function p(n){return jt[n]}function s(n){return"\\"+It[n]}function h(n){for(var t=-1,r=n.length;++t<r;){var e=n.charCodeAt(t);if((160<e||9>e||13<e)&&32!=e&&160!=e&&5760!=e&&6158!=e&&(8192>e||8202<e&&8232!=e&&8233!=e&&8239!=e&&8287!=e&&12288!=e&&65279!=e))break
}return t}function g(n){for(var t=n.length;t--;){var r=n.charCodeAt(t);if((160<r||9>r||13<r)&&32!=r&&160!=r&&5760!=r&&6158!=r&&(8192>r||8202<r&&8232!=r&&8233!=r&&8239!=r&&8287!=r&&12288!=r&&65279!=r))break}return t}function v(n){return At[n]}function y(l){function Z(n){if(n&&typeof n=="object"){if(n instanceof X)return n;!ju(n)&&Ke.call(n,"__wrapped__")&&(n=n.__wrapped__)}return new X(n)}function X(n,t){this.__chain__=!!t,this.__wrapped__=n}function jt(n,t){for(var r=-1,e=n?n.length:0;++r<e&&false!==t(n[r],r,n););return n
}function At(n,t){for(var r=-1,e=n.length;++r<e;)if(!t(n[r],r,n))return false;return true}function xt(n,t){for(var r=-1,e=n?n.length:0,u=we(e);++r<e;)u[r]=t(n[r],r,n);return u}function Et(n,t){for(var r=-1,e=n.length,u=[];++r<e;){var o=n[r];t(o,r,n)&&u.push(o)}return u}function It(n,t,r,e){var u=-1,o=n.length;for(e&&o&&(r=n[++u]);++u<o;)r=t(r,n[u],u,n);return r}function kt(n,t,r,e){var u=n.length;for(e&&u&&(r=n[--u]);u--;)r=t(r,n[u],u,n);return r}function Rt(n,t){for(var r=-1,e=n.length;++r<e;)if(t(n[r],r,n))return true;
	return false}function Ct(n,t){return typeof n=="undefined"?t:n}function Ft(n,t,r,e){return typeof n!="undefined"&&Ke.call(e,r)?n:t}function Tt(n,t,r){for(var e=-1,u=Eu(t),o=u.length;++e<o;){var i=u[e];n[i]=r?r(n[i],t[i],i,n,t):t[i]}return n}function Ut(n,t,r){var e=typeof n;if("function"==e){if(typeof t=="undefined")return n;if(e=n[I],typeof e=="undefined"&&(hu.funcNames&&(e=!n.name),e=e||!hu.funcDecomp,!e)){var u=We.call(n);hu.funcNames||(e=!z.test(u)),e||(e=Y.test(u)||wr(n),vu(n,e))}if(false===e||true!==e&&e[1]&_)return n;
	switch(r){case 1:return function(r){return n.call(t,r)};case 3:return function(r,e,u){return n.call(t,r,e,u)};case 4:return function(r,e,u,o){return n.call(t,r,e,u,o)};case 5:return function(r,e,u,o,i){return n.call(t,r,e,u,o,i)}}return function(){return n.apply(t,arguments)}}return null==n?de:"object"==e?me(n):be(n)}function Wt(n,t,r,e,u){var o=r?r(n):d;if(typeof o!="undefined")return o;var i=ju(n),f=!t;if(i){if(o=f?Cr(n):n.constructor(n.length),"string"==typeof n[0]&&Ke.call(n,"index")&&(o.index=n.index,o.input=n.input),f)return o
}else{if(!ie(n))return n;var a=Le.call(n);if(!_t[a])return n;var c=a==Q,l=!c&&a==ot;if(f&&(c||l)&&(o=Tt({},n),l))return o;var p=n.constructor;if(a!=ot||oe(p)&&p instanceof p||(p=Oe),t&&(c||l))o=new p;else switch(a){case at:return Ar(n);case tt:case rt:return new p(+n);case ct:case lt:case pt:case st:case ht:case gt:case vt:case yt:case dt:return new p(Ar(n.buffer),n.byteOffset,n.length);case ut:case ft:return new p(n);case it:return o=p(n.source,M.exec(n)),o.lastIndex=n.lastIndex,o}}if(c&&(o.length=n.length),f)return o;
	for(e||(e=[]),u||(u=[]),f=e.length;f--;)if(e[f]==n)return u[f];return e.push(n),u.push(o),(i?jt:Jt)(n,function(n,i){var f=r?r(n,i):d;o[i]=typeof f=="undefined"?Wt(n,t,null,e,u):f}),o}function Nt(n){return ie(n)?ru(n):{}}function Lt(n){var t=n[1];if(t==_)return vu(sr(n),n);var r=n[6];if((t==x||t==(_|x))&&!r.length)return vu(vr(n),n);var e=n[0],u=n[2],o=n[3],i=n[4],f=n[5],a=n[7],c=t&_,l=t&b,p=t&w,s=t&j,h=t&A,g=!l&&hr(e),v=e,y=function(){for(var n=arguments.length,d=n,m=we(n);d--;)m[d]=arguments[d];
	if(i){for(var d=r.length,w=-1,j=iu(m.length-d,0),A=-1,I=i.length,O=we(j+I);++A<I;)O[A]=i[A];for(;++w<d;)O[r[w]]=m[w];for(;j--;)O[A++]=m[w++];m=O}if(f){for(var d=-1,w=a.length,j=-1,k=iu(m.length-w,0),A=-1,I=f.length,O=we(k+I);++j<k;)O[j]=m[j];for(k=j;++A<I;)O[k+A]=f[A];for(;++d<w;)O[k+a[d]]=m[j++];m=O}return(p||s)&&(d=mr(m),n-=d.length,n<u)?(t|=p?x:E,t&=~(p?E:x),h||(t&=~(_|b)),n=[e,t,iu(u-n,0),o],n[p?4:5]=m,n[p?6:7]=d,Lt(n)):(n=c?o:this,l&&(e=n[v]),(this instanceof y?g||hr(e):e).apply(n,m))};return vu(y,n)
}function $t(n,t,r){return typeof r!="number"&&(r=+r||(n?n.length:0)),yr(n,t,r)}function Bt(n,t){var u=n?n.length:0;if(!u)return[];var o=-1,i=_r(),f=i==r,a=f&&gu&&t&&200<=t.length,f=f&&!a,c=[],l=t?t.length:0;a&&(i=e,t=gu(t));n:for(;++o<u;)if(a=n[o],f){for(var p=l;p--;)if(t[p]===a)continue n;c.push(a)}else 0>i(t,a)&&c.push(a);return c}function Dt(n,t){var r=n?n.length:0;if(typeof r!="number"||-1>=r||r>R)return Jt(n,t);for(var e=-1,u=Ir(n);++e<r&&false!==t(u[e],e,n););return n}function Mt(n,t){var r=n?n.length:0;
	if(typeof r!="number"||-1>=r||r>R)return Xt(n,t);for(var e=Ir(n);r--&&false!==t(e[r],r,n););return n}function zt(n,t){var r=true;return Dt(n,function(n,e,u){return r=!!t(n,e,u)}),r}function qt(n,t){var r=[];return Dt(n,function(n,e,u){t(n,e,u)&&r.push(n)}),r}function Pt(n,t,r,e){var u;return r(n,function(n,r,o){return t(n,r,o)?(u=e?r:n,false):void 0}),u}function Zt(n,t,r,e){e=(e||0)-1;for(var u=n.length,o=0,i=[];++e<u;){var f=n[e];if(f&&typeof f=="object"&&typeof f.length=="number"&&(ju(f)||re(f))){t&&(f=Zt(f,t,r));
	var a=-1,c=f.length;for(i.length+=c;++a<c;)i[o++]=f[a]}else r||(i[o++]=f)}return i}function Kt(n,t,r){var e=-1;r=r(n);for(var u=r.length;++e<u;){var o=r[e];if(false===t(n[o],o,n))break}return n}function Vt(n,t,r){r=r(n);for(var e=r.length;e--;){var u=r[e];if(false===t(n[u],u,n))break}return n}function Yt(n,t){return Kt(n,t,le)}function Jt(n,t){return Kt(n,t,Eu)}function Xt(n,t){return Vt(n,t,Eu)}function Gt(n,t){for(var r=-1,e=t(n),u=e.length,o=[];++r<u;){var i=e[r];oe(n[i])&&o.push(i)}return o}function Ht(n,t,r,e,u,o){var i=r&&!u?r(n,t):d;
	if(typeof i!="undefined")return!!i;if(n===t)return 0!==n||1/n==1/t;var f=typeof n,a=typeof t;if(n===n&&(null==n||null==t||"function"!=f&&"object"!=f&&"function"!=a&&"object"!=a))return false;var c=Le.call(n),l=c==Q,f=Le.call(t),i=f==Q;if(l&&(c=ot),i&&(f=ot),c!=f)return false;if(a=mt[c],f=c==et,a){var l=n.length,p=t.length;if(l!=p&&(!e||p<=l))return false}else{if(!f&&c!=ot){switch(c){case tt:case rt:return+n==+t;case ut:return n!=+n?t!=+t:0==n?1/n==1/t:n==+t;case it:case ft:return n==Re(t)}return false}var s=Ke.call(n,"__wrapped__"),c=Ke.call(t,"__wrapped__");
		if(s||c)return Ht(s?n.__wrapped__:n,c?t.__wrapped__:t,r,e,u,o);if(s=l?Oe:n.constructor,c=i?Oe:t.constructor,f){if(s.prototype.name!=c.prototype.name)return false}else{var p=!l&&Ke.call(n,"constructor"),h=!i&&Ke.call(t,"constructor");if(p!=h||!(p||s==c||oe(s)&&s instanceof s&&oe(c)&&c instanceof c)&&"constructor"in n&&"constructor"in t)return false}if(s=f?["message","name"]:Eu(n),c=f?s:Eu(t),l&&s.push("length"),i&&c.push("length"),l=s.length,p=c.length,l!=p&&!e)return false}for(u||(u=[]),o||(o=[]),c=u.length;c--;)if(u[c]==n)return o[c]==t;
	if(u.push(n),o.push(t),i=true,a)for(;i&&++c<l;)if(a=n[c],e)for(f=p;f--&&!(i=Ht(a,t[f],r,e,u,o)););else h=t[c],i=r?r(a,h,c):d,typeof i=="undefined"&&(i=Ht(a,h,r,e,u,o));else for(;i&&++c<l;)p=s[c],(i=f||Ke.call(t,p))&&(a=n[p],h=t[p],i=r?r(a,h,p):d,typeof i=="undefined"&&(i=Ht(a,h,r,e,u,o)));return u.pop(),o.pop(),!!i}function Qt(n,t,r){var e=-1,u=typeof t=="function",o=n?n.length:0,i=[];return typeof o=="number"&&-1<o&&o<=R&&(i.length=o),Dt(n,function(n){var o=u?t:null!=n&&n[t];i[++e]=o?o.apply(n,r):d
}),i}function nr(n,t){var r=[];return Dt(n,function(n,e,u){r.push(t(n,e,u))}),r}function tr(n,t,r,e,u){var o=br(t);return(o?jt:Jt)(t,function(t,i,f){var a=t&&br(t),c=t&&xu(t),l=n[i];if(a||c){for(e||(e=[]),u||(u=[]),c=e.length;c--;)if(e[c]==t)return void(n[i]=u[c]);f=r?r(l,t,i,n,f):d,(c=typeof f=="undefined")&&(f=a?ju(l)?l:[]:xu(l)?l:{}),e.push(t),u.push(f),c&&tr(f,t,r,e,u),n[i]=f}else f=r?r(l,t,i,n,f):d,typeof f=="undefined"&&(f=t),(o||typeof f!="undefined")&&(n[i]=f)}),n}function rr(n,t,r,e){if(n)var u=n[I],u=u?u[2]:n.length,u=u-r.length;
	var o=t&x;return yr(n,t,u,e,o&&r,!o&&r)}function er(n,t){var r={};if(typeof t=="function")return Yt(n,function(n,e,u){t(n,e,u)&&(r[e]=n)}),r;for(var e=-1,u=t.length;++e<u;){var o=t[e];o in n&&(r[o]=n[o])}return r}function ur(n,t){return n+Pe(pu()*(t-n+1))}function or(n,t,r,e,u){return u(n,function(n,u,o){r=e?(e=false,n):t(r,n,u,o)}),r}function ir(n,t){var r;return Dt(n,function(n,e,u){return r=t(n,e,u),!r}),!!r}function fr(n,t,r,e){var u=0,o=n?n.length:u;for(t=r(t);u<o;){var i=u+o>>>1,f=r(n[i]);(e?f<=t:f<t)?u=i+1:o=i
}return o}function ar(n,t){var u=-1,o=_r(),i=n.length,f=o==r,a=f&&gu&&200<=i,f=f&&!a,c=[];if(a)var l=gu(),o=e;else l=t?[]:c;n:for(;++u<i;){var p=n[u],s=t?t(p,u,n):p;if(f){for(var h=l.length;h--;)if(l[h]===s)continue n;t&&l.push(s),c.push(p)}else 0>o(l,s)&&((t||a)&&l.push(s),c.push(p))}return c}function cr(n,t){for(var r=-1,e=t(n),u=e.length,o=we(u);++r<u;)o[r]=n[e[r]];return o}function lr(n,t){return function(r,e,u){var o=t?t():{};if(e=dr(e,u,3),ju(r)){u=-1;for(var i=r.length;++u<i;){var f=r[u];n(o,f,e(f,u,r),r)
}}else Dt(r,function(t,r,u){n(o,t,e(t,r,u),u)});return o}}function pr(n){return function(t){var r=arguments,e=r.length;if(null==t||2>e)return t;var u=typeof r[2];if("number"!=u&&"string"!=u||!r[3]||r[3][r[2]]!==r[1]||(e=2),3<e&&"function"==typeof r[e-2])var o=Ut(r[--e-1],r[e--],5);else 2<e&&"function"==typeof r[e-1]&&(o=r[--e]);for(u=0;++u<e;)n(t,r[u],o);return t}}function sr(n){function t(){return(this instanceof t?u:r).apply(e,arguments)}var r=n[0],e=n[3],u=hr(r);return t}function hr(n){return function(){var t=Nt(n.prototype),r=n.apply(t,arguments);
	return ie(r)?r:t}}function gr(n,t,r){return n=n.length,t=+t,n<t&&uu(t)?(t-=n,r=null==r?" ":Re(r),he(r,Me(t/r.length)).slice(0,t)):""}function vr(n){function t(){for(var n=0,f=arguments.length,a=-1,c=u.length,l=we(f+c);++a<c;)l[a]=u[a];for(;f--;)l[a++]=arguments[n++];return(this instanceof t?i:r).apply(o?e:this,l)}var r=n[0],e=n[3],u=n[4],o=n[1]&_,i=hr(r);return t}function yr(n,t,r,e,u,o){var i=t&_,f=t&b,a=t&x,c=t&E;if(!f&&!oe(n))throw new Se(O);a&&!u.length&&(t&=~x,a=u=false),c&&!o.length&&(t&=~E,c=o=false);
	var l=!f&&n[I];if(l&&true!==l)return l=Cr(l),l[4]&&(l[4]=Cr(l[4])),l[5]&&(l[5]=Cr(l[5])),typeof r=="number"&&(l[2]=r),n=l[1]&_,i&&!n&&(l[3]=e),!i&&n&&(t|=A),a&&(l[4]?Ve.apply(l[4],u):l[4]=u),c&&(l[5]?Qe.apply(l[5],o):l[5]=o),l[1]|=t,yr.apply(d,l);if(a)var p=mr(u);if(c)var s=mr(o);return null==r&&(r=f?0:n.length),r=iu(r,0),Lt([n,t,r,e,u,o,p,s])}function dr(n,t,r){var e=Z.callback||ye,e=e===ye?Ut:e;return arguments.length?e(n,t,r):e}function mr(n){for(var t=-1,r=n.length,e=[];++t<r;)n[t]===Z&&e.push(t);
	return e}function _r(n,t,e){var u=Z.indexOf||Rr,u=u===Rr?r:u;return n?u(n,t,e):u}function br(n){return n&&typeof n=="object"&&typeof n.length=="number"&&mt[Le.call(n)]||false}function wr(n){var t=typeof n;return"function"==t?$e.test(We.call(n)):n&&"object"==t&&P.test(Le.call(n))||false}function jr(n){return n===n&&(0===n?0<1/n:!ie(n))}function Ar(n){return De.call(n,0)}function xr(n){var t,r;return n&&Le.call(n)==ot&&(Ke.call(n,"constructor")||(t=n.constructor,!oe(t)||t instanceof t))?(Yt(n,function(n,t){r=t
}),typeof r=="undefined"||Ke.call(n,r)):false}function Er(n){for(var t,r=-1,e=le(n),u=e.length,o=u&&n.length,i=o-1,f=[],o=typeof o=="number"&&0<o&&(ju(n)||hu.nonEnumArgs&&re(n));++r<u;){var a=e[r];(o&&(t=+a,-1<t&&t<=i&&0==t%1)||Ke.call(n,a))&&f.push(a)}return f}function Ir(n){var t=n?n.length:0;return typeof t=="number"&&-1<t&&t<=R?n||[]:pe(n)}function Or(n,t,r){var e=-1,u=n?n.length:0;for(t=dr(t,r,3);++e<u;)if(t(n[e],e,n))return e;return-1}function kr(n){return n?n[0]:d}function Rr(n,t,e){var u=n?n.length:0;
	if(typeof e=="number")e=0>e?iu(u+e,0):e||0;else if(e)return e=Fr(n,t),u&&n[e]===t?e:-1;return r(n,t,e)}function Sr(n){return Cr(n,1)}function Cr(n,t,r){var e=-1,u=n?n.length:0;for(t=null==t?0:+t||0,0>t?t=iu(u+t,0):t>u&&(t=u),r=typeof r=="undefined"?u:+r||0,0>r?r=iu(u+r,0):r>u&&(r=u),u=t>r?0:r-t,r=we(u);++e<u;)r[e]=n[t+e];return r}function Fr(n,t,r,e){return r=null==r?de:dr(r,e,1),fr(n,t,r)}function Tr(n,t,r,e){return r=null==r?de:dr(r,e,1),fr(n,t,r,true)}function Ur(n,t,e,u){if(!n||!n.length)return[];
	var o=typeof t;if("boolean"!=o&&null!=t&&(u=e,e=t,t=false,"number"!=o&&"string"!=o||!u||u[e]!==n||(e=null)),null!=e&&(e=dr(e,u,3)),t&&_r()==r){t=e;var i;for(e=-1,u=n.length,o=[];++e<u;){var f=n[e],a=t?t(f,e,n):f;e&&i===a||(i=a,o.push(f))}n=o}else n=ar(n,e);return n}function Wr(n){for(var t=-1,r=ie(r=Zr(n,"length"))&&r.length||0,e=we(r);++t<r;)e[t]=Kr(n,t);return e}function Nr(n,t){var r=-1,e=n?n.length:0,u={};for(t||!e||ju(n[0])||(t=[]);++r<e;){var o=n[r];t?u[o]=t[r]:o&&(u[o[0]]=o[1])}return u}function Lr(){return this.__wrapped__
}function $r(n,t,r){var e=n?n.length:0;return typeof e=="number"&&-1<e&&e<=R||(n=pe(n),e=n.length),r=typeof r=="number"?0>r?iu(e+r,0):r||0:0,typeof n=="string"||!ju(n)&&ce(n)?r<e?tu?tu.call(n,t,r):-1<n.indexOf(t,r):false:-1<_r(n,t,r)}function Br(n,t,r){return(typeof t!="function"||typeof r!="undefined")&&(t=dr(t,r,3)),(ju(n)?At:zt)(n,t)}function Dr(n,t,r){return t=dr(t,r,3),(ju(n)?Et:qt)(n,t)}function Mr(n,t,r){return ju(n)?(t=Or(n,t,r),-1<t?n[t]:d):(t=dr(t,r,3),Pt(n,t,Dt))}function zr(n,t,r){return typeof t=="function"&&typeof r=="undefined"&&ju(n)?jt(n,t):Dt(n,Ut(t,r,3))
}function qr(n,t,r){if(typeof t=="function"&&typeof r=="undefined"&&ju(n))for(r=n?n.length:0;r--&&false!==t(n[r],r,n););else n=Mt(n,Ut(t,r,3));return n}function Pr(n,t,r){return t=dr(t,r,3),(ju(n)?xt:nr)(n,t)}function Zr(n,t,r){var e=-1/0,o=e,i=typeof t;"number"!=i&&"string"!=i||!r||r[t]!==n||(t=null);var i=null==t,f=!(i&&ju(n))&&ce(n);if(i&&!f)for(r=-1,n=Ir(n),i=n.length;++r<i;)f=n[r],f>o&&(o=f);else t=i&&f?u:dr(t,r,3),Dt(n,function(n,r,u){r=t(n,r,u),(r>e||-1/0===r&&r===o)&&(e=r,o=n)});return o}function Kr(n,t){return Pr(n,be(t))
}function Vr(n,t,r,e){return(ju(n)?It:or)(n,dr(t,e,4),r,3>arguments.length,Dt)}function Yr(n,t,r,e){return(ju(n)?kt:or)(n,dr(t,e,4),r,3>arguments.length,Mt)}function Jr(n){n=Ir(n);for(var t=-1,r=n.length,e=we(r);++t<r;){var u=ur(0,t);t!=u&&(e[t]=e[u]),e[u]=n[t]}return e}function Xr(n,t,r){return(typeof t!="function"||typeof r!="undefined")&&(t=dr(t,r,3)),(ju(n)?Rt:ir)(n,t)}function Gr(n,t){var r;if(!oe(t))throw new Se(O);return function(){return 0<--n?r=t.apply(this,arguments):t=null,r}}function Hr(n,t,r){function e(){var r=t-(Su()-c);
	0>=r||r>t?(f&&ze(f),r=s,f=p=s=d,r&&(h=Su(),a=n.apply(l,i),p||f||(i=l=null))):p=Xe(e,r)}function u(){p&&ze(p),f=p=s=d,(v||g!==t)&&(h=Su(),a=n.apply(l,i),p||f||(i=l=null))}function o(){if(i=arguments,c=Su(),l=this,s=v&&(p||!y),false===g)var r=y&&!p;else{f||y||(h=c);var o=g-(c-h),d=0>=o||o>g;d?(f&&(f=ze(f)),h=c,a=n.apply(l,i)):f||(f=Xe(u,o))}return d&&p?p=ze(p):p||t===g||(p=Xe(e,t)),r&&(d=true,a=n.apply(l,i)),!d||p||f||(i=l=null),a}var i,f,a,c,l,p,s,h=0,g=false,v=true;if(!oe(n))throw new Se(O);if(t=0>t?0:t,true===r)var y=true,v=false;
else ie(r)&&(y=r.leading,g="maxWait"in r&&iu(+r.maxWait||0,t),v="trailing"in r?r.trailing:v);return o.cancel=function(){p&&ze(p),f&&ze(f),f=p=s=d},o}function Qr(n){if(!oe(n))throw new Se(O);return function(){return!n.apply(this,arguments)}}function ne(n){return rr(n,x,Cr(arguments,1))}function te(n){return Gt(n,le)}function re(n){return n&&typeof n=="object"&&typeof n.length=="number"&&Le.call(n)==Q||false}function ee(n){return n&&typeof n=="object"&&1===n.nodeType&&-1<Le.call(n).indexOf("Element")||false
}function ue(n){return n&&typeof n=="object"&&Le.call(n)==et||false}function oe(n){return typeof n=="function"||false}function ie(n){var t=typeof n;return"function"==t||n&&"object"==t||false}function fe(n){var t=typeof n;return"number"==t||n&&"object"==t&&Le.call(n)==ut||false}function ae(n){return n&&typeof n=="object"&&Le.call(n)==it||false}function ce(n){return typeof n=="string"||n&&typeof n=="object"&&Le.call(n)==ft||false}function le(n){if(null==n)return[];n=Oe(n);for(var t,r=n.length,r=(typeof r=="number"&&0<r&&(ju(n)||hu.nonEnumArgs&&re(n))&&r)>>>0,e=n.constructor,u=-1,e=e&&n===e.prototype,o=r-1,i=we(r),f=0<r;++u<r;)i[u]=Re(u);
	for(var a in n)e&&"constructor"==a||f&&(t=+a,-1<t&&t<=o&&0==t%1)||i.push(a);return i}function pe(n){return cr(n,Eu)}function se(n){return n=null==n?"":Re(n),V.lastIndex=0,V.test(n)?n.replace(V,"\\$&"):n}function he(n,t){var r="";if(t=+t,1>t||null==n||!uu(t))return r;n=Re(n);do t%2&&(r+=n),t=Pe(t/2),n+=n;while(t);return r}function ge(n,t){return(n=null==n?"":Re(n))?null==t?n.slice(h(n),g(n)+1):(t=Re(t),n.slice(o(n,t),i(n,t)+1)):n}function ve(n){try{return n()}catch(t){return ue(t)?t:Ae(t)}}function ye(n,t){return Ut(n,t)
}function de(n){return n}function me(n){var t=Eu(n),r=t.length;if(1==r){var e=t[0],u=n[e];if(jr(u))return function(n){return null!=n&&u===n[e]&&Ke.call(n,e)}}for(var o=r,i=we(r),f=we(r);o--;){var u=n[t[o]],a=jr(u);i[o]=a,f[o]=a?u:Wt(u,false)}return function(n){if(o=r,null==n)return!o;for(;o--;)if(i[o]?f[o]!==n[t[o]]:!Ke.call(n,t[o]))return false;for(o=r;o--;)if(i[o]?!Ke.call(n,t[o]):!Ht(f[o],n[t[o]],null,true))return false;return true}}function _e(n,t,r){var e=true,u=t&&Gt(t,Eu);t&&(r||u.length)||(null==r&&(r=t),t=n,n=this,u=Gt(t,Eu)),false===r?e=false:ie(r)&&"chain"in r&&(e=r.chain),r=-1;
	for(var o=oe(n),i=u?u.length:0;++r<i;){var f=u[r],a=n[f]=t[f];o&&(n.prototype[f]=function(t){return function(){var r=this.__chain__,u=this.__wrapped__,o=[u];if(Ve.apply(o,arguments),o=t.apply(n,o),e||r){if(u===o&&ie(o))return this;o=new n(o),o.__chain__=r}return o}}(a))}return n}function be(n){return function(t){return null==t?d:t[n]}}l=l?St.defaults(Ot.Object(),l,St.pick(Ot,H)):Ot;var we=l.Array,je=l.Date,Ae=l.Error,xe=l.Function,Ee=l.Math,Ie=l.Number,Oe=l.Object,ke=l.RegExp,Re=l.String,Se=l.TypeError,Ce=we.prototype,Fe=Oe.prototype,Te=Re.prototype,Ue=(Ue=l.window)&&Ue.document,We=xe.prototype.toString,Ne=l._,Le=Fe.toString,$e=ke("^"+se(Le).replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),Be=wr(Be=l.ArrayBuffer)&&Be,De=wr(De=Be&&new Be(0).slice)&&De,Me=Ee.ceil,ze=l.clearTimeout,qe=wr(qe=l.Float64Array)&&qe,Pe=Ee.floor,Ze=wr(Ze=Oe.getPrototypeOf)&&Ze,Ke=Fe.hasOwnProperty,Ve=Ce.push,Ye=Fe.propertyIsEnumerable,Je=wr(Je=l.Set)&&Je,Xe=l.setTimeout,Ge=Ce.splice,He=wr(He=l.Uint8Array)&&He,Qe=Ce.unshift,nu=function(){try{var n={},t=wr(t=Oe.defineProperty)&&t,r=t(n,n,n)&&t
}catch(e){}return r}(),tu=wr(tu=Te.contains)&&tu,ru=wr(ru=Oe.create)&&ru,eu=wr(eu=we.isArray)&&eu,uu=l.isFinite,ou=wr(ou=Oe.keys)&&ou,iu=Ee.max,fu=Ee.min,au=wr(au=je.now)&&au,cu=wr(cu=Ie.isFinite)&&cu,lu=l.parseInt,pu=Ee.random,su=qe&&qe.BYTES_PER_ELEMENT,hu=Z.support={};!function(x_){for(var n in arguments);hu.funcDecomp=!wr(l.WinRTError)&&Y.test(y),hu.funcNames=typeof xe.name=="string";try{hu.dom=11===Ue.createDocumentFragment().nodeType}catch(t){hu.dom=false}try{hu.nonEnumArgs=!("1"==n&&Ke.call(arguments,n)&&Ye.call(arguments,n))
}catch(r){hu.nonEnumArgs=true}}(0,0),Z.templateSettings={escape:L,evaluate:$,interpolate:B,variable:"",imports:{_:Z}},ru||(Nt=function(){function n(){}return function(t){if(ie(t)){n.prototype=t;var r=new n;n.prototype=null}return r||l.Object()}}());var gu=Je&&function(n){var t=new Je,r=n?n.length:0;for(t.push=t.add;r--;)t.push(n[r]);return t};De||(Ar=Be&&He?function(n){var t=n.byteLength,r=qe?Pe(t/su):0,e=r*su,u=new Be(t);if(r){var o=new qe(u,0,r);o.set(new qe(n,0,r))}return t!=e&&(o=new He(u,e),o.set(new He(n,e))),u
}:de);var vu=nu?function(n,t){return wt.value=t,nu(n,I,wt),wt.value=null,n}:de,yu=lr(function(n,t,r){Ke.call(n,r)?n[r]++:n[r]=1}),du=lr(function(n,t,r){Ke.call(n,r)?n[r].push(t):n[r]=[t]}),mu=lr(function(n,t,r){n[r]=t}),_u=lr(function(n,t,r){n[r?0:1].push(t)},function(){return[[],[]]}),bu=ne(Gr,2),wu=pr(Tt),ju=eu||function(n){return n&&typeof n=="object"&&typeof n.length=="number"&&Le.call(n)==nt||false};hu.dom||(ee=function(n){return n&&typeof n=="object"&&1===n.nodeType&&!xu(n)||false});var Au=cu||function(n){return typeof n=="number"&&uu(n)
},xu=Ze?function(n){if(!n||Le.call(n)!=ot)return false;var t=n.valueOf,r=wr(t)&&(r=Ze(t))&&Ze(r);return r?n==r||Ze(n)==r:xr(n)}:xr,Eu=ou?function(n){n=Oe(n);var t=n.constructor,r=n.length;return t&&n===t.prototype||typeof r=="number"&&0<r?Er(n):ou(n)}:Er,Iu=pr(tr),Ou=c(function(n,t,r){return!r&&C.test(t)?n+t.toLowerCase():n+(t.charAt(0)[r?"toUpperCase":"toLowerCase"]()+t.slice(1))}),ku=c(function(n,t,r){return n+(r?"-":"")+t.toLowerCase()}),Ru=c(function(n,t,r){return n+(r?"_":"")+t.toLowerCase()}),Su=au||function(){return(new je).getTime()
},Cu=8==lu(G+"08")?lu:function(n,t){return n=ge(n),lu(n,+t||(q.test(n)?16:10))};return X.prototype=Z.prototype,Z.after=function(n,t){if(!oe(t))throw new Se(O);return n=uu(n=+n)?n:0,function(){return 1>--n?t.apply(this,arguments):void 0}},Z.assign=wu,Z.at=function(t){var r=t?t.length:0;return typeof r=="number"&&-1<r&&r<=R&&(t=Ir(t)),n(t,Zt(arguments,false,false,1))},Z.before=Gr,Z.bind=function(n,t){return 3>arguments.length?yr(n,_,null,t):rr(n,_|x,Cr(arguments,2),t)},Z.bindAll=function(n){for(var t=n,r=1<arguments.length?Zt(arguments,false,false,1):te(n),e=-1,u=r.length;++e<u;){var o=r[e];
	t[o]=yr(t[o],_,null,t)}return t},Z.bindKey=function(n,t){return 3>arguments.length?yr(t,_|b,null,n):yr(t,_|b|x,null,n,Cr(arguments,2))},Z.callback=ye,Z.chain=function(n){return n=Z(n),n.__chain__=true,n},Z.chunk=function(n,t){var r=0,e=n?n.length:0,u=[];for(t=iu(+t||1,1);r<e;)u.push(Cr(n,r,r+=t));return u},Z.compact=function(n){for(var t=-1,r=n?n.length:0,e=0,u=[];++t<r;){var o=n[t];o&&(u[e++]=o)}return u},Z.compose=function(){var n=arguments,t=n.length,r=t-1;if(!t)return function(){};for(;t--;)if(!oe(n[t]))throw new Se(O);
	return function(){t=r;for(var e=n[t].apply(this,arguments);t--;)e=n[t].call(this,e);return e}},Z.constant=function(n){return function(){return n}},Z.countBy=yu,Z.create=function(n,t){var r=Nt(n);return t?Tt(r,t):r},Z.curry=function(n,t){return $t(n,w,t)},Z.curryRight=function(n,t){return $t(n,j,t)},Z.debounce=Hr,Z.defaults=function(n){if(null==n)return n;var t=Cr(arguments);return t.push(Ct),wu.apply(d,t)},Z.defer=function(n){if(!oe(n))throw new Se(O);var t=Cr(arguments,1);return Xe(function(){n.apply(d,t)
},1)},Z.delay=function(n,t){if(!oe(n))throw new Se(O);var r=Cr(arguments,2);return Xe(function(){n.apply(d,r)},t)},Z.difference=function(){for(var n=-1,t=arguments.length;++n<t;){var r=arguments[n];if(ju(r)||re(r))break}return Bt(arguments[n],Zt(arguments,false,true,++n))},Z.drop=function(n,t,r){return t=null==t||r?1:t,Cr(n,0>t?0:t)},Z.dropRight=function(n,t,r){var e=n?n.length:0;return t=e-((null==t||r?1:t)||0),Cr(n,0,0>t?0:t)},Z.dropRightWhile=function(n,t,r){var e=n?n.length:0;for(t=dr(t,r,3);e--&&t(n[e],e,n););return Cr(n,0,e+1)
},Z.dropWhile=function(n,t,r){var e=-1,u=n?n.length:0;for(t=dr(t,r,3);++e<u&&t(n[e],e,n););return Cr(n,e)},Z.filter=Dr,Z.flatten=function(n,t,r){if(!n||!n.length)return[];var e=typeof t;return"number"!=e&&"string"!=e||!r||r[t]!==n||(t=false),Zt(n,t)},Z.forEach=zr,Z.forEachRight=qr,Z.forIn=function(n,t,r){return(typeof t!="function"||typeof r!="undefined")&&(t=Ut(t,r,3)),Kt(n,t,le)},Z.forInRight=function(n,t,r){return t=Ut(t,r,3),Vt(n,t,le)},Z.forOwn=function(n,t,r){return(typeof t!="function"||typeof r!="undefined")&&(t=Ut(t,r,3)),Jt(n,t)
},Z.forOwnRight=function(n,t,r){return t=Ut(t,r,3),Vt(n,t,Eu)},Z.functions=te,Z.groupBy=du,Z.indexBy=mu,Z.initial=function(n){var t=n?n.length:0;return Cr(n,0,t?t-1:0)},Z.intersection=function(){for(var n=[],t=-1,u=arguments.length,o=[],i=_r(),f=gu&&i==r;++t<u;){var a=arguments[t];(ju(a)||re(a))&&(n.push(a),o.push(f&&120<=a.length&&gu(t&&a)))}var u=n.length,f=n[0],c=-1,l=f?f.length:0,p=[],s=o[0];n:for(;++c<l;)if(a=f[c],0>(s?e(s,a):i(p,a))){for(t=u;--t;){var h=o[t];if(0>(h?e(h,a):i(n[t],a)))continue n
}s&&s.push(a),p.push(a)}return p},Z.invert=function(n,t){for(var r=-1,e=Eu(n),u=e.length,o={};++r<u;){var i=e[r],f=n[i];t?Ke.call(o,f)?o[f].push(i):o[f]=[i]:o[f]=i}return o},Z.invoke=function(n,t){return Qt(n,t,Cr(arguments,2))},Z.keys=Eu,Z.keysIn=le,Z.map=Pr,Z.mapValues=function(n,t,r){var e={};return t=dr(t,r,3),Jt(n,function(n,r,u){e[r]=t(n,r,u)}),e},Z.matches=me,Z.memoize=function(n,t){if(!oe(n)||t&&!oe(t))throw new Se(O);var r=function(){var e=t?t.apply(this,arguments):arguments[0];if("__proto__"==e)return n.apply(this,arguments);
	var u=r.cache;return Ke.call(u,e)?u[e]:u[e]=n.apply(this,arguments)};return r.cache={},r},Z.merge=Iu,Z.mixin=_e,Z.negate=Qr,Z.omit=function(n,t,r){if(null==n)return{};if(typeof t=="function")return er(n,Qr(dr(t,r,3)));var e=Zt(arguments,false,false,1);return er(Oe(n),Bt(le(n),xt(e,Re)))},Z.once=bu,Z.pairs=function(n){for(var t=-1,r=Eu(n),e=r.length,u=we(e);++t<e;){var o=r[t];u[t]=[o,n[o]]}return u},Z.partial=ne,Z.partialRight=function(n){return rr(n,E,Cr(arguments,1))},Z.partition=_u,Z.pick=function(n,t,r){return null==n?{}:er(Oe(n),typeof t=="function"?dr(t,r,3):Zt(arguments,false,false,1))
},Z.pluck=Kr,Z.property=be,Z.pull=function(n){for(var t=0,r=arguments.length,e=n?n.length:0;++t<r;)for(var u=-1,o=arguments[t];++u<e;)n[u]===o&&(Ge.call(n,u--,1),e--);return n},Z.pullAt=function(r){var e=r,u=Zt(arguments,false,false,1),o=u.length,i=n(e,u);for(u.sort(t);o--;){var f=parseFloat(u[o]);if(f!=a&&-1<f&&0==f%1){var a=f;Ge.call(e,f,1)}}return i},Z.range=function(n,t,r){n=+n||0,r=null==r?1:+r||0,null==t?(t=n,n=0):t=+t||0;var e=-1;t=iu(Me((t-n)/(r||1)),0);for(var u=we(t);++e<t;)u[e]=n,n+=r;return u
},Z.reject=function(n,t,r){return t=dr(t,r,3),Dr(n,Qr(t))},Z.remove=function(n,t,r){var e=-1,u=n?n.length:0,o=[];for(t=dr(t,r,3);++e<u;)r=n[e],t(r,e,n)&&(o.push(r),Ge.call(n,e--,1),u--);return o},Z.rest=Sr,Z.shuffle=Jr,Z.slice=Cr,Z.sortBy=function(n,t,r){var e=-1,u=n?n.length:0,o=t&&ju(t),i=[];for(typeof u=="number"&&-1<u&&u<=R&&(i.length=u),o||(t=dr(t,r,3)),Dt(n,function(n,r,u){if(o)for(r=t.length,u=we(r);r--;)u[r]=n[t[r]];else u=t(n,r,u);i[++e]={a:u,b:e,c:n}}),u=i.length,i.sort(o?a:f);u--;)i[u]=i[u].c;
	return i},Z.take=function(n,t,r){return t=null==t||r?1:t,Cr(n,0,0>t?0:t)},Z.takeRight=function(n,t,r){var e=n?n.length:0;return t=e-((null==t||r?1:t)||0),Cr(n,0>t?0:t)},Z.takeRightWhile=function(n,t,r){var e=n?n.length:0;for(t=dr(t,r,3);e--&&t(n[e],e,n););return Cr(n,e+1)},Z.takeWhile=function(n,t,r){var e=-1,u=n?n.length:0;for(t=dr(t,r,3);++e<u&&t(n[e],e,n););return Cr(n,0,e)},Z.tap=function(n,t,r){return t.call(r,n),n},Z.throttle=function(n,t,r){var e=true,u=true;if(!oe(n))throw new Se(O);return false===r?e=false:ie(r)&&(e="leading"in r?!!r.leading:e,u="trailing"in r?!!r.trailing:u),bt.leading=e,bt.maxWait=+t,bt.trailing=u,Hr(n,t,bt)
},Z.times=function(n,t,r){n=uu(n=+n)&&-1<n?n:0,t=Ut(t,r,1),r=-1;for(var e=we(fu(n,k));++r<n;)r<k?e[r]=t(r):t(r);return e},Z.toArray=function(n){var t=Ir(n);return t===n?Cr(n):t},Z.transform=function(n,t,r,e){var u=br(n);if(null==r)if(u)r=[];else{if(ie(n))var o=n.constructor,o=o&&o.prototype;r=Nt(o)}return t&&(t=dr(t,e,4),(u?jt:Jt)(n,function(n,e,u){return t(r,n,e,u)})),r},Z.union=function(){return ar(Zt(arguments,false,true))},Z.uniq=Ur,Z.unzip=Wr,Z.values=pe,Z.valuesIn=function(n){return cr(n,le)},Z.where=function(n,t){return Dr(n,me(t))
},Z.without=function(){return Bt(arguments[0],Cr(arguments,1))},Z.wrap=function(n,t){return yr(t,x,null,null,[n])},Z.xor=function(){for(var n=-1,t=arguments.length;++n<t;){var r=arguments[n];if(ju(r)||re(r))var e=e?Bt(e,r).concat(Bt(r,e)):r}return e?ar(e):[]},Z.zip=function(){return Wr(arguments)},Z.zipObject=Nr,Z.collect=Pr,Z.each=zr,Z.eachRight=qr,Z.extend=wu,Z.methods=te,Z.object=Nr,Z.select=Dr,Z.tail=Sr,Z.unique=Ur,_e(Z,Tt({},Z)),Z.attempt=ve,Z.camelCase=Ou,Z.capitalize=function(n){return null==n?"":(n=Re(n),n.charAt(0).toUpperCase()+n.slice(1))
},Z.clone=function(n,t,r,e){var u=typeof t;return"boolean"!=u&&null!=t&&(e=r,r=t,t=false,"number"!=u&&"string"!=u||!e||e[r]!==n||(r=null)),r=typeof r=="function"&&Ut(r,e,1),Wt(n,t,r)},Z.cloneDeep=function(n,t,r){return t=typeof t=="function"&&Ut(t,r,1),Wt(n,true,t)},Z.contains=$r,Z.endsWith=function(n,t,r){n=null==n?"":Re(n),t=Re(t);var e=n.length;return r=(typeof r=="undefined"?e:fu(0>r?0:+r||0,e))-t.length,0<=r&&n.indexOf(t,r)==r},Z.escape=function(n){return n=null==n?"":Re(n),N.lastIndex=0,N.test(n)?n.replace(N,p):n
},Z.escapeRegExp=se,Z.every=Br,Z.find=Mr,Z.findIndex=Or,Z.findKey=function(n,t,r){return t=dr(t,r,3),Pt(n,t,Jt,true)},Z.findLast=function(n,t,r){return t=dr(t,r,3),Pt(n,t,Mt)},Z.findLastIndex=function(n,t,r){var e=n?n.length:0;for(t=dr(t,r,3);e--;)if(t(n[e],e,n))return e;return-1},Z.findLastKey=function(n,t,r){return t=dr(t,r,3),Pt(n,t,Xt,true)},Z.findWhere=function(n,t){return Mr(n,me(t))},Z.first=kr,Z.has=function(n,t){return n?Ke.call(n,t):false},Z.identity=de,Z.indexOf=Rr,Z.isArguments=re,Z.isArray=ju,Z.isBoolean=function(n){return true===n||false===n||n&&typeof n=="object"&&Le.call(n)==tt||false
},Z.isDate=function(n){return n&&typeof n=="object"&&Le.call(n)==rt||false},Z.isElement=ee,Z.isEmpty=function(n){if(null==n)return true;var t=n.length;return typeof t=="number"&&-1<t&&t<=R&&(ju(n)||ce(n)||re(n)||typeof n=="object"&&oe(n.splice))?!t:!Eu(n).length},Z.isEqual=function(n,t,r,e){return r=typeof r=="function"&&Ut(r,e,3),!r&&jr(n)&&jr(t)?n===t:Ht(n,t,r)},Z.isError=ue,Z.isFinite=Au,Z.isFunction=oe,Z.isNaN=function(n){return fe(n)&&n!=+n},Z.isNull=function(n){return null===n},Z.isNumber=fe,Z.isObject=ie,Z.isPlainObject=xu,Z.isRegExp=ae,Z.isString=ce,Z.isUndefined=function(n){return typeof n=="undefined"
},Z.kebabCase=ku,Z.last=function(n){var t=n?n.length:0;return t?n[t-1]:d},Z.lastIndexOf=function(n,t,r){var e=n?n.length:0,u=e;if(typeof r=="number")u=(0>r?iu(u+r,0):fu(r||0,u-1))+1;else if(r)return u=Tr(n,t)-1,e&&n[u]===t?u:-1;for(;u--;)if(n[u]===t)return u;return-1},Z.max=Zr,Z.min=function(n,t,r){var e=1/0,o=e,i=typeof t;"number"!=i&&"string"!=i||!r||r[t]!==n||(t=null);var i=null==t,f=!(i&&ju(n))&&ce(n);if(i&&!f)for(r=-1,n=Ir(n),i=n.length;++r<i;)f=n[r],f<o&&(o=f);else t=i&&f?u:dr(t,r,3),Dt(n,function(n,r,u){r=t(n,r,u),(r<e||1/0===r&&r===o)&&(e=r,o=n)
});return o},Z.noConflict=function(){return l._=Ne,this},Z.noop=function(){},Z.now=Su,Z.pad=function(n,t,r){n=null==n?"":Re(n),t=+t;var e=n.length;return e<t&&uu(t)?(e=(t-e)/2,t=Pe(e),e=Me(e),r=gr("",e,r),r.slice(0,t)+n+r):n},Z.padLeft=function(n,t,r){return n=null==n?"":Re(n),gr(n,t,r)+n},Z.padRight=function(n,t,r){return n=null==n?"":Re(n),n+gr(n,t,r)},Z.parseInt=Cu,Z.random=function(n,t,r){var e=null==n,u=null==t;return null==r&&(u&&typeof n=="boolean"?(r=n,n=1):typeof t=="boolean"&&(r=t,u=true)),e&&u&&(t=1,u=false),n=+n||0,u?(t=n,n=0):t=+t||0,r||n%1||t%1?(r=pu(),fu(n+r*(t-n+parseFloat("1e-"+(Re(r).length-1))),t)):ur(n,t)
},Z.reduce=Vr,Z.reduceRight=Yr,Z.repeat=he,Z.result=function(n,t,r){var e=null==n?d:n[t];return typeof e=="undefined"?r:oe(e)?n[t]():e},Z.runInContext=y,Z.size=function(n){var t=n?n.length:0;return typeof t=="number"&&-1<t&&t<=R?t:Eu(n).length},Z.snakeCase=Ru,Z.some=Xr,Z.sortedIndex=Fr,Z.sortedLastIndex=Tr,Z.startsWith=function(n,t,r){return n=null==n?"":Re(n),r=typeof r=="undefined"?0:fu(0>r?0:+r||0,n.length),n.lastIndexOf(t,r)==r},Z.template=function(n,t){var r=Z.templateSettings;t=wu({},t,r,Ft),n=Re(null==n?"":n);
	var e,u,r=wu({},t.imports,r.imports,Ft),o=Eu(r),i=pe(r),f=0,r=t.interpolate||K,a="__p+='",r=ke((t.escape||K).source+"|"+r.source+"|"+(r===B?D:K).source+"|"+(t.evaluate||K).source+"|$","g");if(n.replace(r,function(t,r,o,i,c,l){return o||(o=i),a+=n.slice(f,l).replace(J,s),r&&(e=true,a+="'+__e("+r+")+'"),c&&(u=true,a+="';"+c+";\n__p+='"),o&&(a+="'+((__t=("+o+"))==null?'':__t)+'"),f=l+t.length,t}),a+="';",(r=t.variable)||(a="with(obj){"+a+"}"),a=(u?a.replace(F,""):a).replace(T,"$1").replace(U,"$1;"),a="function("+(r||"obj")+"){"+(r?"":"obj||(obj={});")+"var __t,__p=''"+(e?",__e=_.escape":"")+(u?",__j=Array.prototype.join;function print(){__p+=__j.call(arguments,'')}":";")+a+"return __p}",r=ve(function(){return xe(o,"return "+a).apply(d,i)
	}),r.source=a,ue(r))throw r;return r},Z.trim=ge,Z.trimLeft=function(n,t){return(n=null==n?"":Re(n))?null==t?n.slice(h(n)):(t=Re(t),n.slice(o(n,t))):n},Z.trimRight=function(n,t){return(n=null==n?"":Re(n))?null==t?n.slice(0,g(n)+1):(t=Re(t),n.slice(0,i(n,t)+1)):n},Z.trunc=function(n,t){var r=30,e="...";if(ie(t))var u="separator"in t?t.separator:u,r="length"in t?+t.length||0:r,e="omission"in t?Re(t.omission):e;else null!=t&&(r=+t||0);if(n=null==n?"":Re(n),r>=n.length)return n;var o=r-e.length;if(1>o)return e;
	if(r=n.slice(0,o),null==u)return r+e;if(ae(u)){if(n.slice(o).search(u)){var i,f,a=n.slice(0,o);for(u.global||(u=ke(u.source,(M.exec(u)||"")+"g")),u.lastIndex=0;i=u.exec(a);)f=i.index;r=r.slice(0,null==f?o:f)}}else n.indexOf(u,o)!=o&&(u=r.lastIndexOf(u),-1<u&&(r=r.slice(0,u)));return r+e},Z.unescape=function(n){return n=null==n?"":Re(n),W.lastIndex=0,W.test(n)?n.replace(W,v):n},Z.uniqueId=function(n){var t=++S;return Re(null==n?"":n)+t},Z.all=Br,Z.any=Xr,Z.detect=Mr,Z.foldl=Vr,Z.foldr=Yr,Z.head=kr,Z.include=$r,Z.inject=Vr,_e(Z,function(){var n={};
	return Jt(Z,function(t,r){Z.prototype[r]||(n[r]=t)}),n}(),false),Z.sample=function(n,t,r){n=Ir(n);var e=n.length;return null==t||r?0<e?n[ur(0,e-1)]:d:(n=Jr(n),n.length=fu(0>t?0:+t||0,n.length),n)},Jt(Z,function(n,t){var r="sample"!=t;Z.prototype[t]||(Z.prototype[t]=function(t,e){var u=this.__chain__,o=n(this.__wrapped__,t,e);return u||null!=t&&(!e||r&&typeof t=="function")?new X(o,u):o})}),Z.VERSION=m,Z.prototype.chain=function(){return this.__chain__=true,this},Z.prototype.toJSON=Lr,Z.prototype.toString=function(){return Re(this.__wrapped__)
},Z.prototype.value=Lr,Z.prototype.valueOf=Lr,jt(["join","pop","shift"],function(n){var t=Ce[n];Z.prototype[n]=function(){var n=this.__chain__,r=t.apply(this.__wrapped__,arguments);return n?new X(r,n):r}}),jt(["push","reverse","sort","unshift"],function(n){var t=Ce[n];Z.prototype[n]=function(){return t.apply(this.__wrapped__,arguments),this}}),jt(["concat","splice"],function(n){var t=Ce[n];Z.prototype[n]=function(){return new X(t.apply(this.__wrapped__,arguments),this.__chain__)}}),Z}var d,m="3.0.0-pre",_=1,b=2,w=4,j=8,A=16,x=32,E=64,I="__lodash@"+m+"__",O="Expected a function",k=Math.pow(2,32)-1,R=Math.pow(2,53)-1,S=0,C=/^[A-Z]+$/,F=/\b__p\+='';/g,T=/\b(__p\+=)''\+/g,U=/(__e\(.*?\)|\b__t\))\+'';/g,W=/&(?:amp|lt|gt|quot|#39|#96);/g,N=/[&<>"'`]/g,L=/<%-([\s\S]+?)%>/g,$=/<%([\s\S]+?)%>/g,B=/<%=([\s\S]+?)%>/g,D=/\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g,M=/\w*$/,z=/^\s*function[ \n\r\t]+\w/,q=/^0[xX]/,P=/^\[object .+?Constructor\]$/,Z=/[\xC0-\xFF]/g,K=/($^)/,V=/[.*+?^()|[\]\/\\]/g,Y=/\bthis\b/,J=/['\n\r\u2028\u2029\\]/g,X=/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g,G=" \t\x0B\f\xa0\ufeff\n\r\u2028\u2029\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000",H="Array ArrayBuffer Date Error Float32Array Float64Array Function Int8Array Int16Array Int32Array Math Number Object RegExp Set String _ clearTimeout document isFinite parseInt setTimeout TypeError Uint8Array Uint8ClampedArray Uint16Array Uint32Array window WinRTError".split(" "),Q="[object Arguments]",nt="[object Array]",tt="[object Boolean]",rt="[object Date]",et="[object Error]",ut="[object Number]",ot="[object Object]",it="[object RegExp]",ft="[object String]",at="[object ArrayBuffer]",ct="[object Float32Array]",lt="[object Float64Array]",pt="[object Int8Array]",st="[object Int16Array]",ht="[object Int32Array]",gt="[object Uint8Array]",vt="[object Uint8ClampedArray]",yt="[object Uint16Array]",dt="[object Uint32Array]",mt={};
	mt[Q]=mt[nt]=mt[ct]=mt[lt]=mt[pt]=mt[st]=mt[ht]=mt[gt]=mt[vt]=mt[yt]=mt[dt]=true,mt[at]=mt[tt]=mt[rt]=mt[et]=mt["[object Function]"]=mt["[object Map]"]=mt[ut]=mt[ot]=mt[it]=mt["[object Set]"]=mt[ft]=mt["[object WeakMap]"]=false;var _t={};_t[Q]=_t[nt]=_t[at]=_t[tt]=_t[rt]=_t[ct]=_t[lt]=_t[pt]=_t[st]=_t[ht]=_t[ut]=_t[ot]=_t[it]=_t[ft]=_t[gt]=_t[vt]=_t[yt]=_t[dt]=true,_t[et]=_t["[object Function]"]=_t["[object Map]"]=_t["[object Set]"]=_t["[object WeakMap]"]=false;var bt={leading:false,maxWait:0,trailing:false},wt={configurable:false,enumerable:false,value:null,writable:false},jt={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","`":"&#96;"},At={"&amp;":"&","&lt;":"<","&gt;":">","&quot;":'"',"&#39;":"'","&#96;":"`"},xt={"\xc0":"A","\xc1":"A","\xc2":"A","\xc3":"A","\xc4":"A","\xc5":"A","\xe0":"a","\xe1":"a","\xe2":"a","\xe3":"a","\xe4":"a","\xe5":"a","\xc7":"C","\xe7":"c","\xd0":"D","\xf0":"d","\xc8":"E","\xc9":"E","\xca":"E","\xcb":"E","\xe8":"e","\xe9":"e","\xea":"e","\xeb":"e","\xcc":"I","\xcd":"I","\xce":"I","\xcf":"I","\xec":"i","\xed":"i","\xee":"i","\xef":"i","\xd1":"N","\xf1":"n","\xd2":"O","\xd3":"O","\xd4":"O","\xd5":"O","\xd6":"O","\xd8":"O","\xf2":"o","\xf3":"o","\xf4":"o","\xf5":"o","\xf6":"o","\xf8":"o","\xd9":"U","\xda":"U","\xdb":"U","\xdc":"U","\xf9":"u","\xfa":"u","\xfb":"u","\xfc":"u","\xdd":"Y","\xfd":"y","\xff":"y","\xc6":"AE","\xe6":"ae","\xde":"Th","\xfe":"th","\xdf":"ss","\xd7":" ","\xf7":" "},Et={"function":true,object:true},It={"\\":"\\","'":"'","\n":"n","\r":"r","\u2028":"u2028","\u2029":"u2029"},Ot=Et[typeof window]&&window||this,kt=Et[typeof exports]&&exports&&!exports.nodeType&&exports,Et=Et[typeof module]&&module&&!module.nodeType&&module,Rt=kt&&Et&&typeof global=="object"&&global;
	!Rt||Rt.global!==Rt&&Rt.window!==Rt&&Rt.self!==Rt||(Ot=Rt);var Rt=Et&&Et.exports===kt&&kt,St=y();typeof define=="function"&&typeof define.amd=="object"&&define.amd?(Ot._=St, define(function(){return St})):kt&&Et?Rt?(Et.exports=St)._=St:kt._=St:Ot._=St}).call(this);
;
