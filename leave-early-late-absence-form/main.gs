var spreadSheetUrl = "https://docs.google.com/spreadsheets/d/10qshza8BV6tStSWKHcAfgBaMk6S4VLffQW-iYnPX5Jw/edit#gid=0";

function myFunction() {
  //var html = HtmlService.createHtmlOutputFromFile("message").getContent();
  GmailApp.sendEmail(
    'to@hogehogetest.jp',
    'Test Subject',
    'Test Body',
    {
      from: 'from@hogehogetest.jp',
      htmlBody: ""
    }
  );
}

function sendOldDateErrorMessageEmail() {

}

function formResponseReceiver() {
  var form                                          = FormApp.getActiveForm();
  var formResponses                                 = form.getResponses();
  var lastFormResponse                              = formResponses[ formResponses.length-1 ];
  var lastFormSender                                = lastFormResponse.getRespondentEmail();
  var lastFormItems                                 = lastFormResponse.getItemResponses();
  var lastFormItemsLen                              = lastFormItems.length;
  var lastFormSenderAndItemTrimTitles               = [];
  var lastFormSenderAndItemTrimAndParseIntResponses = [];
  var lastSenderAndFormItemsLen                     = lastFormItemsLen + 1;
  var usingSheet                                    = SpreadsheetApp.openByUrl( spreadSheetUrl ).getSheetByName('form_data');
  var usingSheetValues                              = usingSheet.getDataRange().getValues();
  var usingSheetValuesLen                           = usingSheetValues.length;
  var thisPostAlreadyExists                         = false;
  var changeNotRequiredItems                        = false;
  var scriptDate                                    = new Date();
  var scriptDateMonth                               = scriptDate.getMonth() + 1;
  var scriptDateCount                               = scriptDate.getDate();
  var isThisMonthFuture                             = false;
  var requiredTitles                                = ['メールアドレス', 'ご用件', '予定日(月)', '予定日(日)'];
  var requiredTitlesLen                             = requiredTitles.length;
  var oldDateError                                  = false;
  lastFormSenderAndItemTrimTitles[0]               = 'メールアドレス';
  lastFormSenderAndItemTrimAndParseIntResponses[0] = lastFormSender;
  for (var i = 0; i < lastFormItemsLen; i++) {
    var lastFormItem                  = lastFormItems[i];
    var lastFormSenderAndItemResponse = lastFormItem.getResponse();
    lastFormSenderAndItemTrimTitles[i+1]               = lastFormItem.getItem().getTitle().trim();
    lastFormSenderAndItemTrimAndParseIntResponses[i+1] = isFinite(lastFormSenderAndItemResponse) ? parseInt(lastFormSenderAndItemResponse) : lastFormSenderAndItemResponse.trim();
    if('予定日(月)' === lastFormSenderAndItemTrimTitles[i+1] && scriptDateMonth !== lastFormSenderAndItemTrimAndParseIntResponses[i+1] && scriptDateMonth > lastFormSenderAndItemTrimAndParseIntResponses[i+1]) {
      sendOldDateErrorMessageEmail( lastFormSender );
      oldDateError = true;
      break;
    }
    if('予定日(月)' === lastFormSenderAndItemTrimTitles[i+1] && scriptDateMonth !== lastFormSenderAndItemTrimAndParseIntResponses[i+1] && scriptDateMonth > lastFormSenderAndItemTrimAndParseIntResponses[i+1]) isThisMonthFuture = true;
    if(!isThisMonthFuture && '予定日(日)' === lastFormSenderAndItemTrimTitles[i+1] && scriptDateCount !== lastFormSenderAndItemTrimAndParseIntResponses[i+1] && scriptDateCount > lastFormSenderAndItemTrimAndParseIntResponses[i+1]) {
      sendOldDateErrorMessageEmail( lastFormSender );
      oldDateError = true;
      break;
    }
  }

  if(!oldDateError) {
    for (var i = 0; i < lastSenderAndFormItemsLen; i++) if(!usingSheetValues[0][i] || usingSheetValues[0][i] === undefined || usingSheetValues[0][i] === null || usingSheetValues[0][i].trim() !== lastFormSenderAndItemTrimTitles[i]) usingSheet.getRange(1, i+1).setValue( lastFormSenderAndItemTrimTitles[i] );

    alreadyHaveThisPost: for (var i = 1; i < usingSheetValuesLen; i++) {
      var valuesMatchCount         = 0;
      var requiredValuesMatchCount = 0;
      for (var j = 0; j < lastSenderAndFormItemsLen; j++) {
        var usingSheetParseIntValue        = (!usingSheetValues[i][j]  || usingSheetValues[i][j]  === undefined || usingSheetValues[i][j]  === null || !isFinite(usingSheetValues[i][j])) ? usingSheetValues[i][j]  : parseInt( usingSheetValues[i][j] );
        var usingSheetParseIntAndTrimValue = (!usingSheetParseIntValue || usingSheetParseIntValue === undefined || usingSheetParseIntValue === null || isFinite(usingSheetParseIntValue)) ? usingSheetParseIntValue : usingSheetParseIntValue.trim();
        if(usingSheetParseIntAndTrimValue === lastFormSenderAndItemTrimAndParseIntResponses[j]) valuesMatchCount++;
        if(requiredTitles[j] === lastFormSenderAndItemTrimTitles[j] && usingSheetParseIntAndTrimValue === lastFormSenderAndItemTrimAndParseIntResponses[j]) requiredValuesMatchCount++;
      }
      if(valuesMatchCount === j) {
        thisPostAlreadyExists = true;
        break alreadyHaveThisPost;
      }
      if(requiredValuesMatchCount === requiredTitlesLen) {
        changeNotRequiredItems = true;
        var targetRowNumberOnUsingSheet         = i + 1;
        var startTargetColumnNumberOnUsingSheet = requiredTitlesLen + 1;
        var  lastTargetColumnNumberOnUsingSheet = j;
        break alreadyHaveThisPost;
      }
    }

    if(!thisPostAlreadyExists) {
      usingSheet.appendRow( lastFormSenderAndItemTrimAndParseIntResponses );
    }

    if(changeNotRequiredItems) {
      for (var i = startTargetColumnNumberOnUsingSheet; i <= lastTargetColumnNumberOnUsingSheet; i++) {
        usingSheet.getRange(targetRowNumberOnUsingSheet, i).setValue( lastFormSenderAndItemTrimAndParseIntResponses[i-1] );
      }
    }
  }

}
