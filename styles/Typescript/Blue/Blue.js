// ------------------------------------------------------
//    Copyright (C) 2016 Viki Solutions Inc.
// 
//    www.vikisolutions.com
//    
//    Reproduction or disclosure of this file
//    or its contents without the prior written 
//    consent of Viki Solutions Inc. is prohibited.
// ------------------------------------------------------
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
// initialized in BlueWorld.aspx.cs
var kLicensedFeatures_VeraWorkflow;
var kLicensedFeatures_BlueWorkflow;
var kLicensedFeatures_VeraWorkflowAssetLibrary;
var kLicensedFeatures_EnableCopyManagement;
var kLoginUrl;
var Blue = (function (_super) {
    __extends(Blue, _super);
    // ------------------------------------------------------ 
    function Blue(useSSLForBlue, useSSLForViki, vikiSessionId, accountNumber, apiJobId, customerId, configId, divId, blueSocketUrl, restFullAPIServiceURL, showClientLogs, licensedFeatures) {
        _super.call(this, useSSLForBlue, useSSLForViki, vikiSessionId, accountNumber, customerId, configId, divId, restFullAPIServiceURL, showClientLogs, licensedFeatures);
        this.m_BlueAdminAddress = null;
        this.m_BlueReportsAddress = null;
        this.m_AuthorizeApprovalSsoUrl = null;
        this.m_AuthorizeApprovalSsoTargetResource = null;
        this.m_SsoLogin = null;
        this.m_BlueUrlBase = null;
        this.m_BlueSocketUrl = null;
        this.m_JobFiles = null;
        wvAppBase.m_PageUrlBase = "/VproofWorkflow/Pages/App/BlueWorld.aspx/"; // See issue:ApplicationUrl 
        this.m_BrokenConnections = {};
        if (blueSocketUrl) {
            this.m_BlueSocketUrl = blueSocketUrl;
            BlueAppBase.Data.ApiJobId = apiJobId;
            Blue.loadIconImages();
        }
        else {
            console.error("Blue.ts requires a Message Manager Socket URL be supplied as a parameter.");
            return;
        }
        if (window["BlueApp"]) {
            console.error("Creating a new BlueAppBase when another already exists");
        }
        window["BlueApp"] = this; // intentionally work hard to get around the "const" declaration.
    }
    Object.defineProperty(Blue.prototype, "BlueAdminAddress", {
        set: function (value) {
            this.m_BlueAdminAddress = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Blue.prototype, "BlueReportsAddress", {
        set: function (value) {
            this.m_BlueReportsAddress = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Blue.prototype, "BlueUrlBase", {
        get: function () {
            return this.m_BlueUrlBase;
        },
        set: function (value) {
            this.m_BlueUrlBase = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Blue.prototype, "AuthorizeApprovalSsoUrl", {
        get: function () {
            return this.m_AuthorizeApprovalSsoUrl;
        },
        set: function (value) {
            this.m_AuthorizeApprovalSsoUrl = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Blue.prototype, "AuthorizeApprovalSsoTargetResource", {
        get: function () {
            return this.m_AuthorizeApprovalSsoTargetResource;
        },
        set: function (value) {
            this.m_AuthorizeApprovalSsoTargetResource = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Blue.prototype, "SsoLogin", {
        get: function () {
            return this.m_SsoLogin;
        },
        set: function (value) {
            this.m_SsoLogin = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Blue.prototype, "LoginUrl", {
        get: function () {
            var url = kLoginUrl;
            var historyurl = this.historyState(url);
            var ssoLogin = this.SsoLogin;
            if (ssoLogin) {
                url = ssoLogin;
                historyurl = this.historyState(url);
                historyurl = encodeURIComponent(historyurl);
            }
            return url + historyurl;
        },
        enumerable: true,
        configurable: true
    });
    Blue.prototype.historyState = function (url) {
        var result = "";
        if (history.state) {
            if (url.indexOf('?') > 0) {
                result = "&";
            }
            else {
                result = "?";
            }
            result += "SessionTimeout=True&RedirectPage=" + history.state._Url;
        }
        return result;
    };
    Object.defineProperty(Blue.prototype, "Header", {
        get: function () {
            return this.m_Header;
        },
        enumerable: true,
        configurable: true
    });
    // ------------------------------------------------------ 
    Blue.prototype.getRESTfulAPICallerInstance = function (restfulServicesUrl) {
        var result;
        if (this.LicensedFeatures[kLicensedFeatures_BlueWorkflow]) {
            var blueUserId = BlueAppBase.LoggedInBlueUserId;
            var blueSessionId = BlueAppBase.Data.VikiSession.BlueSessionObject.SessionId;
            result = new wuRESTfulAPICaller(restfulServicesUrl, blueSessionId, blueUserId);
        }
        else {
            result = _super.prototype.getRESTfulAPICallerInstance.call(this, restfulServicesUrl);
        }
        return result;
    };
    // ------------------------------------------------------ 
    Blue.prototype.createMessageManagers = function () {
        if (this.LicensedFeatures[kLicensedFeatures_BlueWorkflow]) {
            var userId = BlueAppBase.LoggedInBlueUserId;
            var sessionId = BlueAppBase.Data ? BlueAppBase.Data.VikiSession.BlueSessionObject.SessionId : null;
            this.m_MessageManagerBlue = new wcBlueMessageManager(this, this.m_BlueSocketUrl, userId, sessionId);
        }
        else {
            _super.prototype.createMessageManagers.call(this);
        }
    };
    Blue.prototype.populateCustomFieldDefinitions = function (onDone) {
        if (onDone === void 0) { onDone = null; }
        this.m_MessageManagerBlue.CoreMessageHandler.sendWorkspaceCustomFieldsDefinitionsRequest(function (body) {
            var customFieldDefinitions = wuFunctions.blueJSONParse(body);
            BlueAppBase.Data.CustomFieldDefinitions = customFieldDefinitions;
            // if nothing is selected then select the first three
            if (customFieldDefinitions) {
                var count = 0;
                var selectedCustomFieldDefinitions = [];
                while (count < 3 && count < customFieldDefinitions.length) {
                    selectedCustomFieldDefinitions.push(customFieldDefinitions[count]);
                    count++;
                }
                if (selectedCustomFieldDefinitions.length > 0) {
                    if (!BlueAppBase.Data.UserPreferences.ProjectViewCustomFields) {
                        BlueAppBase.Data.UserPreferences.ProjectViewCustomFields = selectedCustomFieldDefinitions;
                    }
                    if (!BlueAppBase.Data.UserPreferences.TaskViewCustomFields) {
                        BlueAppBase.Data.UserPreferences.TaskViewCustomFields = selectedCustomFieldDefinitions;
                    }
                    if (!BlueAppBase.Data.UserPreferences.AssetViewCustomFields) {
                        BlueAppBase.Data.UserPreferences.AssetViewCustomFields = selectedCustomFieldDefinitions;
                    }
                }
            }
            if (onDone) {
                onDone();
            }
        });
    };
    // ------------------------------------------------------ 
    // IConnectionHandler implementation
    Blue.prototype.onInitialConnect = function () {
        this.m_SocketOpen = true;
        this.getFileUploadLimits();
        this.populateCustomFieldDefinitions();
        // call layout now that the server communication channel is open
        if (!wvAppBase.um_Content) {
            _super.prototype.layout.call(this); // we need the ui elements built so we can display error messages
        }
    };
    // ------------------------------------------------------ 
    Blue.prototype.connectionLost = function (url, retryTimeout) {
        if (!wvAppBase.um_Content) {
            _super.prototype.layout.call(this); // we need the ui elements built so we can display error messages
        }
        this.m_BrokenConnections[url] = retryTimeout / 1000;
        var message = "";
        for (var idx = 0; idx < Object.keys(this.m_BrokenConnections).length; idx++) {
            if (message !== "") {
                message += " ";
            }
            var connectionUrl = Object.keys(this.m_BrokenConnections)[idx];
            // extract server name
            var a = document.createElement('a');
            a.href = connectionUrl;
            //a.host - server and port
            //let rexp:RegExp = new RegExp( "/^ws+\/\/(.*)\/.*/" );
            //let matches = rexp.exec( connectionUrl );
            var serverName = connectionUrl;
            if (a.host) {
                serverName = a.host;
            }
            message += wuFunctions.getLangString("ConnectionToServerLost").replace("{0}", serverName);
            //"Connection to server " + serverName + " was lost."
            var seconds = this.m_BrokenConnections[connectionUrl];
            if (seconds <= 0) {
                message += " " + wuFunctions.getLangString("RetryingWithElipsis");
            }
            else {
                message += " " + wuFunctions.getLangString("RetryingInNSeconds").replace("{0}", seconds.toString());
            }
        }
        if (message.length > 0) {
            BlueAppBase.showErrorMessageBar(message);
        }
    };
    // ------------------------------------------------------ 
    Blue.prototype.connectionRestored = function (url) {
        console.log("Connection restored to: " + url);
        if (this.m_BrokenConnections[url] != null) {
            delete this.m_BrokenConnections[url];
        }
        if (Object.keys(this.m_BrokenConnections).length <= 0) {
            BlueAppBase.hideErrorMessageBar();
        }
    };
    // ------------------------------------------------------ 
    Blue.prototype.getVikiServerMessageManager = function () {
        return new BlueMessageHandlers.wcBlueVikiServerMessageHandler();
    };
    // ------------------------------------------------------ createPageContent
    Blue.prototype.createPageContent = function () {
        this.m_SideMenu = new wvBlueSideMenu(this.m_PageContent);
        this.m_HelpMenu = new wvBlueHelpMenu(this.m_PageContent);
        this.m_Header = new wvBlueHeader(this.m_PageContent);
        this.m_Header.showOutOfOfficeAlertDialogIfApplicable();
        this.m_Header.Container.onclick = this.detectClick.bind(this);
        this.createContentPane();
        if (this.m_SideMenu.Pinned) {
            this.m_SideMenu.show(false, null);
        }
        else {
            this.m_SideMenu.hide();
        }
        if (this.m_HelpMenu.Pinned) {
            this.m_HelpMenu.show(false, null);
        }
        else {
            this.m_HelpMenu.hide();
        }
    };
    // ------------------------------------------------------ setView
    Blue.prototype.setView = function (type, id, filter, filterId, navData) {
        var _this = this;
        console.group("Setting view");
        kHistoryRespondingToUrl = true;
        try {
            console.log("Setting view. type: " + type + " id: " + id + " filter: " + filter + " filterId: " + filterId);
            switch (type) {
                case kPathPart_Page:
                    //console.debug( "showing page:" + id );
                    wvPage.showPage(id, filter, navData);
                    break;
                case Blue.kPathPart_Projects:
                    this.m_SideMenu.setSelectedMenuItem(kSideMenuItem_Jobs);
                    var list = wvBlueProjects.getInstance();
                    this.m_ContentPane.setContent(list);
                    if (id) {
                        list.setView(id, filter);
                    }
                    break;
                case Blue.kPathPart_Project:
                    // => captures the value of 'this' now, not at runtime
                    var postGetProjectOwner = function (data, contextData) {
                        var projectId = parseInt(id);
                        var result = BlueAppBase.Data.isProjectOrSecondaryProjectOwner(projectId);
                        var isProjectOwner = result[0];
                        var isSecondaryProjectOwner = result[1];
                        var userIsAllowedIn = isProjectOwner || isSecondaryProjectOwner || _this.Data.ScheduleNavigation;
                        if (userIsAllowedIn) {
                            _this.navigateToProjectOrComponent(id, filter, filterId);
                        }
                        else {
                            // Check other types of access
                            var postGetProjectComponentsForUser = function (response, projectId) {
                                var allowedIn = response.HasCompleteProjectAccess || response.IsPrimaryOrSecondaryRootTaskOwner;
                                if (!allowedIn && filterId != undefined && (filter == kProjectTab_References || filter == kProjectTab_Tasks)) {
                                    // Check if the user has access to this component
                                    var component;
                                    for (var _i = 0, _a = response.ProjectComponents; _i < _a.length; _i++) {
                                        component = _a[_i];
                                        if (component.Id == filterId) {
                                            allowedIn = true;
                                            break;
                                        }
                                    }
                                }
                                if (allowedIn) {
                                    _this.navigateToProjectOrComponent(id, filter, filterId);
                                }
                                else {
                                    wvAppBase.RedirectToPageUrlBase();
                                }
                                return false;
                            };
                            var data_1 = { "ProjectId": id, "UserId": BlueAppBase.LoggedInBlueUserId };
                            var pcCallback = new wuCallback(postGetProjectComponentsForUser, id);
                            pcCallback.onlyTriggerOnce = true;
                            BlueAppBase.MessageManagerBlue.sendMessage(kBlueDestination_ProjectComponentsForUser, data_1, pcCallback);
                        }
                        return false;
                    };
                    var callback = new wuCallback(postGetProjectOwner);
                    callback.onlyTriggerOnce = true;
                    this.Data.getProjectOwners(parseInt(id), callback);
                    break;
                case kPathPart_Jobs:
                    this.showJobs();
                    if (id) {
                        wmContextData.JobId = id;
                        this.showJobFiles(false);
                    }
                    break;
                case kPathPart_Job:
                    // Show the job list and then the job details
                    this.showJobs();
                    wmContextData.JobId = id;
                    if (filter == kPathPart_Assets) {
                        this.showJobFiles(true, 1 /* Asset */);
                    }
                    else if (filter == kPathPart_Vproof) {
                        this.showJobFiles(true, 2 /* Static */, true);
                    }
                    else {
                        this.showJobFiles(true);
                    }
                    break;
                case kPathPart_Tasks:
                    this.m_SideMenu.setSelectedMenuItem(kSideMenuItem_Tasks);
                    if (this.LicensedFeatures[kLicensedFeatures_BlueWorkflow]) {
                        //console.log( "setting main content to wvBlueTasks" );
                        var taskList = wvBlueTasks.getInstance();
                        this.m_ContentPane.setContent(taskList);
                        if (id) {
                            taskList.setView(id, filter);
                        }
                    }
                    else {
                        var taskList = new wvTasks();
                        if (filter == kPathPart_Vproof) {
                            taskList.setToAutoLaunchVproof(id);
                        }
                        this.m_ContentPane.setContent(taskList);
                    }
                    break;
                case kPathPart_Task:
                    if (id) {
                        console.log("viewing task: %s full screen", id);
                        this.m_SideMenu.setSelectedMenuItem(kSideMenuItem_Tasks);
                        this.viewTask(true, id, "");
                    }
                    else {
                        // Sometimes we get undefined for the task id. In this case, just go to Tasks
                        this.m_SideMenu.setSelectedMenuItem(kSideMenuItem_Tasks);
                        if (this.LicensedFeatures[kLicensedFeatures_BlueWorkflow]) {
                            //console.log( "setting main content to wvBlueTasks" );
                            var taskList = wvBlueTasks.getInstance();
                            this.m_ContentPane.setContent(taskList);
                        }
                        else {
                            var taskList = new wvTasks();
                            this.m_ContentPane.setContent(taskList);
                        }
                    }
                    break;
                case kPathPart_Workflows:
                    this.viewWorkflows();
                    break;
                case kPathPart_Library:
                    this.viewLibrary(id);
                    break;
                case kPathPart_LibraryFolder:
                    this.viewLibrary(id);
                    break;
                case kPathPart_Asset:
                    this.viewAssetInLibrary(id);
                    break;
                case kPathPart_Assets:
                    this.viewLibrary(id);
                    break;
                case kPathPart_AssetFolder:
                    this.viewAssetInLibrary(id);
                    break;
                case Blue.kPathPart_Admin:
                    this.viewBlueAdmin();
                    break;
                case Blue.kPathPart_Reports:
                    this.viewBlueReports();
                    break;
                case kPathPart_Users:
                    this.viewUsers();
                    break;
                case Blue.kPathPart_SiteConfiguration:
                    this.viewSiteConfiguration();
                    break;
                default:
                    this.viewDefaultPage();
                    break;
            }
        }
        finally {
            console.groupEnd();
        }
        kHistoryRespondingToUrl = false;
    };
    // ------------------------------------------------------
    Blue.prototype.navigateToProjectOrComponent = function (projectId, filter, filterId, channel) {
        if (channel === void 0) { channel = null; }
        wmContextData.JobId = projectId;
        if (this.Data.ProjectsListAccess) {
            this.m_SideMenu.setSelectedMenuItem(kSideMenuItem_Jobs);
            this.m_ContentPane.setContent(wvBlueProjects.getInstance());
        }
        else if (this.Data.TasksListAccess) {
            this.m_SideMenu.setSelectedMenuItem(kSideMenuItem_Tasks);
            this.m_ContentPane.setContent(wvBlueTasks.getInstance());
        }
        else {
            this.m_SideMenu.setSelectedMenuItem(kSideMenuItem_Library);
            this.m_ContentPane.setContent(new wvBlueAssetLibrary());
        }
        // does security checks internally
        this.setChildPaneForProject(projectId, filter, filterId, true, channel);
    };
    Blue.filterStringToProjecTabPage = function (projectId, filter, filterId, fullScreen, channel) {
        if (channel === void 0) { channel = null; }
        var content;
        switch (filter) {
            case kProjectTab_Tasks:
                var projectTasks = wvBlueProjectTasks.getInstance(projectId, fullScreen, channel);
                projectTasks.setFilteredSubprocessId(filterId);
                content = projectTasks;
                break;
            case kProjectTab_Calendar:
                if (BlueAppBase.Data.isProjectOwner(parseInt(projectId)) || BlueAppBase.Data.ScheduleNavigation) {
                    content = wvBlueProjectCalendar.getInstance(projectId, fullScreen);
                }
                break;
            case kProjectTab_References:
                var taskReferences = wvBlueProjectReferences.getInstance(projectId, fullScreen);
                taskReferences.setFilteredSubprocessId(filterId);
                content = taskReferences;
                break;
            case kProjectTab_History:
                if (BlueAppBase.Data.isProjectOwner(parseInt(projectId)) || BlueAppBase.Data.ScheduleNavigation) {
                    content = wvBlueProjectHistory.getInstance(projectId, fullScreen);
                }
                break;
            case kProjectTab_Assignments:
                if (BlueAppBase.Data.isProjectOwner(parseInt(projectId))) {
                    content = wvBlueProjectAssignments.getInstance(projectId, fullScreen);
                }
                break;
            default:
                content = wvBlueProjectTasks.getInstance(projectId, fullScreen, channel);
                break;
        }
        return content;
    };
    // ------------------------------------------------------ setChildPaneForProject
    Blue.prototype.setChildPaneForProject = function (id, filter, filterId, fullScreen, channel) {
        if (fullScreen === void 0) { fullScreen = false; }
        if (channel === void 0) { channel = null; }
        console.log("setChildPaneForProject id:" + id + " filter:" + filter);
        var content = Blue.filterStringToProjecTabPage(id, filter, filterId, fullScreen, channel);
        this.m_ContentPane.setChild(content, fullScreen);
    };
    // ------------------------------------------------------ 
    Blue.prototype.showJobs = function () {
        console.log("showJobs");
        this.m_ContentPane.setContent(new wvJobsList(2 /* Static */));
    };
    // ------------------------------------------------------ 
    Blue.prototype.showJobFiles = function (fullScreen, productType, launchVproof, channel) {
        if (productType === void 0) { productType = 2 /* Static */; }
        if (launchVproof === void 0) { launchVproof = false; }
        if (channel === void 0) { channel = null; }
        console.log("showJobFiles");
        wmContextData.Job = null;
        BlueAppBase.Data.UserJobRights = null;
        this.m_JobFiles = new wvJobFiles(false, channel);
        if (productType == 1 /* Asset */) {
            this.m_ContentPane.setContent(this.m_JobFiles);
        }
        else {
            this.m_ContentPane.setChild(this.m_JobFiles, fullScreen);
        }
        if (launchVproof) {
            this.m_JobFiles.launchVproof();
        }
    };
    // ------------------------------------------------------ viewDefaultPage
    Blue.prototype.viewDefaultPage = function () {
        this.m_SideMenu.viewDefaultPage();
    };
    // ------------------------------------------------------ viewProjects
    Blue.prototype.viewProjects = function () {
        console.log("viewProjects");
        this.m_SideMenu.setSelectedMenuItem(kSideMenuItem_Jobs);
        _super.prototype.viewProjects.call(this);
        if ((this.LicensedFeatures[kLicensedFeatures_VeraWorkflow]
            && this.LicensedFeatures[kLicensedFeatures_BlueWorkflow])
            || this.LicensedFeatures[kLicensedFeatures_BlueWorkflow]) {
            this.m_ContentPane.setContent(wvBlueProjects.getInstance());
        }
        else if (this.LicensedFeatures[kLicensedFeatures_VeraWorkflow]) {
            this.showJobs();
        }
    };
    // ------------------------------------------------------ viewProject
    Blue.prototype.viewProject = function (viewInFullScreen, projectId, channel) {
        var _this = this;
        if (channel === void 0) { channel = null; }
        console.log("viewProject id:" + projectId);
        this.m_SideMenu.setSelectedMenuItem(kSideMenuItem_Jobs);
        //open project Details in sub content pane
        wmContextData.JobId = projectId;
        // => captures the value of this now, not at runtime
        var postGetProjectOwner = function (data, contextData) {
            var projectTasksPage = wvBlueProjectTasks.getInstance(projectId, viewInFullScreen, channel);
            if (projectTasksPage.getFilteredSubprocessId()) {
                projectTasksPage.setFilteredSubprocessId(undefined);
            }
            _this.m_ContentPane.setChild(projectTasksPage, viewInFullScreen);
            if (viewInFullScreen || wuFunctions.isSmallDevice()) {
                _this.m_ContentPane.Child.maximize();
            }
            else {
                _this.m_ContentPane.Child.minimize();
            }
            return false; // unsubscribe callback
        };
        var callback = new wuCallback(postGetProjectOwner);
        callback.onlyTriggerOnce = true;
        BlueAppBase.Data.getProjectOwners(parseInt(projectId), callback);
    };
    // ------------------------------------------------------ viewProjectComponent
    Blue.prototype.viewProjectComponent = function (viewInFullScreen, projectId, componentId, channel) {
        var _this = this;
        if (channel === void 0) { channel = null; }
        console.log("viewProjectComponent projectId: " + projectId + " taskId: " + componentId);
        this.m_SideMenu.setSelectedMenuItem(kSideMenuItem_Jobs);
        //open project Details in sub content pane
        wmContextData.JobId = projectId;
        // => captures the value of this now, not at runtime
        var postGetProjectOwner = function (data, contextData) {
            var projectTasksPage = wvBlueProjectTasks.getInstance(projectId, viewInFullScreen, channel);
            projectTasksPage.setFilteredSubprocessId(componentId);
            _this.m_ContentPane.setChild(projectTasksPage, viewInFullScreen);
            if (viewInFullScreen || wuFunctions.isSmallDevice()) {
                _this.m_ContentPane.Child.maximize();
            }
            else {
                _this.m_ContentPane.Child.minimize();
            }
            return false; // unsubscribe callback
        };
        var callback = new wuCallback(postGetProjectOwner);
        callback.onlyTriggerOnce = true;
        BlueAppBase.Data.getProjectOwners(parseInt(projectId), callback);
    };
    // ------------------------------------------------------ viewBlueReports
    Blue.prototype.viewBlueReports = function () {
        if (this.SideMenu.UserAccess.Reports && BlueAppBase.LicensedFeatures[kLicensedFeatures_BlueWorkflow]) {
            console.log("viewBlueReports");
            this.m_SideMenu.setSelectedMenuItem(kSideMenuItem_Administration);
            var url = this.reportsUrl();
            wuFunctions.pushState(wuFunctions.getLangString("Reports"), url);
            this.m_ContentPane.setContent(new wvIFrameViewBase(this.m_BlueReportsAddress));
        }
        else {
            wvAppBase.RedirectToPageUrlBase();
        }
    };
    // ------------------------------------------------------ viewBlueAdmin
    Blue.prototype.viewBlueAdmin = function () {
        if (this.SideMenu.UserAccess.Advanced && BlueAppBase.LicensedFeatures[kLicensedFeatures_BlueWorkflow]) {
            console.log("viewBlueAdmin");
            this.m_SideMenu.setSelectedMenuItem(kSideMenuItem_Administration);
            var url = this.adminUrl();
            wuFunctions.pushState(wuFunctions.getLangString("Admin"), url);
            this.m_ContentPane.setContent(new wvIFrameViewBase(this.m_BlueAdminAddress));
        }
        else {
            wvAppBase.RedirectToPageUrlBase();
        }
    };
    // ------------------------------------------------------ viewSiteConfiguration
    Blue.prototype.viewSiteConfiguration = function () {
        this.m_SideMenu.setSelectedMenuItem(kSideMenuItem_SiteConfiguration);
        var url = this.brandingUrl(kConfigurationTab_Branding);
        wuFunctions.pushState(wuFunctions.getLangString("Branding"), url);
        this.m_ContentPane.setContent(wvSiteConfigurationBranding.getInstance());
    };
    // ------------------------------------------------------ viewTasks
    Blue.prototype.viewTasks = function (taskId) {
        if (taskId === void 0) { taskId = null; }
        console.log("viewTasks taskId:" + taskId);
        this.m_SideMenu.setSelectedMenuItem(kSideMenuItem_Tasks);
        _super.prototype.viewTasks.call(this, taskId);
        if (this.LicensedFeatures[kLicensedFeatures_BlueWorkflow]) {
            this.m_ContentPane.setContent(wvBlueTasks.getInstance());
        }
        else {
            this.m_ContentPane.setContent(new wvTasks());
        }
    };
    // ------------------------------------------------------ viewTask
    Blue.prototype.viewTask = function (viewInFullScreen, taskId, taskName) {
        var _this = this;
        console.log("viewTask taskId:" + taskId + " viewInFullScreen:" + viewInFullScreen);
        // Make sure we have the current Blue user info so we can check if the user is SSO.  We
        // need this when building the Vproof Launch Params
        if (BlueAppBase.Data.HaveBlueUser) {
            this.viewTaskDetails(viewInFullScreen, taskId, taskName, null);
        }
        else {
            // Get the Blue user and then view the task details
            var modelHandleUserDetails = function (userDetails) {
                // Now we can view the task
                _this.viewTaskDetails(viewInFullScreen, taskId, taskName, null);
                return false; // not an event.  Cancel callback
            };
            var config = {
                triggerContext: this,
                onTrigger: modelHandleUserDetails,
                onlyTriggerOnce: true,
            };
            var cb = new wuCallback(config);
            BlueAppBase.Data.getCurrentBlueUser(cb);
        }
    };
    // ------------------------------------------------------ viewTaskDetails
    Blue.prototype.viewTaskDetails = function (viewInFullScreen, taskId, taskName, taskList) {
        var _this = this;
        this.m_SideMenu.setSelectedMenuItem(kSideMenuItem_Tasks);
        this.m_ContentPane.setChild(new wvLoadingDetailsBase(), false);
        wvBlueTaskDetailsFactory.buildTaskDetailsObject(Number(taskId), taskList, function (taskDetails) {
            _this.m_ContentPane.setChild(taskDetails, viewInFullScreen);
        });
        // not sure if we need something like this here for task??
        //wcCallbackManager.getJobInfo( jobFileContentPane );
        _super.prototype.viewTask.call(this, viewInFullScreen, taskId, taskName);
    };
    // ------------------------------------------------------ viewLibrary
    Blue.prototype.viewLibrary = function (assetId) {
        if (assetId === void 0) { assetId = null; }
        this.m_SideMenu.setSelectedMenuItem(kSideMenuItem_Library);
        if (this.LicensedFeatures[kLicensedFeatures_BlueWorkflow]) {
            this.m_ContentPane.setContent(new wvBlueAssetLibrary());
            wuFunctions.pushState(wuFunctions.getLangString("library"), this.PageUrlBase + kPathPart_Library);
            if (assetId && Number(assetId)) {
                var blueAssetDetails = new wvBlueAssetDetails(Number(assetId), null);
                this.m_ContentPane.setChild(blueAssetDetails, false);
            }
        }
        else if (this.LicensedFeatures[kLicensedFeatures_VeraWorkflow]) {
            this.m_ContentPane.setContent(new wvJobsList(1 /* Asset */));
        }
    };
    // ------------------------------------------------------ viewAssetInLibrary
    Blue.prototype.viewAssetInLibrary = function (assetIdString) {
        this.m_SideMenu.setSelectedMenuItem(kSideMenuItem_Library);
        if (this.LicensedFeatures[kLicensedFeatures_BlueWorkflow]) {
            this.m_ContentPane.setContent(new wvBlueAssetLibrary());
            if (assetIdString) {
                var blueAssetDetails = new wvBlueAssetDetails(Number(assetIdString), null);
                this.m_ContentPane.setChild(blueAssetDetails, true);
            }
        }
        else if (this.LicensedFeatures[kLicensedFeatures_VeraWorkflow]) {
            this.m_ContentPane.setContent(new wvJobsList(1 /* Asset */));
        }
    };
    // ------------------------------------------------------ viewWorkflows
    Blue.prototype.viewWorkflows = function () {
        this.m_SideMenu.setSelectedMenuItem(kSideMenuItem_ProcessTemplates);
        wuFunctions.pushState(wuFunctions.getLangString("workflows"), this.PageUrlBase + kPathPart_Workflows);
        this.m_ContentPane.setContent(new wvProjectTemplate.ProjectTemplateList());
    };
    Blue.prototype.viewUsers = function () {
        this.m_SideMenu.setSelectedMenuItem(kSideMenuItem_Users);
        wuFunctions.pushState(wuFunctions.getLangString("users"), this.PageUrlBase + kPathPart_Users);
        if (this.LicensedFeatures[kLicensedFeatures_BlueWorkflow]) {
            var usersPage = wvUserMaintenance.wvUsers.getInstance();
            this.m_ContentPane.setContent(usersPage);
            usersPage.requestGroups();
        }
        else {
            this.m_ContentPane.setContent(new wvUsers());
        }
    };
    // ------------------------------------------------------ viewJob
    Blue.prototype.viewJob = function (viewInFullScreen, jobId, productType, channel) {
        if (productType === void 0) { productType = 2 /* Static */; }
        if (channel === void 0) { channel = null; }
        wmContextData.JobId = jobId;
        BlueAppBase.Data.JobFileSummaries = null;
        //open job files in sub content pane
        this.showJobFiles(viewInFullScreen, productType, false, channel);
    };
    //TODO: This code is largely a cut-and-paste of code in VproofWorkflow\TypeScript\Common\wView\wvViews\wvEditWorkflow.ts.  Refactor needed?
    Blue.loadIconImages = function () {
        if (Object.keys(Blue.m_IconImages).length > 0) {
            return; // only load once
        }
        var taskTypes = [];
        // commented out lines, we don't have images for these
        //taskTypes.push( "task-node" );
        taskTypes.push(kWorkflowNodeConfigKey_UploadReferenceTask);
        taskTypes.push(kWorkflowNodeConfigKey_SubmitApprovalTask);
        taskTypes.push(kWorkflowNodeConfigKey_ApprovalTask);
        taskTypes.push(kWorkflowNodeConfigKey_SelectBaseArtworkTask);
        taskTypes.push(kWorkflowNodeConfigKey_ApprovalDecision);
        taskTypes.push(kWorkflowNodeConfigKey_Decision);
        //taskTypes.push( "print-decision" );
        taskTypes.push(kWorkflowNodeConfigKey_ReviewTask);
        taskTypes.push(kWorkflowNodeConfigKey_RepeaterNode);
        taskTypes.push(kWorkflowNodeConfigKey_SuperState);
        taskTypes.push(kWorkflowNodeConfigKey_MilestoneNode);
        taskTypes.push(kWorkflowNodeConfigKey_SimpleTaskNode);
        taskTypes.push(kWorkflowNodeConfigKey_TransferToDALTask);
        taskTypes.push(kWorkflowNodeConfigKey_FormNode);
        taskTypes.push(kWorkflowNodeConfigKey_AutoTransferToDalNode);
        taskTypes.push(kWorkflowNodeConfigKey_AutoTransferToMediaBeaconNode);
        taskTypes.push(kWorkflowNodeConfigKey_ManualTransferToDalNode);
        taskTypes.push(kWorkflowNodeConfigKey_AutomationNode);
        taskTypes.push(kWorkflowNodeConfigKey_SystemNode);
        taskTypes.push(kWorkflowNodeConfigKey_CreatePackshotsNode);
        taskTypes.push(kTaskIconKey_ApprovedStamp);
        taskTypes.push(kTaskIconKey_RejectedStamp);
        taskTypes.push(kWorkflowIconKey_Delete);
        // Load icons where node icon is different than the task icon used everywhere else
        taskTypes.push(kWorkflowNodeConfigKey_ApprovalDecision + kNodeIconSuffix);
        taskTypes.push(kWorkflowNodeConfigKey_Decision + kNodeIconSuffix);
        taskTypes.push(kApprovalDecisionIconKey_Approved);
        taskTypes.push(kApprovalDecisionIconKey_Rejected);
        for (var _i = 0; _i < taskTypes.length; _i++) {
            var taskType = taskTypes[_i];
            var imageObj = new Image();
            imageObj.taskType = taskType;
            imageObj.onload = function () {
                if (!this.naturalHeight || !this.height) {
                    document.body.appendChild(this); // Note: we need to insert into a *visible* location in DOM temporarily.
                    // Set all values to any value it has.
                    this.naturalWidth = this.width = this.offsetWidth = Math.max(this.naturalWidth, this.width, this.offsetWidth);
                    this.naturalHeight = this.height = this.offsetHeight = Math.max(this.naturalHeight, this.height, this.offsetHeight);
                    document.body.removeChild(this);
                }
                wuFunctions.embedHiddenElement(this); // see: issue:SVG
                Blue.m_IconImages[this.taskType] = this;
                Blue.m_IconImages[this.taskType.replace(/-/g, "").toLowerCase()] = this;
            };
            var imageName = taskType;
            // Super states are on their way out, for now use the repeater icon
            if (taskType == kWorkflowNodeConfigKey_SuperState) {
                imageName = kWorkflowNodeConfigKey_RepeaterNode;
            }
            imageObj.crossorigin = "anonymous"; // Arbitrary IE magic whenever drawing SVG to canvas.  See: https://connect.microsoft.com/IE/feedback/details/809823/draw-svg-image-on-canvas-context
            imageObj.src = BlueAppBase.Data.ImageBase + imageName + ".svg"; // see: issue:SVG
        }
    };
    Blue.prototype.getIconByName = function (name) {
        return Blue.getIconByName(name);
    };
    /**
     *
     * @param taskType
     * @param taskStateEnum
     * @param dispositionType
     */
    Blue.getIconByName = function (name) {
        if (!name) {
            console.error(" no name parameter in 'getIconByName'");
            return null;
        }
        var icon = Blue.m_IconImages[name];
        if (!icon) {
            icon = Blue.m_IconImages[name.toLowerCase()];
        }
        if (icon) {
            var resultIcon = icon.cloneNode(true);
            // After cloning an SVG we need to embed it in the DOM.   see: issue: SVG
            wuFunctions.embedHiddenElement(resultIcon);
            // When Edge clones an SVG element it loses the dimensions!
            if (!resultIcon.width || !resultIcon.height) {
                resultIcon.naturalWidth = icon.naturalWidth;
                resultIcon.width = icon.width;
                resultIcon.offsetWidth = icon.offsetWidth;
                resultIcon.naturalHeight = icon.naturalHeight;
                resultIcon.height = icon.height;
                resultIcon.offsetHeight = icon.offsetHeight;
            }
            resultIcon.title = Blue.getToolTipForTaskType(name);
            return resultIcon;
        }
        console.error(" no icon found for name parameter '" + name + "' in 'getIconByName'");
        return null;
    };
    // ------------------------------------------------------
    Blue.getToolTipForTaskType = function (taskType) {
        var tooltip = taskType;
        switch (taskType) {
            case eBlueTaskType[eBlueTaskType.UploadReferenceTaskNode]:
            case kWorkflowNodeConfigKey_UploadReferenceTask:
                tooltip = wuFunctions.getLangString("UploadReferenceFiles");
                break;
            case eBlueTaskType[eBlueTaskType.ReviewTaskNode]:
            case kWorkflowNodeConfigKey_ReviewTask:
                tooltip = wuFunctions.getLangString("Review");
                break;
            case eBlueTaskType[eBlueTaskType.SubmitApprovalTaskNode]:
            case kWorkflowNodeConfigKey_SubmitApprovalTask:
                tooltip = wuFunctions.getLangString("UploadFileForApproval");
                break;
            case eBlueTaskType[eBlueTaskType.TransferToDALTaskNode]:
            case kWorkflowNodeConfigKey_TransferToDALTask:
                tooltip = wuFunctions.getLangString("TransferToLibrary");
                break;
            case eBlueTaskType[eBlueTaskType.ApprovalTaskNode]:
            case kWorkflowNodeConfigKey_ApprovalTask:
                tooltip = wuFunctions.getLangString("Approval");
                break;
            case eBlueTaskType[eBlueTaskType.RepeaterNode]:
                tooltip = wuFunctions.getLangString("Subprocess");
                break;
            case kWorkflowNodeConfigKey_ApprovalDecision:
            case kWorkflowNodeConfigKey_ApprovalDecision + kNodeIconSuffix:
                tooltip = wuFunctions.getLangString("ApprovalDecision");
                break;
            case kWorkflowNodeConfigKey_Decision:
            case kWorkflowNodeConfigKey_Decision + kNodeIconSuffix:
                tooltip = wuFunctions.getLangString("SystemDecision");
                break;
            case kWorkflowNodeConfigKey_MilestoneNode:
                tooltip = wuFunctions.getLangString("Milestone");
                break;
            case eBlueTaskType[eBlueTaskType.SimpleTaskNode]:
            case kWorkflowNodeConfigKey_SimpleTaskNode:
                tooltip = wuFunctions.getLangString("Standard");
                break;
            case eBlueTaskType[eBlueTaskType.FormTaskNode]:
            case kWorkflowNodeConfigKey_FormNode:
                tooltip = wuFunctions.getLangString("CompleteForm");
                break;
            case kWorkflowNodeConfigKey_AutoTransferToDalNode:
            case kWorkflowNodeConfigKey_SystemNode:
                tooltip = wuFunctions.getLangString("AutoTransferToDAL");
                break;
            case kWorkflowNodeConfigKey_ManualTransferToDalNode:
                tooltip = wuFunctions.getLangString("ManualTransferToDAL");
                break;
            case eBlueTaskType[eBlueTaskType.SelectBaseArtworkTaskNode]:
            case kWorkflowNodeConfigKey_SelectBaseArtworkTask:
                tooltip = wuFunctions.getLangString("SelectBaseArtworkFromDAL");
                break;
            case kWorkflowNodeConfigKey_AutomationNode:
                tooltip = wuFunctions.getLangString("Automation");
                break;
            case kTaskIconKey_ApprovedStamp:
                tooltip = wuFunctions.getLangString("Approved");
                break;
            case kTaskIconKey_RejectedStamp:
                tooltip = wuFunctions.getLangString("Rejected");
                break;
            case kWorkflowIconKey_Delete:
                tooltip = wuFunctions.getLangString("Delete");
                break;
            case kWorkflowNodeConfigKey_AutoTransferToMediaBeaconNode:
                tooltip = wuFunctions.getLangString("TransferToMediaBeacon");
                break;
            case kWorkflowNodeConfigKey_CreatePackshotsNode:
                tooltip = wuFunctions.getLangString("CreatePackshots");
                break;
            default:
        }
        return tooltip;
    };
    Blue.prototype.projectUrl = function (projectId, filter, filterId) {
        var url = this.PageUrlBase + Blue.kPathPart_Project + "/" + projectId + "/" + filter;
        if (filterId) {
            url += "/" + filterId;
        }
        return url;
    };
    Blue.prototype.projectsUrl = function (projectId, filter) {
        var projectsUrl = this.PageUrlBase + Blue.kPathPart_Projects;
        if (projectId) {
            projectsUrl += "/" + projectId;
            if (filter) {
                projectsUrl += "/" + filter;
            }
        }
        return projectsUrl;
    };
    Blue.prototype.brandingUrl = function (filter) {
        return this.PageUrlBase + Blue.kPathPart_SiteConfiguration + "/" + filter;
    };
    Blue.prototype.adminUrl = function () {
        return this.PageUrlBase + Blue.kPathPart_Admin;
    };
    Blue.prototype.reportsUrl = function () {
        return this.PageUrlBase + Blue.kPathPart_Reports;
    };
    Blue.prototype.killBlueSession = function (sessionExpired) {
        if (BlueAppBase.Data.VikiSession && BlueAppBase.Data.VikiSession.BlueSessionObject) {
            this.m_RESTfulAPICaller.sendKillBlueSessionRequest(this, sessionExpired);
        }
        else {
            window.location.href = this.LoginUrl;
        }
    };
    Blue.prototype.sendGetCMSLaunchInfo = function () {
        this.m_RESTfulAPICaller.sendGetCMSLaunchInfo();
    };
    // ---------------------------------------------------------
    // IRESTFullApiAppClient interface 
    Blue.prototype.processKillBlueSessionResult = function (result, sessionExpired) {
        if (result === "false" || sessionExpired === true) {
            window.location.href = this.LoginUrl;
        }
        else {
            // Redirect to the login page
            wvAppBase.Logout();
        }
    };
    Blue.kPathPart_Project = "Project";
    Blue.kPathPart_Projects = "Projects";
    Blue.kPathPart_Admin = "Administration";
    Blue.kPathPart_Reports = "Reports";
    Blue.kPathPart_SiteConfiguration = "SiteConfiguration";
    // ------------------------------------------------------
    Blue.m_IconImages = {};
    return Blue;
})(wvAppLayoutBase);
