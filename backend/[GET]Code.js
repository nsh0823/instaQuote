
var MOMENT_CDN_URL = 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/moment.min.js';
var MOMENT_CACHE_KEY = 'libs:moment:2.30.1';
var MOMENT_CACHE_TTL_SECONDS = 21600; // 6 hours
var FILTERED_RFQ_CACHE_KEY = 'rfq:filtered:v1';
var FILTERED_RFQ_CACHE_TTL_SECONDS = 60;
var RFQ_STATUS_INFO_CACHE_KEY = 'rfq:status-info:v1';
var RFQ_STATUS_INFO_CACHE_TTL_SECONDS = 60;
var LOOKUP_CACHE_TTL_SECONDS = 300;
var SHEET_NAME_CACHE_TTL_SECONDS = 21600;
var RATE_CACHE_KEY = 'lookup:rate:v1';
var CLIENT_CACHE_KEY = 'lookup:client:v1';
var LINK_CACHE_KEY = 'lookup:link:v1';
var COUNTRY_CACHE_KEY = 'lookup:country:v1';
var COMP_PT_CACHE_KEY = 'lookup:comp-pt:v1';
var OTHER_FEE_CACHE_KEY = 'lookup:other-fee:v1';
var MERGED_RFQ_OS_CACHE_KEY = 'lookup:merged-rfq-os:v1';
var ACTIVE_USER_NAME_CACHE_TTL_SECONDS = 300;

var is_test = ScriptApp.getService().getUrl().includes("/dev") ? true : false; // 현재 접속된 링크가 테스트 배포 링크인지 확인
var numRetries = 6;
var spreadsheetRuntimeCache_ = {};

var rfqDateFormats = ['M/D/YYYY', 'M/D/YY', 'MM/DD/YYYY', 'MM/DD/YY', 'M-D-YYYY', 'M-D-YY', 'YYYY/M/D', 'YYYY/MM/DD', 'YYYY-M-D', 'YYYY-MM-DD'];

function safeCachePut_(cache, key, value, ttlSeconds) {
  try {
    cache.put(key, value, ttlSeconds);
  } catch (_error) {
    // Ignore cache write failures (size limits / transient issues)
  }
}

function withCachedJson_(key, ttlSeconds, producer) {
  var cache = CacheService.getScriptCache();
  var cached = cache.get(key);

  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (_error) {
      // Ignore invalid cache payload and rebuild.
    }
  }

  var value = producer();
  safeCachePut_(cache, key, JSON.stringify(value), ttlSeconds);
  return value;
}

function ensureMomentLoaded_() {
  if (typeof moment === 'function') return;

  var cache = CacheService.getScriptCache();
  var source = cache.get(MOMENT_CACHE_KEY);

  if (!source) {
    source = UrlFetchApp.fetch(MOMENT_CDN_URL).getContentText();
    if (!source) {
      throw new Error('Failed to fetch moment.js');
    }
    safeCachePut_(cache, MOMENT_CACHE_KEY, source, MOMENT_CACHE_TTL_SECONDS);
  }

  eval(source);

  if (typeof moment !== 'function') {
    throw new Error('Failed to initialize moment.js');
  }
}

function getDateRangeBounds_() {
  ensureMomentLoaded_();
  var now = moment();
  var isFirstQuarter = now.quarter() === 1;
  var fiscalYearStart = isFirstQuarter
    ? now.clone().subtract(1, 'year').month('April').startOf('month')
    : now.clone().month('April').startOf('month');
  var fiscalYearEnd = isFirstQuarter
    ? now.clone().month('March').endOf('month')
    : now.clone().add(1, 'year').month('March').endOf('month');

  return {
    weekStart: now.clone().startOf('week').format('M/D/YYYY'),
    weekEnd: now.clone().endOf('week').format('M/D/YYYY'),
    monthStart: now.clone().startOf('month').format('M/D/YYYY'),
    monthEnd: now.clone().endOf('month').format('M/D/YYYY'),
    quarterStart: now.clone().startOf('quarter').format('M/D/YYYY'),
    quarterEnd: now.clone().endOf('quarter').format('M/D/YYYY'),
    yearStart: fiscalYearStart.format('M/D/YYYY'),
    yearEnd: fiscalYearEnd.format('M/D/YYYY')
  };
}

function getUniqueRowsById_(rows) {
  var seen = new Set();
  return rows.filter(function(row) {
    var key = row[0];
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function openSpreadsheetCached_(spreadSheetId) {
  if (!spreadsheetRuntimeCache_[spreadSheetId]) {
    spreadsheetRuntimeCache_[spreadSheetId] = SpreadsheetApp.openById(spreadSheetId);
  }
  return spreadsheetRuntimeCache_[spreadSheetId];
}

function parseRfqMoment_(value) {
  if (value === null || value === undefined) return null;

  var text = String(value).trim();
  if (!text) return null;

  ensureMomentLoaded_();

  var parsed = moment(text, rfqDateFormats, true);
  if (parsed.isValid()) {
    return parsed;
  }

  // Fallback for values already serialized as Date-compatible strings.
  var fallback = new Date(text);
  if (!isNaN(fallback.getTime())) {
    parsed = moment(fallback);
    if (parsed.isValid()) return parsed;
  }

  return null;
}

function isIncludedRfqDate_(value) {
  return Boolean(parseRfqMoment_(value));
}

/**
 * 아래 doGet 코드는 QQ에 접속하면 바로 실행되며, 'Rate Card', 'Client 리스트', 'Country 리스트' 등 다양한 시트에서 데이터를 불러온다.
 */
function doGet(e) {
  // REST-style API mode for React frontend compatibility
  if (e && e.parameter && e.parameter.api === '1') {
    return handleApiGet_(e);
  }

  // Set Active page
  let page = e.parameter.mode || "Index";

  // 초기 Oauth 매개변수 가져오기, 없으면 false로 설정 | Get initial OAuth parameter, set to false if not present
  const initOauth = (JSON.stringify(e.parameters.oauth)) || false;

  // 초기 Oauth가 없으면 실행 모드에 따라 적절한 HTML 페이지 반환 | If there is no initial OAuth, return the appropriate HTML page based on the execution mode
  if (!initOauth) {
    var form = HtmlService.createTemplateFromFile(page);

    if(page == 'Index') {
      //var userName = getActiveUserEmail().split('.')[0];
      //var modName = userName[0].toUpperCase() + userName.slice(1);

      form.USER_NAME = getActiveUserName();
    }

    form.SCRIPT_URL = getScriptURL();

    form.IS_TEST = is_test;

    var formEval = form.evaluate();
    var formOutput = HtmlService.createHtmlOutput(formEval);

    //Replace {{NAV_SIDEBAR}} with the getNavSidebar content
    formOutput.setContent(formOutput.getContent().replace("{{NAV_SIDEBAR}}",getNavSidebar(page)).replace("{{FOOTER}}",getFooter()));

    //form.assets = getAssets('견적 폼 이미지');
    // Web 앱 URL이 "/exec"로 끝나면 실행 페이지 반환 | If the web app URL ends with "/exec," return the execution page
    if (!is_test) {
      return formOutput.setTitle('instaQuote').setFaviconUrl('https://i.postimg.cc/2qPmbrwS/insta-Quote-logo-final.png');
    } 
    // Web 앱 URL이 "/dev"로 끝나면 탭 이름에 'Test' 표시 | If the web app URL ends with "/dev," show 'Test' in the tab name
    else {
      return formOutput.setTitle('instaQuote - Test').setFaviconUrl('https://i.postimg.cc/2qPmbrwS/insta-Quote-logo-final.png');
    }
  } 
  // 초기 Oauth가 있으면 OAuth 인증 페이지 반환 | If there is initial OAuth, return the OAuth authentication page
  else {
    return buildOAuthAuthPage(e);
  }
}

function handleApiGet_(e) {
  try {
    var fn = e.parameter.fn;
    if (!fn) {
      throw new Error("Missing required query parameter: fn");
    }

    var args = [];
    if (e.parameter.args) {
      try {
        args = JSON.parse(e.parameter.args);
      } catch (parseError) {
        throw new Error("Invalid args JSON: " + parseError);
      }
      if (!Array.isArray(args)) {
        throw new Error("args must be a JSON array");
      }
    }

    var apiHandlers = {
      getActiveUserEmail: getActiveUserEmail,
      getActiveUserName: getActiveUserName,
      getLink: getLink,
      getGmailEmails: getGmailEmails,
      getCountry: getCountry,
      getClient: getClient,
      getOtherFee: getOtherFee,
      getCompPt: getCompPt,
      getRate: getRate,
      getRFQ: getRFQ,
      getDraft: getDraft,
      getRFQOS: getRFQOS,
      getDraftOS: getDraftOS,
      getVendors: getVendors,
      getFilteredRFQ: getFilteredRFQ,
      getRFQStatusInfo: getRFQStatusInfo,
      getRFQOverview: getRFQOverview,
      getMergedRFQOS: getMergedRFQOS
    };

    var handler = apiHandlers[fn];
    if (!handler) {
      throw new Error("Unsupported API function: " + fn);
    }

    var result = handler.apply(null, args);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, data: result }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getFooter() {
  return `<footer class="footer">
    <div>Copyright © 2025 Peter Nam.</div>
    <a href="https://script.google.com/macros/s/AKfycbzR4C6JvphST5AY-i8Gzpv1ECapoC0pwl4Xyv8qx4i2Mv8sIO8chVT4fKumq_VCIVr4/exec?mode=privacy-policy" target="_blank">Privacy Policy & Terms of Service</a>
  </footer>`;
}

//Create Navigation Sidebar
function getNavSidebar(activePage) {
  var scriptURLHome = getScriptURL();
  var scriptURLCreate = getScriptURL("mode=Create-KR");
  var scriptURLDash = getScriptURL("mode=Dash-KR");
  var scriptURLStatus = getScriptURL("mode=Status-KR");
  var scriptURLList = getScriptURL("mode=List-KR");
  var scriptURLVendor = getScriptURL("mode=Vendor-OS");
  var scriptURLDraft = getScriptURL("mode=Draft-KR");
  //var scriptURLPage2 = getScriptURL("mode=Page2");

  var navbar = 
    `<div id="navSidebar" class="sidebar" onmouseenter="toggleSidebar()" onmouseleave="toggleSidebar()" data-env="${is_test ? 'test' : 'live'}">
      <div class="sidebar-no-overflow-x">
        <!--<center>-->
          <div class="navbar-brand">
            <a id="navbarLogo" target="_top" href="${scriptURLHome}" style="text-decoration:none;">
              <img class="navbar-brand-logo" src="https://i.postimg.cc/2qPmbrwS/insta-Quote-logo-final.png" />
              <div class="navbar-brand-text" style="font-weight:bolder;"><span style="color:white;">insta</span><span style="color:#9270ff;">Quote</span></div>
            </a>
          </div>
        
          <div class="btn-group rfq-group" role="group" aria-label="Basic radio toggle button group">
            <input type="radio" class="btn-check rfq-type-check" name="btnradio" id="rfqTypeKR" autocomplete="off" value="KR" checked>
            <label class="btn btn-outline-secondary rfq-type-kr" for="rfqTypeKR">KR</label>

            <input type="radio" class="btn-check rfq-type-check" name="btnradio" id="rfqTypeOS" autocomplete="off" value="OS">
            <label class="btn btn-outline-secondary rfq-type-os" for="rfqTypeOS">OS</label>

            <div class="btn-slider"></div>
          </div>
          
          <div class="nav-menu-link-container">
            <a class="btn btn-primary nav-menu-link create-rfq-btn" target="_top" href="${scriptURLCreate}" role="button"><i class="bi bi-plus-square"></i><span class="bi-icon-text">&nbsp;&nbsp;Create RFQ</span></a>
          </div>

          <div class="nav-menu-container">
            <div class="nav-menu-link-container">
              <a class="btn nav-menu-link ${activePage.includes('Draft') ? 'active' : ''}" target="_top" href="${scriptURLDraft}" role="button"><i class="bi bi-table"></i></i><span class="bi-icon-text">&nbsp;&nbsp;Drafts</span></a>
            </div>
            <div class="nav-menu-link-container">
              <a class="btn nav-menu-link ${activePage.includes('List') ? 'active' : ''}" target="_top" href="${scriptURLList}" role="button"><i class="bi bi-table"></i><span class="bi-icon-text">&nbsp;&nbsp;RFQ List</span></a>
            </div>
            <div class="nav-menu-link-container">
              <a class="btn nav-menu-link ${activePage.includes('Dash') ? 'active' : ''}" target="_top" href="${scriptURLDash}" role="button"><i class="bi bi-speedometer2"></i><span class="bi-icon-text">&nbsp;&nbsp;RFQ Dashboard</span></a>
            </div>
            <div class="nav-menu-link-container">
              <a class="btn nav-menu-link ${activePage.includes('Status') ? 'active' : ''}" target="_top" href="${scriptURLStatus}" role="button"><i class="bi bi-bar-chart-line"></i><span class="bi-icon-text">&nbsp;&nbsp;Order Status</span></a>
            </div>
            <div class="nav-menu-link-container">
              <a class="btn nav-menu-link ${activePage.includes('Vendor') ? 'active' : ''}" target="_top" href="${scriptURLVendor}" role="button"><i class="bi bi-table"></i></i><span class="bi-icon-text">&nbsp;&nbsp;Vendor List</span></a>
            </div>
            
          </div>
        <!--</center>-->

        
          
        
      </div>

      <div class="link-menu-dropdown-container">
        <div class="dropdown link-menu-dropdown dropup">
          <button class="btn link-menu" data-bs-toggle="dropdown" data-bs-hover="dropdown" data-bs-auto-close="true" aria-expanded="false">
              <i class="bi bi-translate" style="color: white;"></i>
          </button>
          <div class="dropdown-menu dropdown-menu-top nav-dropdown-menu nav-dropdown-menu-end shadow-sm">
            <a class="dropdown-item nav-dropdown-item" href="#" id="switchToKorean">한국어</a>
            <a class="dropdown-item nav-dropdown-item" href="#" id="switchToEnglish">English</a>
          </div>
        </div>
        <div class="dropdown link-menu-dropdown dropup">
          <button class="btn link-menu" data-bs-toggle="dropdown" data-bs-hover="dropdown" aria-expanded="false">
            <i class="bi bi-box-arrow-up-right" style="color:white;"></i>
          </button>
          <div class="dropdown-menu dropdown-menu-top nav-dropdown-menu shadow-sm" style="width:500px;height:300px;padding:0;">
            <div class="row" style="width:100%;height:100%;margin:0;">
              <div class="col-5" style="background:#f5f3f8;border-radius:0.25rem 0 0 0.25rem;padding:0.5rem;">
                <h4 class="dropdown-header">RFQ Related</h4>
                <a class="dropdown-item nav-dropdown-item" href="https://docs.google.com/spreadsheets/d/1pWFTXnpKhO6VOzHT7KsjrUPxmKFwfQdlatTKmWvTjUk/edit?gid=0#gid=0" target="_blank"><div class="shadow-sm"><img src="https://ssl.gstatic.com/docs/spreadsheets/spreadsheets_2023q4.ico" height="15px" width="15px"></div>RFQ List (KR)</a>
                <a class="dropdown-item nav-dropdown-item" href="https://docs.google.com/spreadsheets/d/1pWFTXnpKhO6VOzHT7KsjrUPxmKFwfQdlatTKmWvTjUk/edit?gid=36461421#gid=36461421" target="_blank"><div class="shadow-sm"><img src="https://ssl.gstatic.com/docs/spreadsheets/spreadsheets_2023q4.ico" height="15px" width="15px"></div>RFQ List (OS)</a>
                <a class="dropdown-item nav-dropdown-item" href="https://docs.google.com/spreadsheets/d/1pWFTXnpKhO6VOzHT7KsjrUPxmKFwfQdlatTKmWvTjUk/edit?gid=1004620658#gid=1004620658" target="_blank"><div class="shadow-sm"><img src="https://ssl.gstatic.com/docs/spreadsheets/spreadsheets_2023q4.ico" height="15px" width="15px"></div>Vendor List</a>
                <a class="dropdown-item nav-dropdown-item" href="https://docs.google.com/spreadsheets/d/1pWFTXnpKhO6VOzHT7KsjrUPxmKFwfQdlatTKmWvTjUk/edit?gid=263916741#gid=263916741" target="_blank"><div class="shadow-sm"><img src="https://ssl.gstatic.com/docs/spreadsheets/spreadsheets_2023q4.ico" height="15px" width="15px"></div>Country Code</a>
              </div>
              <div class="col-7" style="padding:0.5rem;">
                <h4 class="dropdown-header">Useful Links</h4>
                <div id="insertLinkList" style="height:225px;overflow-y:auto;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  return navbar;
}

function getSheetNameById(spreadSheetId,gid) {
  var cacheKey = 'sheet-name:' + spreadSheetId + ':' + gid;
  return withCachedJson_(cacheKey, SHEET_NAME_CACHE_TTL_SECONDS, function() {
    var ss = openSpreadsheetCached_(spreadSheetId);
    var targetSheetId = Number(gid);
    var sheet = ss.getSheets().find(function(item) {
      return item.getSheetId() === targetSheetId;
    });
    if (!sheet) {
      throw new Error('Sheet not found for gid: ' + gid);
    }
    return sheet.getSheetName();
  });
}
 
//GET DATA AND RETURN AS AN ARRAY
function getRate(){
  return withCachedJson_(RATE_CACHE_KEY, LOOKUP_CACHE_TTL_SECONDS, function() {
    var spreadSheetId = "1pWFTXnpKhO6VOzHT7KsjrUPxmKFwfQdlatTKmWvTjUk"; //CHANGE
    var rateSheetName = getSheetNameById(spreadSheetId,'358935832');
    var dataRanges = [
      rateSheetName + "!C3:P14",
      rateSheetName + "!C17:P28",
      rateSheetName + "!C31:P42",
      rateSheetName + "!C45:P56",
      rateSheetName + "!C59:P70"
    ];
 
    // Fetch all ranges with one API call.
    var response = Sheets.Spreadsheets.Values.batchGet(spreadSheetId, { ranges: dataRanges });
    var ranges = response.valueRanges || [];
    var getSpreadsheet = function() {return ranges};
    retry_(getSpreadsheet, numRetries);

    return dataRanges.map(function(_range, idx) {
      return (ranges[idx] && ranges[idx].values) ? ranges[idx].values : [];
    });
  });
}

//GET DATA FROM 'Client 리스트' SHEET AND RETURN AS AN ARRAY
function getClient(){
  return withCachedJson_(CLIENT_CACHE_KEY, LOOKUP_CACHE_TTL_SECONDS, function() {
    var spreadSheetId = "1pWFTXnpKhO6VOzHT7KsjrUPxmKFwfQdlatTKmWvTjUk"; //CHANGE
    var dataRange     = "Client List!A:XX"; //CHANGE
  
    var range   = Sheets.Spreadsheets.Values.get(spreadSheetId,dataRange);
    var data_full  = range.values || [];
    var header = data_full[0] || [];
    var data = data_full.slice(2);

    var valuesH = [];
    var values0  = [];
    var values1  = [];
    var values2  = [];
    var values3  = [];
    var values4  = [];

    header.forEach(function(val) {
      if(val !== '') valuesH.push(val);
    });

    for (var i = 0; i < data.length; i++) {
      if(data[i][0] != null && data[i][1] != null && data[i][0] !== '' && data[i][1] !== ''){ values0.push([data[i][0], data[i][1]]); }
      if(data[i][2] != null && data[i][3] != null && data[i][2] !== '' && data[i][3] !== ''){ values1.push([data[i][2], data[i][3]]); }
      if(data[i][4] != null && data[i][5] != null && data[i][4] !== '' && data[i][5] !== ''){ values2.push([data[i][4], data[i][5]]); }
      if(data[i][6] != null && data[i][7] != null && data[i][6] !== '' && data[i][7] !== ''){ values3.push([data[i][6], data[i][7]]); }
      if(data[i][8] != null && data[i][9] != null && data[i][8] !== '' && data[i][9] !== ''){ values4.push([data[i][8], data[i][9]]); }
    }

    var getSpreadsheet = function() {return range};
    retry_(getSpreadsheet, numRetries);
    return [valuesH,values0,values1,values2,values3,values4];
  });
}

//GET DATA FROM '참고 링크' SHEET AND RETURN AS AN ARRAY
function getLink(){
  return withCachedJson_(LINK_CACHE_KEY, LOOKUP_CACHE_TTL_SECONDS, function() {
    var spreadSheetId = "1pWFTXnpKhO6VOzHT7KsjrUPxmKFwfQdlatTKmWvTjUk"; //CHANGE
    var dataRange     = "Useful Links!A2:B"; //CHANGE
  
    var range   = Sheets.Spreadsheets.Values.get(spreadSheetId,dataRange);
    var values  = range.values || [];

    var getSpreadsheet = function() {return range};
    retry_(getSpreadsheet, numRetries);
  
    return values;
  });
}

//GET DATA FROM 'Country 리스트' SHEET AND RETURN AS AN ARRAY
function getCountry(){
  return withCachedJson_(COUNTRY_CACHE_KEY, LOOKUP_CACHE_TTL_SECONDS, function() {
    var spreadSheetId = "1pWFTXnpKhO6VOzHT7KsjrUPxmKFwfQdlatTKmWvTjUk"; //CHANGE
    var dataRange     = "Country List!A2:E"; //CHANGE
  
    var range   = Sheets.Spreadsheets.Values.get(spreadSheetId,dataRange);
    var values  = range.values || [];

    var getSpreadsheet = function() {return range};
    retry_(getSpreadsheet, numRetries);
  
    return values;
  });
}

//GET DATA FROM 'Data' SHEET AND RETURN AS AN ARRAY
function getCompPt(){
  return withCachedJson_(COMP_PT_CACHE_KEY, LOOKUP_CACHE_TTL_SECONDS, function() {
    var spreadSheetId = "1pWFTXnpKhO6VOzHT7KsjrUPxmKFwfQdlatTKmWvTjUk"; //CHANGE
    var dataRange     = "Comp Pt!A2:B"; //CHANGE
  
    var range   = Sheets.Spreadsheets.Values.get(spreadSheetId,dataRange);
    var values  = range.values || [];

    var getSpreadsheet = function() {return range};
    retry_(getSpreadsheet, numRetries);
  
    return values;
  });
}

//GET DATA FROM '운영비' SHEET AND RETURN AS AN ARRAY
function getOtherFee(){
  return withCachedJson_(OTHER_FEE_CACHE_KEY, LOOKUP_CACHE_TTL_SECONDS, function() {
    var spreadSheetId = "1pWFTXnpKhO6VOzHT7KsjrUPxmKFwfQdlatTKmWvTjUk"; //CHANGE
    var dataRange     = "Other Fee!A3:O"; //CHANGE
  
    var range   = Sheets.Spreadsheets.Values.get(spreadSheetId,dataRange);
    var data = range.values || [];
    
    var values0  = [];
    var values1  = [];
    var values2  = [];
    var values3  = [];
    var values4  = [];

    for (var i = 0; i < data.length; i++) {
      if(data[i][0] != null && data[i][1] != null && data[i][2] != null && data[i][0] !== '' && data[i][1] !== '' && data[i][2] !== ''){ values0.push([data[i][0], data[i][1], data[i][2]]); }
      if(data[i][3] != null && data[i][4] != null && data[i][5] != null && data[i][3] !== '' && data[i][4] !== '' && data[i][5] !== ''){ values1.push([data[i][3], data[i][4], data[i][5]]); }
      if(data[i][6] != null && data[i][7] != null && data[i][8] != null && data[i][6] !== '' && data[i][7] !== '' && data[i][8] !== ''){ values2.push([data[i][6], data[i][7], data[i][8]]); }
      if(data[i][9] != null && data[i][10] != null && data[i][11] != null && data[i][9] !== '' && data[i][10] !== '' && data[i][11] !== ''){ values3.push([data[i][9], data[i][10], data[i][11]]); }
      if(data[i][12] != null && data[i][13] != null && data[i][14] != null && data[i][12] !== '' && data[i][13] !== '' && data[i][14] !== ''){ values4.push([data[i][12], data[i][13], data[i][14]]); }
    }

    var getSpreadsheet = function() {return range};
    retry_(getSpreadsheet, numRetries);
  
    return [values0,values1,values2,values3,values4];
  });
}

//use for Live Link
//GET DATA FROM 'RFQ 리스트' SHEET AND RETURN AS AN ARRAY
function getRFQ(rfqid){
  //use for Live Link
  var spreadSheetId = "1pWFTXnpKhO6VOzHT7KsjrUPxmKFwfQdlatTKmWvTjUk"; //CHANGE
  var sheetName = "RFQ List";

  var doc = openSpreadsheetCached_(spreadSheetId);
  var sheet = doc.getSheetByName(sheetName);
  
  //var rangeValues = sheet.getDataRange();
  //var values = rangeValues.getValues();
  //var values = sheet.getDataRange().getDisplayValues();
  var values;
  var header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];

  if(rfqid) {
    var thisRFQRow = sheet.getRange('A1:A').createTextFinder(rfqid).matchEntireCell(true).findNext().getRow();
    
    var thisRFQValues = sheet.getRange(thisRFQRow, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];

    values = [header,thisRFQValues];
    //values.filter((arr,idx) => arr[0].toString() == rfqid.toString() || idx == 0);
  } else {
    var dateIdx = header.indexOf('Date');
    //values = sheet.getDataRange().getDisplayValues();
    values = sheet.getDataRange().getDisplayValues().slice(1).filter(function(row) {
        if (dateIdx === -1) return false;
        return isIncludedRfqDate_(row[dateIdx]);
    });
    values.unshift(header);
  }
  
  var getSpreadsheet = function() {return values};
  retry_(getSpreadsheet, numRetries);
 
  return values;
}

// Draft 시트에서 데이터 불러옴
function getDraft(rfqid){
  //use for Live Link
  var spreadSheetId = "1pWFTXnpKhO6VOzHT7KsjrUPxmKFwfQdlatTKmWvTjUk"; //CHANGE
  var sheetName = "RFQ List Draft";


  var doc = openSpreadsheetCached_(spreadSheetId);
  var sheet = doc.getSheetByName(sheetName);

  var values;
  var header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];

  if(rfqid) {
    var thisRFQRow = sheet.getRange('A1:A').createTextFinder(rfqid).matchEntireCell(true).findNext().getRow();
    
    var thisRFQValues = sheet.getRange(thisRFQRow, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];

    values = [header,thisRFQValues];
    //values.filter((arr,idx) => arr[0].toString() == rfqid.toString() || idx == 0);
  } else {
    var dateIdx = header.indexOf('Date');
    //values = sheet.getDataRange().getDisplayValues();
    values = sheet.getDataRange().getDisplayValues().slice(1).filter(function(row) {
        if (dateIdx === -1) return false;
        return isIncludedRfqDate_(row[dateIdx]);
    });
    values.unshift(header);
  }
  
  var getSpreadsheet = function() {return values};
  retry_(getSpreadsheet, numRetries);
 
  return values;
}

// RFQ List_OS 시트에서 데이터 불러옴
function getRFQOS(rfqid){
  //use for Live Link
  var spreadSheetId = "1pWFTXnpKhO6VOzHT7KsjrUPxmKFwfQdlatTKmWvTjUk"; //CHANGE
  var sheetName = "RFQ List_OS";


  var doc = openSpreadsheetCached_(spreadSheetId);
  var sheet = doc.getSheetByName(sheetName);

  // var rangeValues = sheet.getDataRange();
  // //var values = rangeValues.getValues();
  // var values = rangeValues.getDisplayValues();
  //var values = sheet.getDataRange().getDisplayValues();
  var values;
  var header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];

  if(rfqid) {
    var thisRFQRow = sheet.getRange('A1:A').createTextFinder(rfqid).matchEntireCell(true).findNext().getRow();
    const numMergedRows = sheet.getRange(thisRFQRow, 1).isPartOfMerge() ? sheet.getRange(thisRFQRow, 1).getMergedRanges()[0].getNumRows() : 1;
    
    var thisRFQValues = sheet.getRange(thisRFQRow, 1, numMergedRows, sheet.getLastColumn()).getDisplayValues();

    values = [header,...thisRFQValues];
  } else {
    let filteredRowIndexes = new Set();
    const dateIdx = header.findIndex(val => val === 'RFQ Date');

    values = sheet.getDataRange().getDisplayValues().slice(1).filter((row,i) => {
        if (isIncludedRfqDate_(row[dateIdx])) {
          filteredRowIndexes.add(i + 2);
          return true;
        }
    });
    values.unshift(header);
    
    var mergedInfo = [];
    if (filteredRowIndexes.size > 0) {
      const firstRow = Math.min(...filteredRowIndexes);
      const lastRow = Math.max(...filteredRowIndexes);
      var mergedRanges = sheet.getRange(firstRow, 1, lastRow - firstRow + 1, sheet.getMaxColumns()).getMergedRanges();
      var rowIndexMap = {};
      var filteredRows = Array.from(filteredRowIndexes);
      filteredRows.forEach(function(sheetRow, idx) {
        rowIndexMap[sheetRow] = idx + 1; // +1 because values[0] is header
      });

      for (var i = 0; i < mergedRanges.length; i++) {
        var range = mergedRanges[i];
        var startRow = rowIndexMap[range.getRow()]; // Convert to zero-based array position with header offset
        if (startRow === undefined) continue;
        var startCol = range.getColumn() - 1; // Convert to zero-based index
        
        var mergedValue = values[startRow][startCol]; // Use pre-fetched values

        // Collect merged range info
        mergedInfo.push({
          row: startRow,
          col: startCol,
          rowspan: range.getNumRows(),
          colspan: range.getNumColumns(),
          mergedValue: mergedValue
        });

        if(startCol === 0) {
          // Apply the merged value to all cells in the merged range
          for (var row = startRow; row < startRow + range.getNumRows(); row++) {
            if (!values[row]) continue;
            for (var col = startCol; col < startCol + range.getNumColumns(); col++) {
              values[row][col] = mergedValue.toString();
            }
          }
        }
      }
    }


    // Reverse all rows except the first (header row)
    //var header = values[0]; // Keep the first row (header) intact
    var bodyRows = values.slice(1); // Get all rows after the header
    //var reversedBodyRows = bodyRows.reverse(); // Reverse the body rows
    var reversedBodyRows = [];

    //Logger.log(values)


    // Adjust merged cell info only for body rows
    var rowCount = bodyRows.length; // Row count without the header
    mergedInfo.forEach(function(merge) {
      if (merge.row > 0) { // Only adjust rows after the header (row 0)
        merge.row = rowCount - merge.row  - (merge.rowspan - 2); // Adjust for reversed rows
      }
    });
    //Logger.log(bodyRows)

    var groupedArr = bodyRows.reduce((r, v) => {  
      const id = v[0];

      r[id] = r[id] || [];
      r[id].push(v);

      return r;
    }, {});

    var reversedArr = Object.values(groupedArr).reverse();

    reversedArr.forEach(function(a1) {
      a1.forEach(function(a2) {
        reversedBodyRows.push(a2);
      });
    });

    // Combine the header with the reversed body rows
    var finalValues = [header].concat(reversedBodyRows);

    // Index of the "Last updated" column (adjust index as needed)
    var lastUpdatedColumnIndex = header.indexOf("Last updated");

    // Convert "Last updated" values to ISO strings
    if (lastUpdatedColumnIndex > -1) {
        finalValues.forEach((row, index) => {
            if (index > 0 && row[lastUpdatedColumnIndex]) { // Skip the header row
                var cellValue = row[lastUpdatedColumnIndex];
                try {
                    // Try to parse and convert to ISO string
                    var date = new Date(cellValue);
                    if (!isNaN(date)) {
                        ensureMomentLoaded_();
                        row[lastUpdatedColumnIndex] = moment(date).format('M/D/YYYY');
                    }
                } catch (e) {
                    Logger.log("Error parsing date: " + cellValue);
                }
            }
        });
    }
  }

  

  //Logger.log(finalValues)
  var getSpreadsheet = function() {return values};
  retry_(getSpreadsheet, numRetries);
 
  //return values;
  //return { dataArray: values, mergedInfo: mergedInfo };
  //Logger.log(values)
  //return { dataArray: finalValues, mergedInfo: mergedInfo };
  //return finalValues;
  return rfqid ? JSON.parse(JSON.stringify({ dataArray: values })) : JSON.parse(JSON.stringify({ dataArray: finalValues, mergedInfo: mergedInfo }));
}

// Draft_OS 시트에서 데이터 불러옴
function getDraftOS(rfqid){
  //use for Live Link
  var spreadSheetId = "1pWFTXnpKhO6VOzHT7KsjrUPxmKFwfQdlatTKmWvTjUk"; //CHANGE
  var sheetName = "RFQ List Draft_OS";


  var doc = openSpreadsheetCached_(spreadSheetId);
  var sheet = doc.getSheetByName(sheetName);

  // var rangeValues = sheet.getDataRange();
  // //var values = rangeValues.getValues();
  // var values = rangeValues.getDisplayValues();
  var values;
  var header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];

  if(rfqid) {
    var thisRFQRow = sheet.getRange('A1:A').createTextFinder(rfqid).matchEntireCell(true).findNext().getRow();
    const numMergedRows = sheet.getRange(thisRFQRow, 1).isPartOfMerge() ? sheet.getRange(thisRFQRow, 1).getMergedRanges()[0].getNumRows() : 1;
    
    var thisRFQValues = sheet.getRange(thisRFQRow, 1, numMergedRows, sheet.getLastColumn()).getDisplayValues();

    values = [header,...thisRFQValues];
  } else {
    // values = sheet.getDataRange().getDisplayValues();

    // // Get merged ranges in the sheet
    // //var mergedRanges = sheet.getRange(rangeValues.getA1Notation()).getMergedRanges();
    // var mergedRanges = sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).getMergedRanges();

    // var mergedInfo = [];

    // // Iterate through the merged ranges
    // mergedRanges.forEach(function(range) {
    //   // Get the value of the merged range
    //   var mergedValue = range.getCell(1, 1).getValue(); // The value of the top-left cell of the merge
      
    //   // Get the range's row and column information
    //   var startRow = range.getRow();
    //   var startCol = range.getColumn();
    //   var numRows = range.getNumRows();
    //   var numCols = range.getNumColumns();

    //   mergedInfo.push({
    //     row: startRow - 1, 
    //     col: startCol - 1, 
    //     rowspan: numRows, 
    //     colspan: numCols,
    //     mergedValue: mergedValue
    //   });
    //   if(startCol - 1 === 0) {
    //   // Apply the merged value to all cells in the merged range
    //   for (var row = startRow; row < startRow + numRows; row++) {
    //     for (var col = startCol; col < startCol + numCols; col++) {
    //       values[row - 1][col - 1] = mergedValue.toString();
    //     }
    //   }
    //   }
    // });

    let filteredRowIndexes = new Set();
    const dateIdx = header.findIndex(val => val === 'RFQ Date');

    values = sheet.getDataRange().getDisplayValues().slice(1).filter((row,i) => {
        if (isIncludedRfqDate_(row[dateIdx])) {
          filteredRowIndexes.add(i + 2);
          return true;
        }
    });
    values.unshift(header);
    
    var mergedInfo = [];
    if (filteredRowIndexes.size > 0) {
      const firstRow = Math.min(...filteredRowIndexes);
      const lastRow = Math.max(...filteredRowIndexes);
      var mergedRanges = sheet.getRange(firstRow, 1, lastRow - firstRow + 1, sheet.getMaxColumns()).getMergedRanges();
      var rowIndexMap = {};
      var filteredRows = Array.from(filteredRowIndexes);
      filteredRows.forEach(function(sheetRow, idx) {
        rowIndexMap[sheetRow] = idx + 1; // +1 because values[0] is header
      });

      for (var i = 0; i < mergedRanges.length; i++) {
        var range = mergedRanges[i];
        var startRow = rowIndexMap[range.getRow()]; // Convert to zero-based array position with header offset
        if (startRow === undefined) continue;
        var startCol = range.getColumn() - 1; // Convert to zero-based index
        
        var mergedValue = values[startRow][startCol]; // Use pre-fetched values

        // Collect merged range info
        mergedInfo.push({
          row: startRow,
          col: startCol,
          rowspan: range.getNumRows(),
          colspan: range.getNumColumns(),
          mergedValue: mergedValue
        });

        if(startCol === 0) {
          // Apply the merged value to all cells in the merged range
          for (var row = startRow; row < startRow + range.getNumRows(); row++) {
            if (!values[row]) continue;
            for (var col = startCol; col < startCol + range.getNumColumns(); col++) {
              values[row][col] = mergedValue.toString();
            }
          }
        }
      }
    }


    // Reverse all rows except the first (header row)
    // var header = values[0]; // Keep the first row (header) intact
    var bodyRows = values.slice(1); // Get all rows after the header
    //var reversedBodyRows = bodyRows.reverse(); // Reverse the body rows
    var reversedBodyRows = [];

    // Adjust merged cell info only for body rows
    var rowCount = bodyRows.length; // Row count without the header
    mergedInfo.forEach(function(merge) {
      if (merge.row > 0) { // Only adjust rows after the header (row 0)
        merge.row = rowCount - merge.row  - (merge.rowspan - 2); // Adjust for reversed rows
      }
    });
    //Logger.log(bodyRows)

    var groupedArr = bodyRows.reduce((r, v) => {  
      const id = v[0];

      r[id] = r[id] || [];
      r[id].push(v);

      return r;
    }, {});

    var reversedArr = Object.values(groupedArr).reverse();

    reversedArr.forEach(function(a1) {
      a1.forEach(function(a2) {
        reversedBodyRows.push(a2);
      });
    });

    // Combine the header with the reversed body rows
    var finalValues = [header].concat(reversedBodyRows);
  }

  

  //Logger.log(finalValues)
  var getSpreadsheet = function() {return values};
  retry_(getSpreadsheet, numRetries);
 
  //return values;
  //return { dataArray: values, mergedInfo: mergedInfo };
  //return { dataArray: finalValues, mergedInfo: mergedInfo };
  return rfqid ? JSON.parse(JSON.stringify({ dataArray: values })) : JSON.parse(JSON.stringify({ dataArray: finalValues, mergedInfo: mergedInfo }));
}



function getFilteredRFQ() {
  return withCachedJson_(FILTERED_RFQ_CACHE_KEY, FILTERED_RFQ_CACHE_TTL_SECONDS, function() {
    var spreadSheetId = "1pWFTXnpKhO6VOzHT7KsjrUPxmKFwfQdlatTKmWvTjUk"; //CHANGE
    var sheetName1 = "RFQ List";
    var sheetName2 = "RFQ List_OS";

    var doc = openSpreadsheetCached_(spreadSheetId);
    var sheet1 = doc.getSheetByName(sheetName1);
    var sheet2 = doc.getSheetByName(sheetName2);

    var rangeValues1 = sheet1.getDataRange();
    var rangeValues2 = sheet2.getDataRange();
    var values1 = rangeValues1.getDisplayValues();
    var values2 = rangeValues2.getDisplayValues();
  
    var getSpreadsheet = function() {return rangeValues1};
    retry_(getSpreadsheet, numRetries);

    var dataHeader1 = values1[0] || [];
    var dateIdx1 = dataHeader1.indexOf('Date');
    var dataValues1 = dateIdx1 === -1
      ? []
      : values1.slice(1).filter(function(row) {
          return isIncludedRfqDate_(row[dateIdx1]);
        });

    var dataHeader2 = values2[0] || [];
    var dateIdx2 = dataHeader2.indexOf('RFQ Date');
    var dataValues2 = dateIdx2 === -1
      ? []
      : values2.slice(1).filter(function(row) {
          return isIncludedRfqDate_(row[dateIdx2]);
        });
  
    return {headerKR:dataHeader1, valuesKR:dataValues1, headerOS:dataHeader2, valuesOS:dataValues2};
  });
}

// 날짜, 소유자, Status 만 필터링
function getRFQStatusInfo() {
    var targetUser = getActiveUserName();
    return withCachedJson_(RFQ_STATUS_INFO_CACHE_KEY + ':' + targetUser, RFQ_STATUS_INFO_CACHE_TTL_SECONDS, function() {
        var data_all = getFilteredRFQ();

        // Helper function to process data
        const processRFQData = (headerValues, bodyValues, dateCol, ownerCol, statusCol, _targetUser) => {

            // Get indices
            const dateIdx = headerValues.findIndex(val => val === dateCol);
            const ownerIdx = headerValues.findIndex(val => val === ownerCol);
            const statusIdx = headerValues.findIndex(val => val === statusCol);

            // O(n) duplicate filtering by RFQ ID (first column)
            return getUniqueRowsById_(bodyValues).map(arr =>
                arr.filter((_,idx) => idx === dateIdx || idx === ownerIdx || idx === statusIdx)
            );
        };

        // Process KR and OS data
        const krHeader = data_all.headerKR;
        const osHeader = data_all.headerOS;
        const krValues = data_all.valuesKR;
        const osValues = data_all.valuesOS;
        
        const kr_final_arr = processRFQData(krHeader, krValues, 'Date', 'Owner', 'Status', targetUser);
        const os_final_arr = processRFQData(osHeader, osValues, 'RFQ Date', 'Owner', 'Status', targetUser);

        return { KR: kr_final_arr, OS: os_final_arr };
    });
}

function getRFQOverview() {

    var data_all = getFilteredRFQ();
    var dateBounds = getDateRangeBounds_();

    // Shared constants
    const periods = ['Weekly', 'Monthly', 'Quarterly', 'Yearly'];
    const statuses = ['Bidding', 'Pending', 'Ordered', 'Pass', 'Failed', 'Delete', 'Unselected', 'Overall'];
    const periodChecks = {
        Weekly: [dateBounds.weekStart, dateBounds.weekEnd],
        Monthly: [dateBounds.monthStart, dateBounds.monthEnd],
        Quarterly: [dateBounds.quarterStart, dateBounds.quarterEnd],
        Yearly: [dateBounds.yearStart, dateBounds.yearEnd],
    };

    const createPeriodObject = () =>
        Object.fromEntries(periods.map(period => [period, Object.fromEntries(statuses.map(status => [status, 0]))]));

    // Helper function to process data
    const processRFQData = (headerValues, bodyValues, dateCol, ownerCol, statusCol, targetUser) => {
        const final_obj = {
            Your: createPeriodObject(),
            Total: createPeriodObject()
        };

        // const headerValues = values[0];
        // const bodyValues = values.slice(1);

        // Get indices
        const dateIdx = headerValues.findIndex(val => val === dateCol);
        const ownerIdx = headerValues.findIndex(val => val === ownerCol);
        const statusIdx = headerValues.findIndex(val => val === statusCol);

        // Helper to increment counts
        const incrementCounts = (obj, period, status) => {
            obj[period][status]++;
            obj[period]['Overall']++;
        };

        // O(n) duplicate filtering by RFQ ID (first column)
        const filteredValues = getUniqueRowsById_(bodyValues);

        // Process data
        filteredValues.forEach(arr => {
            const status = arr[statusIdx] || "Unselected";// || "Unselected"
            if (status !== 'Terminate') { //status && status !== 'Delete' && 
                const date = parseRfqMoment_(arr[dateIdx]);
                if (date) {
                    periods.forEach(period => {
                        const [start, end] = periodChecks[period];
                        if (date.isBetween(start, end, 'day', '[]')) {
                            if (arr[ownerIdx] === targetUser) {
                                incrementCounts(final_obj['Your'], period, status);
                            }
                            incrementCounts(final_obj['Total'], period, status);
                        }
                    });
                }
            }
        });

        return final_obj;
    };

    // Process KR and OS data
    const krHeader = data_all.headerKR;
    const osHeader = data_all.headerOS;
    const krValues = data_all.valuesKR;
    const osValues = data_all.valuesOS;
    // const krValues = getRFQ();
    // const osValues = getRFQOS().dataArray;
    const targetUser = getActiveUserName();
    //const targetUser = 'Y';

    const kr_obj = processRFQData(krHeader, krValues, 'Date', 'Owner', 'Status', targetUser);
    const os_obj = processRFQData(osHeader, osValues, 'RFQ Date', 'Owner', 'Status', targetUser);

    // Build range object
    const range_obj = Object.fromEntries(
        periods.map(period => {
            const [start, end] = periodChecks[period];
            return [period, `${start} ~ ${end}`];
        })
    );

    return { KR: kr_obj, OS: os_obj, Range: range_obj };
}

// RFQ List_OS 시트의 병합된 데이터 정보 불러옴
function getMergedRFQOS(){
  return withCachedJson_(MERGED_RFQ_OS_CACHE_KEY, LOOKUP_CACHE_TTL_SECONDS, function() {
    var spreadSheetId = "1ao6DE6aQ4Iy8hgaFs5iyYxY2ZurYRjTtvmKHuUefsnY";
    var sheetName = "Peter_Test_OS";

    var doc = openSpreadsheetCached_(spreadSheetId);
    var sheet = doc.getSheetByName(sheetName);


    // Get all merged ranges in the sheet
    var mergedRanges = sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).getMergedRanges();

    var mergedInfo = [];

    // Loop over the merged ranges to collect merged cell information
    mergedRanges.forEach(function(range) {
      var startRow = range.getRow() - 1; // Adjust for 0-based index
      var startCol = range.getColumn() - 1; // Adjust for 0-based index
      var rowspan = range.getNumRows();
      //var colspan = range.getNumColumns();

      mergedInfo.push({
        row: startRow, 
        col: startCol, 
        rowspan: rowspan, 
        //colspan: colspan
      });
    });
    
    var getSpreadsheet = function() {return mergedRanges};
    retry_(getSpreadsheet, numRetries);
  
    return mergedInfo;
  });
}

//vendor cost 시트 데이터 불러옴
function getVendors(){
  var spreadSheetId = "1pWFTXnpKhO6VOzHT7KsjrUPxmKFwfQdlatTKmWvTjUk"; //CHANGE
  // var dataRange     = "list!A:XX"; //CHANGE
 
  // var range   = Sheets.Spreadsheets.Values.get(spreadSheetId,dataRange);
  
  // var values  = range.values;

  var sheetName1 = "Vendor List";
  //var sheetName2 = "pp/sop";

  var doc = openSpreadsheetCached_(spreadSheetId);

  var sheet1 = doc.getSheetByName(sheetName1);
  //var sheet2 = doc.getSheetByName(sheetName2);

  var rangeValues1 = sheet1.getDataRange();
  //var values = rangeValues.getValues();
  var values1 = rangeValues1.getDisplayValues();
  //var rangeValues2 = sheet2.getDataRange();
  //var values2 = rangeValues2.getDisplayValues();

  var filledValues = values1.filter(arr => !arr.every(e => e === ""));
  
  var getSpreadsheet = function() {return filledValues};
  retry_(getSpreadsheet, numRetries);
 
  return filledValues;
}


function getGmailEmails() {
  var userId = Session.getActiveUser().getEmail(); // Please modify this, if you want to use other userId.
  var threadList = Gmail.Users.Threads.list(userId).threads;
  
  var data_messages_arr = [];

  const getUrlPartsMessages = () => {
    const metadata = ['Subject', 'From', 'To'].map((key) => `metadataHeaders=${key}`).join('&');
    const data = {
      fields: 'messages(payload/headers)',
      //fields: 'payload/headers',
      format: `metadata`
    };
    const fields = Object.entries(data)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    return `${fields}&${metadata}`;
  };
  const urlPartsMessages = getUrlPartsMessages();
  while(threadList.length){
    var body = threadList.splice(0,20).map(function(e){
        return {
            method: "GET",
            endpoint: "https://www.googleapis.com/gmail/v1/users/" + userId + "/threads/" + e.id + "?" + urlPartsMessages
        }
    }).filter(v => v !== undefined);
    //Logger.log(body)
    var url = "https://www.googleapis.com/batch/gmail/v1";
    //var boundary = "xxxxxxxxxx";
    var boundary = "batch_foobarbaz";
    var contentId = 0;
    var data = "--" + boundary + "\r\n";
    for (var i in body) {
      data += "Content-Type: application/http\r\n";
      data += "Content-ID: " + ++contentId + "\r\n\r\n";
      data += body[i].method + " " + body[i].endpoint + "\r\n\r\n";
      data += "--" + boundary + "\r\n";
    }
    var payload = Utilities.newBlob(data).getBytes();
    var options = {
      method: "post",
      contentType: "multipart/mixed; boundary=" + boundary,
      payload: payload,
      headers: {'Authorization': 'Bearer ' + ScriptApp.getOAuthToken()},
      muteHttpExceptions: true,
    };

    var res = UrlFetchApp.fetch(url, options).getContentText();
    var dat = res.split("--batch");
    var result = dat.slice(1, dat.length - 1).map(function(e){return e.match(/{[\S\s]+}/g)[0]});
    var threads = JSON.parse(JSON.stringify(result));
    var filteredThreads = threads.filter(val => val.includes('payload'));
    //var threadsError = threads.filter(val => val.includes('error'));
    //Logger.log(threadsError.length

    filteredThreads.forEach((thread) => {
      var data_messages = JSON.parse(thread);
      var messageCount = data_messages.messages.length;
      //Logger.log(data_messages)

      data_messages.messages[messageCount - 1].payload.headers.forEach((header) => {
      //data_messages.payload.headers.forEach((header) => {
        if(header.name == "Subject"){
          subject = header.value.replaceAll(/Re: |Fwd: |FW: |\[FW\]|\[RE\]/ig,'');
        }
        if(header.name == "From"){
          if(header.value.includes('@')){
            
            sender = header.value.split(" <")[0].replaceAll(/"|'|<|>| *\([^)]*\) */ig,'');
            if(/(?=.*[A-Za-z])(?=.*[ㄱ-ㅣ가-힣]).*/.test(sender)) { sender = sender.replaceAll(/[^ㄱ-ㅣ가-힣]*/ig,''); }
            if(/^[ㄱ-ㅣ가-힣 ]+$/.test(sender)) { sender = sender.replaceAll(' ',''); }
            sender_client = header.value.includes(' <') ? header.value.split(" <")[1].split("@")[1].split(".")[0] : header.value.split("@")[1].split(".")[0];
          }
        }
        if(header.name == "To"){
          if(header.value.includes('@')){
            
            receiver = header.value.split(" <")[0].replaceAll(/"|'|<|>| via sales-kr| *\([^)]*\) */ig,'');
            if(/(?=.*[A-Za-z])(?=.*[ㄱ-ㅣ가-힣]).*/.test(receiver)) { receiver = receiver.replaceAll(/[^ㄱ-ㅣ가-힣]*/ig,''); }
            if(/^[ㄱ-ㅣ가-힣 ]+$/.test(receiver)) { receiver = receiver.replaceAll(' ',''); }
            receiver_client = header.value.includes(' <') ? header.value.split(" <")[1].split("@")[1].split(".")[0] : header.value.split("@")[1].split(".")[0];
          }
        }
      });

        
          var sender_check = sender.includes('@') ? sender.split("@")[0] : sender;
          data_messages_arr.push({ subject:subject, sender:sender_check, client:sender_client });
        
      
    });
  }
  //Logger.log(Session.getActiveUser())
  return data_messages_arr;
}

function getActiveUserEmail() {
  return Session.getActiveUser().getEmail().split("@")[0];
}

function getActiveUserName() {
  var userKey = Session.getActiveUser().getEmail() || 'anonymous';
  return withCachedJson_('active-user-name:' + userKey, ACTIVE_USER_NAME_CACHE_TTL_SECONDS, function() {
    const aboutData = Drive.About.get({
        fields: "user,storageQuota,importFormats,exportFormats"
      });
    const userName = aboutData["user"]["displayName"];
    const userEmail = aboutData["user"]["emailAddress"];
    return userName ? userName : userEmail.split("@")[0];
  });
  //Logger.log(emailToOwner[Session.getActiveUser().getEmail().split("@")[0]]);
  //return emailToOwner[Session.getActiveUser().getEmail().split("@")[0]];
}

// 현재 QQ 페이지의 URL을 반환 | RETURNS CURRENT URL
// function getScriptURL() {
//   return ScriptApp.getService().getUrl();
// }
function getScriptURL(qs = null) {
  var url = ScriptApp.getService().getUrl();
  if(qs){
    if (qs.indexOf("?") === -1) {
      qs = "?" + qs;
    }
    url = url + qs;
  }
  return url;
}
 
// Index 파일에 JS & CSS 파일을 포함 시킴 | INCLUDE JAVASCRIPT AND CSS FILES
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}

// 함수: retry_
// 목적: 지정된 횟수만큼 함수를 재시도하고 실패 시 예외를 처리
// Parameters:
//   - func: 재시도할 함수
//   - numRetries: 재시도 횟수
//   - optLoggerFunction: 로그 기능을 제공하는 선택적 함수
function retry_(func, numRetries, optLoggerFunction) {
   // Ensure the number of retries is valid
  if (numRetries < 1) {
    throw new Error("Invalid number of retries: " + numRetries);
  }
  
  // Use default logger if none is provided
  optLoggerFunction = optLoggerFunction || function(msg) { Logger.log(msg); };

  for (var n = 0; n < numRetries; n++) {
    try {
      // 함수 실행 시도
      return func();
    } catch (e) {
      // 실패한 경우 예외 처리
      // if (optLoggerFunction) {
      //   optLoggerFunction("GASRetry " + n + ": " + e);
      // }
      // Log the error if a logger function is provided
      optLoggerFunction("Retry attempt " + (n + 1) + " failed: " + e.toString());
      
      if (n == (numRetries - 1)) {
        // 마지막 재시도에서도 실패하면 예외를 던짐
        //throw JSON.stringify(catchToObject_(e));
        // On the last retry, throw the error with more context
        throw new Error("Function failed after " + numRetries + " retries: " + e.toString());
      }

      // Exponential backoff with random jitter
      var waitTime = (Math.pow(2, n) * 1000) + Math.round(Math.random() * 1000);
      Utilities.sleep(waitTime);
    }    
  }
}

// 함수: spliceIntoChunks
// 목적: 배열을 지정된 크기의 청크로 나누어 반환
// Parameters:
//   - arr: 나눌 배열
//   - chunkSize: 청크 크기
function spliceIntoChunks(arr, chunkSize) {
    const res = [];
    while (arr.length > 0) {
        // 배열을 지정된 크기의 청크로 나누기
        const chunk = arr.splice(0, chunkSize);
        res.push(chunk);
    }
    return res;
}
