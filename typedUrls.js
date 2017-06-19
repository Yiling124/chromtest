let planListFromStorage = {}
let totalHistory = 0

let planList = {
  'leetcode.com': 0,
  'codewars.com': 0,
  'cnn.com': 0,
  'nytimes.com': 0,
  'news.ycombinator.com': 0,
  'stackoverflow.com': 0,
  'mail.google.com': 0
}

let playList = {
  'facebook.com': 0,
  'youtube.com': 0,
  'pandora.com': 0,
  'imdb.com': 0,
  'macys.com': 0,
  'bloomingdales.com': 0,
  'twitter.com': 0,
  'instagram.com': 0,
  'etsy.com': 0,
  'www.pinterest.com': 0
}

let customerPlayList = {
  'businessinsider.com': 0
}

let customerPlanList = {
    'pandora.com': 0
}

let objectToSyn = {
  planList: planList,
  playList: playList,
  customerPlanList: customerPlanList,
  customerPlayList: customerPlayList
}

chrome.storage.sync.set(objectToSyn, function () {
  if (chrome.runtime.error) {
    console.log('Runtime error.')
  }
})

var allPlans
var allPlays
chrome.storage.sync.get(null, function (items) {
  console.log('items', items)
  if (!chrome.runtime.error) {
    allPlans = Object.assign(items.customerPlanList, items.planList)
    allPlays = Object.assign(items.customerPlayList, items.playList)
  }
})

document.body.onload = function () {
  chrome.storage.sync.get(null, function (items) {
    if (!chrome.runtime.error) {
      allPlans = Object.assign(items.customerPlanList, items.planList)
      allPlays = Object.assign(items.customerPlayList, items.playList)
    }
  })
}

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

var submitInput = function () {
  var websiteVal = document.getElementById('websitebox').value
  var typeVal = document.getElementById('typebox').value

  if (typeVal === 'plan') {
    if (objectFromStorage.customerPlanList === undefined) {
      objectFromStorage.customerPlanList = {}
    }
    objectFromStorage.customerPlanList[websiteVal] = 0
  } else if (typeVal === 'play') {
    if (objectFromStorage.customerPlayList === undefined) {
      objectFromStorage.customerPlayList = {}
    }
    objectFromStorage.customerPlayList[websiteVal] = 0
  }

  chrome.storage.sync.set(objectFromStorage, function () {
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
  var totalCount = data.allPlanClickCount + data.allPlayClickCount
  var DomArr = []
  var DomPlay = []
  var plansToRank = data.planResult
  var playsToRank = data.playResult
  for (var key in plansToRank) {
    if (DomArr[0] === undefined || plansToRank[key] >= plansToRank[DomArr[0]]) {
      DomArr[2] = DomArr[1]
      DomArr[1] = DomArr[0]
      DomArr[0] = key
    } else if (DomArr[1] === undefined || plansToRank[key] >= plansToRank[DomArr[1]]) {
      DomArr[2] = DomArr[1]
      DomArr[1] = key
    } else if (DomArr[2] === undefined || plansToRank[key] >= plansToRank[DomArr[2]]) {
      DomArr[2] = key
    }
  }

  for (var key in playsToRank) {
    if (DomPlay[0] === undefined || playsToRank[key] >= playsToRank[DomPlay[0]]) {
      DomPlay[2] = DomPlay[1]
      DomPlay[1] = DomPlay[0]
      DomPlay[0] = key
    } else if (DomPlay[1] === undefined || playsToRank[key] >= playsToRank[DomPlay[1]]) {
      DomPlay[2] = DomPlay[1]
      DomPlay[1] = key
    } else if (DomPlay[2] === undefined || playsToRank[key] >= playsToRank[DomPlay[2]]) {
      DomPlay[2] = key
    }
  }

  var popupDiv = document.getElementById(divName)
  var h8 = document.createElement('h8')
  if (data.allPlanClickCount >= data.allPlayClickCount) {
    var h8Text = document.createTextNode("You did a great Job !")
  } else if (data.allPlanClickCount < data.allPlayClickCount) {
    var h8Text = document.createTextNode("You might need to work harder!")
  }
  h8.appendChild(h8Text)
  popupDiv.appendChild(h8)

  // if(data.allPlanClickCount >= data.allPlayClickCount){
  //   h8.li.style.color = 'red'
  // } else if(data.allPlanClickCount < data.allPlayClickCount){
  //   h8.li.style.color = 'green'
  // }
  // var top5Plan = document.createElement('9')
  // var top5PlanText = document.createTextNode("Top 5 Planned Websites: ")
  // top5Plan.appendChild(top5PlanText)

  // popupDiv.appendChild(top5Plan)

  var ul = document.createElement('ul')
  popupDiv.appendChild(ul)
  var li = document.createElement('li')
  var content = document.createTextNode('Top 3 for WORK: ')
  li.appendChild(content)
  li.style.color = 'blue'
  ul.appendChild(li)
  for (var i = 0; i <= DomArr.length - 1; i++) {
    var li = document.createElement('li')
    var content = document.createTextNode(DomArr[i] + " : " + (plansToRank[DomArr[i]] / totalCount).toFixed(2) * 100 + "%")
    li.appendChild(content)
    li.style.color = 'green'
    ul.appendChild(li)
  }
  var li = document.createElement('li')
  var content = document.createTextNode('Top 3 for PLAY: ')
  li.appendChild(content)
  li.style.color = 'blue'
  ul.appendChild(li)
  for (var i = 0; i <= DomArr.length - 1; i++) {
    var li = document.createElement('li')
    var content = document.createTextNode(DomPlay[i] + " : " + (playsToRank[DomPlay[i]] / totalCount).toFixed(2) * 100 + "%")
    li.appendChild(content)
    li.style.color = 'red'
    ul.appendChild(li)
  }
}

function buildUrlList(divName) {
  var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
  var startTime = (new Date).getTime() - microsecondsPerWeek;

  let urlToCount = {}
  let planResult = {}
  let playResult = {}

  chrome.history.search({
      text: '',
      startTime: startTime,
      maxResults: 10000000
    },
    function (historyItems) {
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

  var allPlanClickCount = 0;
  var allPlayClickCount = 0;

  function onAllVisitsProcessed() {
    for (var key in allPlans) {
      let visitCount = 0
      for (var url in urlToCount) {
        if (url.includes(key)) {
          visitCount += urlToCount[url]
          allPlanClickCount += urlToCount[url]
        }
      }
      planResult[key] = visitCount
    }

    for (var key in allPlays) {
      let visitCount = 0
      for (var url in urlToCount) {
        if (url.includes(key)) {
          visitCount += urlToCount[url]
          allPlayClickCount += urlToCount[url]
        }
      }
      playResult[key] = visitCount
    }
    let objectForDom = {
      playResult: playResult,
      planResult: planResult,
      allPlanClickCount: allPlanClickCount,
      allPlayClickCount: allPlayClickCount
    }
    buildPopupDom(divName, objectForDom)
  }
}

document.addEventListener('DOMContentLoaded', function () {
  buildUrlList('buidAdivHere')
})
