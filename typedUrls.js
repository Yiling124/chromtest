var webListFromStorage = {}

chrome.storage.sync.get(null, function (data) {
  webListFromStorage = data
  console.log('webListFromStorage', webListFromStorage)
})

document.body.onload = function () {
  chrome.storage.sync.get("data", function (items) {
    console.log('storage data type', typeof (items))
    if (!chrome.runtime.error) {
      console.log('items', items)
      websiteList = items
    }
  })
}

var submitInput = function () {
  var websiteVal = document.getElementById('websitebox').value
  var targetVal = document.getElementById('quantitybox').value
  var newTargetObj = {}
  newTargetObj[websiteVal] = targetVal
  chrome.storage.sync.set(newTargetObj, function () {
    if (chrome.runtime.error) {
      console.log("Runtime error.")
    }
  })
  alert('New task is submitted')
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
  popupDiv.appendChild(ul)
  for (var key in data) {
    console.log('DOM DATA', data)
    console.log('DOM key', key)
    console.log('DOM count', data[key])
    // var a = document.createElement('a')
    // a.href = key
    // a.appendChild(document.createTextNode(key))
    // a.addEventListener('click', onAnchorClick)
    // li.appendChild(a)
    // ul.appendChild(li)
    var li = document.createElement('li')
    var content = document.createTextNode( key +  " : " + data[key] )
    li.appendChild(content)
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
  let standardTime = new Date()
  standardTime.setHours(0, 0, 1)

  let startTime = standardTime
  startTime.setDate(standardTime.getDate() - ((new Date()).getDay() - 1));
  let StartTimeUnix = Math.round(startTime.getTime() / 1000)
  // Track the number of callbacks from chrome.history.getVisits()
  // that we expect to get.  When it reaches zero, we have all results.
  var numRequestsOutstanding = 0;

  chrome.history.search({
      'text': '', // Return every history item....
      'startTime': StartTimeUnix,
      maxResults: 100000000
    },
    function (historyItems) {
      // For each history item, get details on all visits.
      for (var i = 0; i < historyItems.length; ++i) {
        var url = historyItems[i].url;
        var processVisitsWithUrl = function (url) {
          // We need the url of the visited item to process the visit.
          // Use a closure to bind the  url into the callback's args.
          return function (visitItems) {
            processVisits(url, visitItems);
          };
        };
        chrome.history.getVisits({
          url: url
        }, processVisitsWithUrl(url));
        numRequestsOutstanding++;
      }
      if (!numRequestsOutstanding) {
        onAllVisitsProcessed();
      }
    });


  var urlToCount = {};
  // Callback for chrome.history.getVisits().  Counts the number of
  // times a user visited a URL by typing the address.
  var processVisits = function (url, visitItems) {
    for (var i = 0, ie = visitItems.length; i < ie; ++i) {
      if (!urlToCount[url]) {
        urlToCount[url] = 0;
      }
      urlToCount[url]++;
    }
    // If this is the final outstanding call to processVisits(),
    // then we have the final results.  Use them to build the list
    // of URLs to show in the popup.
    if (!--numRequestsOutstanding) {
      onAllVisitsProcessed();
    }
  };

  // This function is called when we have the final list of URls to display.
  //NEED TO BUILD A LOOP FOR ALL THE SUBSCRIBED WEBSITES
  let visitCount = 0
  let returnResult = {}
  var onAllVisitsProcessed = function () {
    for (var key in webListFromStorage) {
      console.log('keys', key)
      for (var url in urlToCount) {
        if (url.includes(key)) {
          visitCount += urlToCount[url]
        }
      }
      returnResult[key] = visitCount
    }
    console.log('returnResulat', returnResult)
    buildPopupDom(divName, returnResult)
  }

}

// Sort the URLs by the number of times the user typed them.
// urlArray.sort(function (a, b) {
//   return urlToCount[b] - urlToCount[a];
// });

document.addEventListener('DOMContentLoaded', function () {
  buildUrlList('buidAdivHere')
})
