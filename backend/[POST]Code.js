/**
 * 아래 doPost 코드는 화면에서 'Save' 또는 'Update' 버튼 클릭 시 작동되며, 입력된 데이터를 'RFQ 리스트' 시트에 넣어준다.
 */

function doPost (e) {
  if (e && e.parameter && e.parameter.api === '1') {
    return handleApiPost_(e);
  }

  // lock 기능은 유저들이 QQ에서 동시에 submit(Update/Save) 했을 때, RFQ 데이터가 RFQ 리스트에 1개씩 순차적으로 저장되도록 함 | When users submit (Update/Save) simultaneously in QQ, the lock function ensures that RFQ data is sequentially saved to the RFQ list, one at a time.
  const lock = LockService.getScriptLock(); //모든 사용자가 코드 섹션을 동시에 실행하지 못하도록 잠금 | Gets a lock that prevents any user from concurrently running a section of code.
  lock.tryLock(10000); //잠금을 획득하려고 시도하며 10초 이후 타임아웃됩니다. | Attempts to acquire the lock, timing out after 10 seconds.
 
  try {
    const rfqType = e.parameter['RFQ type'];
    //const rfqType = 'KR';

    const formType = e.parameter['Last submit type'];
    //const formType = 'save';

    //use for Live Link
    const sheetName = rfqType === 'OS' ? formType === 'save-draft' ? 'RFQ List Draft_OS' : 'RFQ List_OS' : formType === 'save-draft' ? 'RFQ List Draft' : 'RFQ List';
    const spreadSheetId = "1pWFTXnpKhO6VOzHT7KsjrUPxmKFwfQdlatTKmWvTjUk";

    const doc = SpreadsheetApp.openById(spreadSheetId);
    const sheet = doc.getSheetByName(sheetName);

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var totalIdxArr = headers.map((x, idx) => ['Status', 'Last updated', 'Notes', 'Total programming fee', 'Total overlay fee', 'Total other fee', 'Total sales', 'Total GM', 'Total GM (%)', 'Output URL'].includes(x) ? idx + 1 : '').filter(e => e);
    const lastRow = sheet.getLastRow();
    const nextRow = lastRow + 1;
    const lastRange = sheet.getRange(lastRow, 1);
    const lastRFQId = lastRange.isPartOfMerge() ? lastRange.getMergedRanges()[0].getValue() : sheet.getRange(lastRow, 1).getValue() === 'RFQ ID' || sheet.getRange(lastRow, 1).getValue() === 'Draft ID' ? 0 : sheet.getRange(lastRow, 1).getValue();

    //const thisRowVal = sheet.getRange(thisRow, 1, 1, sheet.getLastColumn()).getValues()[0];

    var form = HtmlService.createTemplateFromFile('OpenUrl');

    function saveData(exportURL) {

      var numRows = 1;
      var newRow = [];

      if(rfqType == 'KR') {
        // 저장할 행의 각 열 값을 설정 | Set the value of each column in the row to be saved
        const addRow = headers.map(function (header) {
          // header가 'RFQ ID'인 경우 마지막 RFQ ID 값에 1을 더함, 그 외의 경우는 e.parameters[header] 사용 | If the header is 'RFQ ID', add 1 to the last RFQ ID value; otherwise, use e.parameters[header]
          return header === 'RFQ ID' ? lastRFQId + 1 : header === 'Status' ? 'Bidding' : e.parameters[header];
        });
        newRow.push(addRow);
        //newRow.push([1,2,3]);
        Logger.log(nextRow);
        Logger.log(numRows);
        

        // 저장된 행의 값을 시트에 설정 | Set the values of the saved row in the sheet
        //sheet.getRange(nextRow, 1, numRows, headers.length).setValues(newRow);
      }

      if(rfqType == 'OS') {
        var countryCodeList = e.parameter['Country code list[]'].split(',');
        var outputURL = exportURL || '';
        numRows = countryCodeList.length;
        Logger.log(outputURL)

        countryCodeList.forEach(function(code) {
          // 저장할 행의 각 열 값을 설정 | Set the value of each column in the row to be saved
          const addRow = headers.map(function (header) {
            // header가 'RFQ ID'인 경우 마지막 RFQ ID 값에 1을 더함, 그 외의 경우는 e.parameters[header] 사용 | If the header is 'RFQ ID', add 1 to the last RFQ ID value; otherwise, use e.parameters[header]
            return header === 'RFQ ID' ? lastRFQId + 1 : header === 'GID' ? code : header === 'Status' ? 'Bidding' : header === 'Output URL' ? outputURL : (header === 'Total programming fee' || header === 'Total overlay fee' || header === 'Total other fee' || header === 'Total sales' || header === 'Total GM' || header === 'Total GM (%)') ? e.parameters[header] : e.parameters[header + '-' + code];
            //return header === 'RFQ ID' ? lastRFQId + 1 : e.parameters[header + '-' + code];
          });
          newRow.push(addRow);
          //newRow.push([1,2,3]);
        });
        Logger.log(newRow);
        
      }

      // 저장된 행의 값을 시트에 설정 | Set the values of the saved row in the sheet
      sheet.getRange(nextRow, 1, numRows, headers.length).setValues(newRow);
      //sheet.getRange(nextRow, 1, numRows, 3).setValues(newRow);

      // merge RFQ ID and Total if multiple rows are saved
      if(rfqType == 'OS' && numRows > 1) {
        sheet.getRange(nextRow, 1, numRows, 1).mergeVertically();
        totalIdxArr.forEach(x => sheet.getRange(nextRow, x, numRows, 1).mergeVertically());
      }
    }

    function saveDraft() {

      var numRows = 1;
      var newRow = [];

      if(rfqType == 'KR') {
        // 저장할 행의 각 열 값을 설정 | Set the value of each column in the row to be saved
        const addRow = headers.map(function (header) {
          // header가 'RFQ ID'인 경우 마지막 RFQ ID 값에 1을 더함, 그 외의 경우는 e.parameters[header] 사용 | If the header is 'RFQ ID', add 1 to the last RFQ ID value; otherwise, use e.parameters[header]
          return header === 'Draft ID' ? lastRFQId + 1 : e.parameters[header];
        });
        newRow.push(addRow);

        // 저장된 행의 값을 시트에 설정 | Set the values of the saved row in the sheet
        //sheet.getRange(nextRow, 1, numRows, headers.length).setValues(newRow);
      }

      if(rfqType == 'OS') {
        var countryCodeList = e.parameter['Country code list[]'].split(',');
        numRows = countryCodeList.length;

        countryCodeList.forEach(function(code) {
          // 저장할 행의 각 열 값을 설정 | Set the value of each column in the row to be saved
          const addRow = headers.map(function (header) {
            // header가 'RFQ ID'인 경우 마지막 RFQ ID 값에 1을 더함, 그 외의 경우는 e.parameters[header] 사용 | If the header is 'RFQ ID', add 1 to the last RFQ ID value; otherwise, use e.parameters[header]
            return header === 'Draft ID' ? lastRFQId + 1 : header === 'GID' ? code : (header === 'Total programming fee' || header === 'Total overlay fee' || header === 'Total other fee' || header === 'Total sales' || header === 'Total GM' || header === 'Total GM (%)') ? e.parameters[header] : e.parameters[header + '-' + code];
            //return header === 'RFQ ID' ? lastRFQId + 1 : e.parameters[header + '-' + code];
          });
          newRow.push(addRow);
          //newRow.push([1,2,3]);
        });
        Logger.log(newRow);
        
      }

      // 저장된 행의 값을 시트에 설정 | Set the values of the saved row in the sheet
      sheet.getRange(nextRow, 1, numRows, headers.length).setValues(newRow);
      //sheet.getRange(nextRow, 1, numRows, 3).setValues(newRow);

      // merge RFQ ID and Total if multiple rows are saved
      if(rfqType == 'OS' && numRows > 1) {
        sheet.getRange(nextRow, 1, numRows, 1).mergeVertically();
        totalIdxArr.forEach(x => sheet.getRange(nextRow, x, numRows, 1).mergeVertically());
      }
    }

    function updateData() {
      var numRows = 1;
      var updatedRow = [];
      const thisRFQId = e.parameter['RFQ ID'];
      const thisRow = sheet.getRange('A1:A').createTextFinder(thisRFQId).matchEntireCell(true).findNext().getRow();
      const currentRowValues = sheet.getRange(thisRow, 1, 1, headers.length).getValues()[0]; // Fetch the current row's values

      if(rfqType == 'KR') {
        // 저장할 행의 각 열 값을 설정 | Set the value of each column in the row to be saved
        const updateRow = headers.map(function (header,index) {
          // header가 'RFQ ID'인 경우 마지막 RFQ ID 값에 1을 더함, 그 외의 경우는 e.parameters[header] 사용 | If the header is 'RFQ ID', add 1 to the last RFQ ID value; otherwise, use e.parameters[header]
          return header === 'Last updated' ? new Date() : (header === 'RFQ ID' || header === 'Status' || header === 'Notes') ? currentRowValues[index] : e.parameters[header];
        });
        updatedRow.push(updateRow);

        // 저장된 행의 값을 시트에 설정 | Set the values of the saved row in the sheet
        //sheet.getRange(nextRow, 1, numRows, headers.length).setValues(newRow);
      }

      if(rfqType == 'OS') {
        var countryCodeList = e.parameter['Country code list[]'].split(',');
        numRows = countryCodeList.length;
        const numMergedRows = sheet.getRange(thisRow, 1).isPartOfMerge() ? sheet.getRange(thisRow, 1).getMergedRanges()[0].getNumRows() : 1;

        if(numRows < numMergedRows) {
          const diff = numMergedRows - numRows;
          for(let i=0; i < diff; i++){
            sheet.deleteRow(thisRow + (numMergedRows - 1) - i);
          }
        } else if (numRows > numMergedRows) {
          const diff = numRows - numMergedRows;
          for(let i=0; i < diff; i++){
            sheet.insertRowAfter(thisRow + (numMergedRows - 1) + i);
          }
        }

        countryCodeList.forEach(function(code) {
          // 저장할 행의 각 열 값을 설정 | Set the value of each column in the row to be saved
          const updateRow = headers.map(function (header,index) {
            // header가 'RFQ ID'인 경우 마지막 RFQ ID 값에 1을 더함, 그 외의 경우는 e.parameters[header] 사용 | If the header is 'RFQ ID', add 1 to the last RFQ ID value; otherwise, use e.parameters[header]
            return header === 'Last updated' ? new Date() : header === 'GID' ? code : (header === 'Total programming fee' || header === 'Total overlay fee' || header === 'Total other fee' || header === 'Total sales' || header === 'Total GM' || header === 'Total GM (%)') ? e.parameters[header] : (header === 'RFQ ID' || header === 'Status' || header === 'Notes' || header === 'Output URL') ? currentRowValues[index] : e.parameters[header + '-' + code];
            //return header === 'RFQ ID' ? lastRFQId + 1 : e.parameters[header + '-' + code];
          });
          updatedRow.push(updateRow);
          //updatedRow.push([thisRFQId,'Bidding',code]);
        });
        
      }

      // 저장된 행의 값을 시트에 설정 | Set the values of the saved row in the sheet
      sheet.getRange(thisRow, 1, numRows, headers.length).setValues(updatedRow);
      //sheet.getRange(nextRow, 1, numRows, 3).setValues(newRow);

      // merge RFQ ID and Total if multiple rows are saved
      if(rfqType == 'OS' && numRows > 1) {
        sheet.getRange(thisRow, 1, numRows, 1).mergeVertically();
        totalIdxArr.forEach(x => sheet.getRange(thisRow, x, numRows, 1).mergeVertically());
      }
    }

    function exportData() {

      var countryCodeList = e.parameter['Country code list[]'].split(',');
      var exportFormList = e.parameter['Export form list'].split('||');
      var projectName = e.parameters['Project name (Mail title)-' + countryCodeList[0]];
      var projectType = e.parameters['Project type-' + countryCodeList[0]];
      //var countryCodeList = ['kr','jp'];

      var rows = countryCodeList.length;
      var newRow = [];
      var countriesNameList = [];
      var getValue = (part, o) => Object.entries(o).find(([k, v]) => k.startsWith(part))?.[1];

      countryCodeList.forEach(function(code) {
        // 저장할 행의 각 열 값을 설정 | Set the value of each column in the row to be saved
        const addRow = [e.parameters['Country-' + code],'','',e.parameters['Feasibility-' + code],e.parameters['Proposal CPI-' + code]];
        newRow.push(addRow);
        if (!countriesNameList.includes(e.parameters['Country-' + code])) countriesNameList.push(e.parameters['Country-' + code]);
        //newRow.push([1,2,3])
        //countriesNameList.push('test')
      });

      var countriesName = countriesNameList.length > 5 ? countriesNameList.length + ' countries' : countriesNameList.join(', ');

      var specificFolder = DriveApp.getFolderById('1O4u0rnwU5ukORLJTLyD58sv6aR0xgXr9');
      var date = new Date();
      var formattedDate = getFormatDate(date);
      var file = DriveApp.getFileById('1i9Q4xmM7r_iTxcPe1ZH38rzqz6hmLfsrWybYZbgr8yY');
      var fileCopy = file.makeCopy(`${ formattedDate }_${ exportFormList[0] }_${ countriesName }_${ projectName }`, specificFolder);
      var fileCopyId = fileCopy.getId();
      var fileCopyUrl = fileCopy.getUrl();

      const doc = SpreadsheetApp.openById(fileCopyId);
      const sheet = doc.getSheetByName('Quotation');

      var rowIndex = 22; // Insert rows after row 5
      var numRows = rows - 2;  // Number of rows to insert
      var sourceRange = sheet.getRange("B"+ rowIndex +":G"+ rowIndex);
      

      sheet.getRange('B13').setValue(exportFormList[0]);
      sheet.getRange('B12').setValue(exportFormList[1]);
      sheet.getRange('B4').setValue(exportFormList[2]);
      sheet.getRange('D15').setValue(exportFormList[3] + 'ss/' + exportFormList[4] + ' min');
      sheet.getRange('F19').setValue(exportFormList[5]);
      sheet.getRange('E20').setValue(exportFormList[6]);
      sheet.getRange('G20').setValue(exportFormList[7]);
      sheet.getRange('E21').setValue(exportFormList[8]);
      sheet.getRange('G21').setValue(exportFormList[9]);
      sheet.getRange('D12').setValue(exportFormList[10]);
      sheet.getRange('F12').setValue(exportFormList[11]);
      
      if(numRows > 0){

        sheet.insertRowsAfter(rowIndex,numRows);
        
        // Loop to copy formatting to each newly inserted row
        for (var i = 1; i <= numRows; i++) {
          var destinationRow = rowIndex + i;
          // Get the range of the newly inserted row
          var destinationRange = sheet.getRange("B"+ destinationRow +":G"+ destinationRow);
          Logger.log(destinationRow);
          
          // Copy the format from the row above to the newly inserted row
          sourceRange.copyTo(destinationRange);
          
        }

      }
      // 저장된 행의 값을 시트에 설정 | Set the values of the saved row in the sheet
      sheet.getRange(rowIndex, 2, rows, 5).setValues(newRow);

      return fileCopyUrl;
    }

    // RFQ List에서 'RFQ Status' 변경 시.. | When 'Update' button is clicked in QQ..
    if (formType == 'update-status') {
      const thisRFQId = e.parameter['RFQ ID'];
      const thisRow = sheet.getRange('A1:A').createTextFinder(thisRFQId).matchEntireCell(true).findNext().getRow();
      const changedStatus = e.parameter['RFQ Status'];
      const statusColumnIndex = headers.indexOf('Status') + 1; // Find the 'Status' column
      const lastUpdatedColumnIndex = headers.indexOf('Last updated') + 1; // Find the 'Last updated' column

      sheet.getRange(thisRow, statusColumnIndex, 1, 1).setValue(changedStatus);
      sheet.getRange(thisRow, lastUpdatedColumnIndex, 1, 1).setValue(new Date());
    }

    // if (formType == 'update-crmno') {
    //   const thisRFQId = e.parameter['RFQ ID'];
    //   const thisRow = sheet.getRange('A1:A').createTextFinder(thisRFQId).matchEntireCell(true).findNext().getRow();
    //   const changedCRMNo = e.parameter['CRM No.'];
    //   const crmNoColumnIndex = headers.indexOf('CRM No.') + 1; // Find the 'CRM No.' column
    //   const lastUpdatedColumnIndex = headers.indexOf('Last updated') + 1; // Find the 'Last updated' column

    //   sheet.getRange(thisRow, crmNoColumnIndex, 1, 1).setValue(changedCRMNo);
    //   sheet.getRange(thisRow, lastUpdatedColumnIndex, 1, 1).setValue(new Date());
    // }

    if (formType == 'update-outputurl') {
      const thisRFQId = e.parameter['RFQ ID'];
      const thisRow = sheet.getRange('A1:A').createTextFinder(thisRFQId).matchEntireCell(true).findNext().getRow();
      const changedCRMNo = e.parameter['Output URL'];
      const crmNoColumnIndex = headers.indexOf('Output URL') + 1; // Find the 'Output URL' column
      const lastUpdatedColumnIndex = headers.indexOf('Last updated') + 1; // Find the 'Last updated' column

      sheet.getRange(thisRow, crmNoColumnIndex, 1, 1).setValue(changedCRMNo);
      sheet.getRange(thisRow, lastUpdatedColumnIndex, 1, 1).setValue(new Date());
    }

    if (formType == 'update-comments') {
      const thisRFQId = e.parameter['RFQ ID'];
      const thisRow = sheet.getRange('A1:A').createTextFinder(thisRFQId).matchEntireCell(true).findNext().getRow();
      const changedComments = e.parameter['Notes'];
      const commentsColumnIndex = headers.indexOf('Notes') + 1; // Find the 'Comments' column
      const lastUpdatedColumnIndex = headers.indexOf('Last updated') + 1; // Find the 'Last updated' column

      sheet.getRange(thisRow, commentsColumnIndex, 1, 1).setValue(changedComments);
      sheet.getRange(thisRow, lastUpdatedColumnIndex, 1, 1).setValue(new Date());
    }

    // QQ에서 'Update' 버튼 클릭 시.. | When 'Update' button is clicked in QQ..
    if (formType == 'update') {
      updateData();
    }

    // QQ에서 'Save' 버튼 클릭 시.. | When 'Save' button is clicked in QQ..
    if (formType == 'save') {
      saveData();
    }

    if (formType == 'save-draft') {
      saveDraft();
    }

    if (formType == 'export') {
      var exportURL = exportData();
      form.url = exportURL;
      
      return form.evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); // Ensure the page is allowed to open new tabs
    }

    if (formType == 'save-export') {
      var exportURL = exportData();
      saveData(exportURL);
      form.url = exportURL;
      
      return form.evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); // Ensure the page is allowed to open new tabs
    }
    
    // return ContentService
    //   .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow }))
    //   .setMimeType(ContentService.MimeType.JSON);
    //return HtmlService.createHtmlOutputFromFile('[HTML]Success.html').setTitle('QuickQ (QQ) - Success');
  }
  
  // 오류 발생 시 처리 | Handle errors if they occur
  catch (err) {
    return ContentService
      .createTextOutput(String(err))
      .setMimeType(ContentService.MimeType.TEXT);
  }
 
  finally {
    lock.releaseLock(); //잠금을 해제하여 잠금에서 대기 중인 다른 프로세스가 계속되도록 허용합니다. | Releases the lock, allowing other processes waiting on the lock to continue.
  }
}

function handleApiPost_(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const rfqType = e.parameter['RFQ type'];
    const formType = e.parameter['Last submit type'];
    var result = null;

    if (!rfqType) {
      throw new Error("Missing required field: RFQ type");
    }
    if (!formType) {
      throw new Error("Missing required field: Last submit type");
    }

    if (formType === 'update-status') {
      updateStatusOnly_(e);
      result = { action: 'update-status' };
    } else if (formType === 'update-comments') {
      updateCommentsOnly_(e);
      result = { action: 'update-comments' };
    } else if (formType === 'update-outputurl') {
      updateOutputUrlOnly_(e);
      result = { action: 'update-outputurl' };
    } else if (formType === 'save') {
      result = saveRfqOnly_(e);
    } else if (formType === 'save-draft') {
      result = saveDraftOnly_(e);
    } else if (formType === 'update') {
      result = updateRfqOnly_(e);
    } else if (formType === 'export') {
      result = exportRfqOnly_(e);
    } else if (formType === 'save-export') {
      result = saveExportRfqOnly_(e);
    } else {
      throw new Error("Unsupported POST action: " + formType);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, data: result }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function getTargetSheetForPost_(rfqType, formType) {
  const sheetName =
    rfqType === 'OS'
      ? (formType === 'save-draft' ? 'RFQ List Draft_OS' : 'RFQ List_OS')
      : (formType === 'save-draft' ? 'RFQ List Draft' : 'RFQ List');

  const spreadSheetId = "1pWFTXnpKhO6VOzHT7KsjrUPxmKFwfQdlatTKmWvTjUk";
  const doc = SpreadsheetApp.openById(spreadSheetId);
  return doc.getSheetByName(sheetName);
}

function getPostSheetContext_(rfqType, formType) {
  const sheet = getTargetSheetForPost_(rfqType, formType);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const totalIdxArr = headers
    .map(function (header, index) {
      return ['Status', 'Last updated', 'Notes', 'Total programming fee', 'Total overlay fee', 'Total other fee', 'Total sales', 'Total GM', 'Total GM (%)', 'Output URL'].includes(header)
        ? index + 1
        : '';
    })
    .filter(function (value) { return value; });
  const lastRow = sheet.getLastRow();
  const nextRow = lastRow + 1;
  const lastRange = sheet.getRange(lastRow, 1);
  const lastCellValue = sheet.getRange(lastRow, 1).getValue();
  const lastId = lastRange.isPartOfMerge()
    ? lastRange.getMergedRanges()[0].getValue()
    : (lastCellValue === 'RFQ ID' || lastCellValue === 'Draft ID' ? 0 : lastCellValue);

  return {
    sheet: sheet,
    headers: headers,
    totalIdxArr: totalIdxArr,
    nextRow: nextRow,
    lastId: Number(lastId) || 0,
  };
}

function findRowByRfqId_(sheet, rfqId) {
  const found = sheet.getRange('A1:A').createTextFinder(rfqId).matchEntireCell(true).findNext();
  if (!found) {
    throw new Error("RFQ ID not found: " + rfqId);
  }
  return found.getRow();
}

function getHeaderIndexMap_(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = {};
  headers.forEach(function (header, index) {
    map[header] = index + 1;
  });
  return map;
}

function updateStatusOnly_(e) {
  const rfqType = e.parameter['RFQ type'];
  const rfqId = e.parameter['RFQ ID'];
  const status = e.parameter['RFQ Status'];

  if (!rfqId) throw new Error("Missing RFQ ID");
  if (!status) throw new Error("Missing RFQ Status");

  const sheet = getTargetSheetForPost_(rfqType, 'save');
  const row = findRowByRfqId_(sheet, rfqId);
  const columns = getHeaderIndexMap_(sheet);

  if (!columns['Status']) throw new Error("Status column not found");
  if (!columns['Last updated']) throw new Error("Last updated column not found");

  if (sheet.getRange(row, 1).isPartOfMerge()) {
    const merged = sheet.getRange(row, 1).getMergedRanges()[0];
    sheet.getRange(merged.getRow(), columns['Status'], merged.getNumRows(), 1).setValue(status);
    sheet.getRange(merged.getRow(), columns['Last updated'], merged.getNumRows(), 1).setValue(new Date());
  } else {
    sheet.getRange(row, columns['Status']).setValue(status);
    sheet.getRange(row, columns['Last updated']).setValue(new Date());
  }
}

function updateCommentsOnly_(e) {
  const rfqType = e.parameter['RFQ type'];
  const rfqId = e.parameter['RFQ ID'];
  const notes = e.parameter['Notes'] || '';

  if (!rfqId) throw new Error("Missing RFQ ID");

  const sheet = getTargetSheetForPost_(rfqType, 'save');
  const row = findRowByRfqId_(sheet, rfqId);
  const columns = getHeaderIndexMap_(sheet);

  if (!columns['Notes']) throw new Error("Notes column not found");
  if (!columns['Last updated']) throw new Error("Last updated column not found");

  if (sheet.getRange(row, 1).isPartOfMerge()) {
    const merged = sheet.getRange(row, 1).getMergedRanges()[0];
    sheet.getRange(merged.getRow(), columns['Notes'], merged.getNumRows(), 1).setValue(notes);
    sheet.getRange(merged.getRow(), columns['Last updated'], merged.getNumRows(), 1).setValue(new Date());
  } else {
    sheet.getRange(row, columns['Notes']).setValue(notes);
    sheet.getRange(row, columns['Last updated']).setValue(new Date());
  }
}

function updateOutputUrlOnly_(e) {
  const rfqId = e.parameter['RFQ ID'];
  const outputUrl = e.parameter['Output URL'] || '';

  if (!rfqId) throw new Error("Missing RFQ ID");

  const sheet = getTargetSheetForPost_('OS', 'save');
  const row = findRowByRfqId_(sheet, rfqId);
  const columns = getHeaderIndexMap_(sheet);

  if (!columns['Output URL']) throw new Error("Output URL column not found");
  if (!columns['Last updated']) throw new Error("Last updated column not found");

  if (sheet.getRange(row, 1).isPartOfMerge()) {
    const merged = sheet.getRange(row, 1).getMergedRanges()[0];
    sheet.getRange(merged.getRow(), columns['Output URL'], merged.getNumRows(), 1).setValue(outputUrl);
    sheet.getRange(merged.getRow(), columns['Last updated'], merged.getNumRows(), 1).setValue(new Date());
  } else {
    sheet.getRange(row, columns['Output URL']).setValue(outputUrl);
    sheet.getRange(row, columns['Last updated']).setValue(new Date());
  }
}

function saveRfqOnly_(e, exportURL) {
  const rfqType = e.parameter['RFQ type'];
  const context = getPostSheetContext_(rfqType, 'save');
  const sheet = context.sheet;
  const headers = context.headers;
  const totalIdxArr = context.totalIdxArr;
  const nextRow = context.nextRow;
  const nextRfqId = context.lastId + 1;
  var numRows = 1;
  var newRows = [];

  if (rfqType === 'KR') {
    const addRow = headers.map(function (header) {
      return header === 'RFQ ID' ? nextRfqId : header === 'Status' ? 'Bidding' : e.parameters[header];
    });
    newRows.push(addRow);
  } else if (rfqType === 'OS') {
    const countryCodeListRaw = e.parameter['Country code list[]'];
    if (!countryCodeListRaw) {
      throw new Error("Missing Country code list[]");
    }
    const countryCodeList = countryCodeListRaw.split(',');
    const outputURL = exportURL || e.parameter['Output URL'] || '';
    numRows = countryCodeList.length;

    countryCodeList.forEach(function (code) {
      const addRow = headers.map(function (header) {
        return header === 'RFQ ID'
          ? nextRfqId
          : header === 'GID'
            ? code
            : header === 'Status'
              ? 'Bidding'
              : header === 'Output URL'
                ? outputURL
                : (header === 'Total programming fee' || header === 'Total overlay fee' || header === 'Total other fee' || header === 'Total sales' || header === 'Total GM' || header === 'Total GM (%)')
                  ? e.parameters[header]
                  : e.parameters[header + '-' + code];
      });
      newRows.push(addRow);
    });
  } else {
    throw new Error("Unsupported RFQ type: " + rfqType);
  }

  sheet.getRange(nextRow, 1, numRows, headers.length).setValues(newRows);

  if (rfqType === 'OS' && numRows > 1) {
    sheet.getRange(nextRow, 1, numRows, 1).mergeVertically();
    totalIdxArr.forEach(function (columnIndex) {
      sheet.getRange(nextRow, columnIndex, numRows, 1).mergeVertically();
    });
  }

  return { action: 'save', id: nextRfqId, rowsWritten: numRows };
}

function saveDraftOnly_(e) {
  const rfqType = e.parameter['RFQ type'];
  const context = getPostSheetContext_(rfqType, 'save-draft');
  const sheet = context.sheet;
  const headers = context.headers;
  const totalIdxArr = context.totalIdxArr;
  const nextRow = context.nextRow;
  const nextDraftId = context.lastId + 1;
  var numRows = 1;
  var newRows = [];

  if (rfqType === 'KR') {
    const addRow = headers.map(function (header) {
      return header === 'Draft ID' ? nextDraftId : e.parameters[header];
    });
    newRows.push(addRow);
  } else if (rfqType === 'OS') {
    const countryCodeListRaw = e.parameter['Country code list[]'];
    if (!countryCodeListRaw) {
      throw new Error("Missing Country code list[]");
    }
    const countryCodeList = countryCodeListRaw.split(',');
    numRows = countryCodeList.length;

    countryCodeList.forEach(function (code) {
      const addRow = headers.map(function (header) {
        return header === 'Draft ID'
          ? nextDraftId
          : header === 'GID'
            ? code
            : (header === 'Total programming fee' || header === 'Total overlay fee' || header === 'Total other fee' || header === 'Total sales' || header === 'Total GM' || header === 'Total GM (%)')
              ? e.parameters[header]
              : e.parameters[header + '-' + code];
      });
      newRows.push(addRow);
    });
  } else {
    throw new Error("Unsupported RFQ type: " + rfqType);
  }

  sheet.getRange(nextRow, 1, numRows, headers.length).setValues(newRows);

  if (rfqType === 'OS' && numRows > 1) {
    sheet.getRange(nextRow, 1, numRows, 1).mergeVertically();
    totalIdxArr.forEach(function (columnIndex) {
      sheet.getRange(nextRow, columnIndex, numRows, 1).mergeVertically();
    });
  }

  return { action: 'save-draft', id: nextDraftId, rowsWritten: numRows };
}

function updateRfqOnly_(e) {
  const rfqType = e.parameter['RFQ type'];
  const rfqId = e.parameter['RFQ ID'];

  if (!rfqId) {
    throw new Error("Missing RFQ ID");
  }

  const context = getPostSheetContext_(rfqType, 'save');
  const sheet = context.sheet;
  const headers = context.headers;
  const totalIdxArr = context.totalIdxArr;
  const thisRow = findRowByRfqId_(sheet, rfqId);
  var numRows = 1;
  var updatedRows = [];
  const currentRowValues = sheet.getRange(thisRow, 1, 1, headers.length).getValues()[0];

  if (rfqType === 'KR') {
    const updateRow = headers.map(function (header, index) {
      return header === 'Last updated'
        ? new Date()
        : (header === 'RFQ ID' || header === 'Status' || header === 'Notes')
          ? currentRowValues[index]
          : e.parameters[header];
    });
    updatedRows.push(updateRow);
  } else if (rfqType === 'OS') {
    const countryCodeListRaw = e.parameter['Country code list[]'];
    if (!countryCodeListRaw) {
      throw new Error("Missing Country code list[]");
    }
    const countryCodeList = countryCodeListRaw.split(',');
    const mergedRange = sheet.getRange(thisRow, 1).isPartOfMerge() ? sheet.getRange(thisRow, 1).getMergedRanges()[0] : null;
    const numMergedRows = mergedRange ? mergedRange.getNumRows() : 1;
    numRows = countryCodeList.length;

    if (mergedRange) {
      mergedRange.breakApart();
      totalIdxArr.forEach(function (columnIndex) {
        sheet.getRange(mergedRange.getRow(), columnIndex, numMergedRows, 1).breakApart();
      });
    }

    if (numRows < numMergedRows) {
      const diff = numMergedRows - numRows;
      for (var i = 0; i < diff; i++) {
        sheet.deleteRow(thisRow + (numMergedRows - 1) - i);
      }
    } else if (numRows > numMergedRows) {
      const diff = numRows - numMergedRows;
      for (var j = 0; j < diff; j++) {
        sheet.insertRowAfter(thisRow + (numMergedRows - 1) + j);
      }
    }

    countryCodeList.forEach(function (code) {
      const updateRow = headers.map(function (header, index) {
        return header === 'Last updated'
          ? new Date()
          : header === 'GID'
            ? code
            : (header === 'Total programming fee' || header === 'Total overlay fee' || header === 'Total other fee' || header === 'Total sales' || header === 'Total GM' || header === 'Total GM (%)')
              ? e.parameters[header]
              : (header === 'RFQ ID' || header === 'Status' || header === 'Notes' || header === 'Output URL')
                ? currentRowValues[index]
                : e.parameters[header + '-' + code];
      });
      updatedRows.push(updateRow);
    });
  } else {
    throw new Error("Unsupported RFQ type: " + rfqType);
  }

  sheet.getRange(thisRow, 1, numRows, headers.length).setValues(updatedRows);

  if (rfqType === 'OS' && numRows > 1) {
    sheet.getRange(thisRow, 1, numRows, 1).mergeVertically();
    totalIdxArr.forEach(function (columnIndex) {
      sheet.getRange(thisRow, columnIndex, numRows, 1).mergeVertically();
    });
  }

  return { action: 'update', id: rfqId, rowsWritten: numRows };
}

function exportRfqOnly_(e) {
  const countryCodeListRaw = e.parameter['Country code list[]'];
  const exportFormListRaw = e.parameter['Export form list'];

  if (!countryCodeListRaw) {
    throw new Error("Missing Country code list[]");
  }
  if (!exportFormListRaw) {
    throw new Error("Missing Export form list");
  }

  const countryCodeList = countryCodeListRaw.split(',');
  const exportFormList = exportFormListRaw.split('||');
  const projectName = e.parameters['Project name (Mail title)-' + countryCodeList[0]];
  const rows = countryCodeList.length;
  var newRow = [];
  var countriesNameList = [];

  countryCodeList.forEach(function (code) {
    const addRow = [
      e.parameters['Country-' + code],
      '',
      '',
      e.parameters['Feasibility-' + code],
      e.parameters['Proposal CPI-' + code]
    ];
    newRow.push(addRow);
    if (!countriesNameList.includes(e.parameters['Country-' + code])) {
      countriesNameList.push(e.parameters['Country-' + code]);
    }
  });

  const countriesName = countriesNameList.length > 5 ? countriesNameList.length + ' countries' : countriesNameList.join(', ');
  const specificFolder = DriveApp.getFolderById('1O4u0rnwU5ukORLJTLyD58sv6aR0xgXr9');
  const date = new Date();
  const formattedDate = getFormatDate(date);
  const file = DriveApp.getFileById('1i9Q4xmM7r_iTxcPe1ZH38rzqz6hmLfsrWybYZbgr8yY');
  const fileCopy = file.makeCopy(formattedDate + '_' + exportFormList[0] + '_' + countriesName + '_' + projectName, specificFolder);
  const fileCopyId = fileCopy.getId();
  const fileCopyUrl = fileCopy.getUrl();
  const doc = SpreadsheetApp.openById(fileCopyId);
  const sheet = doc.getSheetByName('Quotation');
  const rowIndex = 22;
  const numRows = rows - 2;
  const sourceRange = sheet.getRange("B" + rowIndex + ":G" + rowIndex);

  sheet.getRange('B13').setValue(exportFormList[0]);
  sheet.getRange('B12').setValue(exportFormList[1]);
  sheet.getRange('B4').setValue(exportFormList[2]);
  sheet.getRange('D15').setValue(exportFormList[3] + 'ss/' + exportFormList[4] + ' min');
  sheet.getRange('F19').setValue(exportFormList[5]);
  sheet.getRange('E20').setValue(exportFormList[6]);
  sheet.getRange('G20').setValue(exportFormList[7]);
  sheet.getRange('E21').setValue(exportFormList[8]);
  sheet.getRange('G21').setValue(exportFormList[9]);
  sheet.getRange('D12').setValue(exportFormList[10]);
  sheet.getRange('F12').setValue(exportFormList[11]);

  if (numRows > 0) {
    sheet.insertRowsAfter(rowIndex, numRows);

    for (var i = 1; i <= numRows; i++) {
      const destinationRow = rowIndex + i;
      const destinationRange = sheet.getRange("B" + destinationRow + ":G" + destinationRow);
      sourceRange.copyTo(destinationRange);
    }
  }

  sheet.getRange(rowIndex, 2, rows, 5).setValues(newRow);

  return { action: 'export', outputUrl: fileCopyUrl, fileId: fileCopyId };
}

function saveExportRfqOnly_(e) {
  const exportResult = exportRfqOnly_(e);
  const saveResult = saveRfqOnly_(e, exportResult.outputUrl);

  return {
    action: 'save-export',
    id: saveResult.id,
    rowsWritten: saveResult.rowsWritten,
    outputUrl: exportResult.outputUrl,
    fileId: exportResult.fileId,
  };
}


/**
 *  YYMMDD 포맷으로 반환
 */
function getFormatDate(date){
    var year = date.getFullYear().toString().slice(-2);    //yy
    var month = (1 + date.getMonth());          //M
    month = month >= 10 ? month : '0' + month;  //month 두자리로 저장
    var day = date.getDate();                   //d
    day = day >= 10 ? day : '0' + day;          //day 두자리로 저장
    return  year + '' + month + '' + day;       
}
