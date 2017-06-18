var webListFromStorage = {}
var totalHistory = 0;

chrome.storage.sync.get(null, function (data) {

  webListFromStorage = data
  console.log('webListFromStorage', webListFromStorage)
})

var clearTarget = function () {
  chrome.storage.sync.clear(function () {
    if (chrome.runtime.error) {
      console.log("Runtime error.")
    }
  })
  alert('chrome sync is cleared')
}

document.addEventListener('DOMContentLoaded', function () {
  var link = document.getElementById('clear')
  link.addEventListener('click', function () {
    clearTarget()
  })
})

document.body.onload = function () {
  chrome.storage.sync.get('data', function (items) {
    if (!chrome.runtime.error) {
      websiteList = items
    }
  })
}

var submitInput = function () {
  var websiteVal = document.getElementById('websitebox').value
  var targetVal = document.getElementById('quantitybox').value
  var newTargetObj = {}
  newTargetObj[websiteVal] = targetVal * 7
  chrome.storage.sync.set(newTargetObj, function () {
    if (chrome.runtime.error) {
      console.log('Runtime error.')
    }
  })
}

document.addEventListener('DOMContentLoaded', function () {
  var link = document.getElementById('link')
  link.addEventListener('click', function () {
    submitInput()
  })
})

// Event listner for clicks on links in a browser action popup.
// Open the link in a new tab of the current window.
function onAnchorClick(event) {
  chrome.tabs.create({
    selected: true,
    url: event.srcElement.href
  });
  return false;
}

// Given an array of URLs, build a DOM list of those URLs in the
// browser action popup.
function buildPopupDom(divName, data) {
  var popupDiv = document.getElementById(divName)

  //to be replace the previous code block
  var ul = document.createElement('ul')
  var h8 = document.createElement('h8')
  var h8Text= document.createTextNode('Total VisitCount: ' + totalHistory)
  h8.appendChild(h8Text)
  popupDiv.appendChild(h8)
  popupDiv.appendChild(ul)
  for (var key in data) {
    var li = document.createElement('li')
    var content = document.createTextNode(key + ' : ' + data[key]+ ' (target' + ' ' + webListFromStorage[key] + ')')
    li.appendChild(content)
    var dataDecideColour = data[key]/webListFromStorage[key]
    if (dataDecideColour <= 0.5){
      li.style.color = 'red'
    } else if (dataDecideColour <= 1){
      li.style.color = 'blue'
    } else if (dataDecideColour > 1){
      li.style.color = 'green'
    }
    ul.appendChild(li)
  }
}

// Search history to find up to ten links that a user has typed in,
// and show those links in a popup.
function buildUrlList(divName) {
  // To look for history items visited in the last week,
  // subtract a week of microseconds from the current time.
  // var microsecondsPerDay = 1000 * 60 * 60 * 24;
  // var oneWeekAgo = (new Date).getTime() - microsecondsPerDay * 5;

  //search for History starting from every SUNDAY midnight
  var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
  var startTime = (new Date).getTime() - microsecondsPerWeek;
  console.log('startTime', startTime)


  // let standardTime = new Date()
  // standardTime.setHours(0, 0, 1)

  // let startTime = standardTime
  // startTime.setDate(standardTime.getDate() - ((new Date()).getDay() - 1));
  // let StartTimeUnix = Math.round(startTime.getTime() / 1000)
  // console.log('starTIME',startTime)
  // Track the number of callbacks from chrome.history.getVisits()
  // that we expect to get.  When it reaches zero, we have all results.

  let urlToCount = {}
  let returnResult = {}

  chrome.history.search({
      text: '', // Return every history item....
      startTime: startTime,
      maxResults: 10000000
    },
    function (historyItems) {
      console.log('historyItems', historyItems)
      // For each history item, get details on all visits.
      for (var i = 0; i < historyItems.length; ++i) {
        var url = historyItems[i].url;
        if (!urlToCount[url]) {
          urlToCount[url] = 1;
        }
        totalHistory += historyItems[i].visitCount
        urlToCount[url] += historyItems[i].visitCount
      }
      onAllVisitsProcessed()
    }
  )

  function onAllVisitsProcessed() {
    for (var key in webListFromStorage) {
      let visitCount = 0
      for (var url in urlToCount) {
        if (url.includes(key)) {
          visitCount += urlToCount[url]
        }
      }
      returnResult[key] = visitCount
    }
    buildPopupDom(divName, returnResult)
  }
}

document.addEventListener('DOMContentLoaded', function () {
  buildUrlList('buidAdivHere')
})
