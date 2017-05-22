// 已連結到您帳戶的應用程式
// https://security.google.com/settings/security/permissions?pli=1
//
// google api console: 
// https://console.developers.google.com/apis/api?project=gaviewer-151912&hl=zh-tw

// Set basic variables
var oAuthEndPoint = "https://accounts.google.com/o/oauth2/auth";
var oAuthClientID = "475897090387-0dqeetcplnqpck917mfmbesqlkjikt30.apps.googleusercontent.com";
var oAuthScope = "https://www.googleapis.com/auth/analytics https://www.googleapis.com/auth/analytics.readonly";

let splitInitialized = false;
const FETCH_INTERVAL = 1000 * 60; // update every 60 seconds

const mapping = {
  /*
  '77315339': {
    profileId: '77315339',
    name: '00全網',
    slotId: 'slot1'
  },
*/
  '135122059': {
    profileId: '135122059',
    name: '股市talk頻道',
    slotId: 'slot2'
  },
  '111469317': {
    profileId: '111469317',
    name: '新聞頻道',
    slotId: 'slot3'
  },
  '108939341': {
    profileId: '108939341',
    name: '新聞頻道 手機版',
    slotId: 'slot4'
  },
  '121808208': {
    profileId: '121808208',
    name: 'App Android',
    slotId: 'slot5'
  },
  '121793327': {
    profileId: '121793327',
    name: 'App iOS',
    slotId: 'slot6'
  },
  '148245723': {
    profileId: '148245723',
    name: '新基金頻道',
    slotId: 'slot1'
  }
};

const elMain = document.querySelector('#main');

document.querySelector("#btnGoogleOAuth").setAttribute("href", GetOAuthURL());

// Check url for token
if (GetURLParameter("access_token") != undefined) {
// Make request if token is avalible
  const access_token = GetURLParameter("access_token");
  const expires_in = GetURLParameter("expires_in");
  LoadGADataAll(access_token, expires_in);
}

const elLogin = document.querySelector('#login');
const elContent = document.querySelector('#content');


// Function for building the oauth url for the authentication link
function GetOAuthURL() {
  var redirect_uri = 'https://ga.chunghe.me/';

  // URL Encode parameters
  var redirect_uri = encodeURIComponent(redirect_uri); // Get current URL
  var client_id = encodeURIComponent(oAuthClientID);
  var scope = encodeURIComponent(oAuthScope);

  // Build the actuall url
  var oauth_url = oAuthEndPoint + "?client_id=" + client_id + "&redirect_uri=" + redirect_uri + "&scope=" + scope + "&response_type=token";
  return oauth_url;
}

function GARepotDetailBuilder(data, profileId) {
  console.log('data', data);
  const name = mapping[profileId].name;
  return `<div class="ga-detail-block">
    <h2 class="name">${name}</h2>
    <p class="active-users">active users</p>
    <p class="figure">${data.rows[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
  </div>`;
}

function LoadGADataAll(access_token, expires_in) {
// console.log('fn: LoadGADataAll', access_token, expires_in);
  const profileIds = Object.keys(mapping);
  profileIds.forEach( profileId => {
    LoadGAData(access_token, profileId);
  });
  window.setTimeout( () => {
    LoadGADataAll(access_token);
  }, FETCH_INTERVAL);

  if (expires_in) {
    // reload to get new access_token
    window.setTimeout( () => {
      location.href = GetOAuthURL();
    }, +expires_in * 900);
  }
}

// https://developers.google.com/analytics/devguides/reporting/realtime/v3/reference/data/realtime/get
function LoadGAData(access_token, profileId) {
  const headers = new Headers({ Authorization: `Bearer ${access_token}`});
  const url = `https://www.googleapis.com/analytics/v3/data/realtime?ids=ga:${profileId}&metrics=rt:activeUsers`;
  fetch(url, { headers: headers})
    .then(rsp => rsp.json())
    .then(data => {
      elLogin.style.display = 'none';
      if(data.error) {
        elMain.innerHTML = `${data.error.message}, please <a id="login-again" href="${GetOAuthURL()}">Login again</a>`;
        if (data.error.code === 401) {
          location.href = GetOAuthURL();
        } 
      } else {
        initSplit();
        const slotId = mapping[profileId].slotId;
        document.querySelector(`#${slotId}`).innerHTML = GARepotDetailBuilder(data, profileId);
      }
    });
}

// Function for extracting URL parameters returned to the page after oauth
function GetURLParameter(sParam) {
    var sPageURL = window.parent.location.hash.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}

function initSplit() {
  if (splitInitialized) {
    return false;
  }
  splitInitialized = true;
  elMain.innerHTML = 
    `<div id="a" class="split split-horizontal">
      <div id="slot1" class="split content"></div>
      <div id="slot2" class="split content"></div>
    </div>
    <div id="b" class="split split-horizontal">
      <div id="slot3" class="split content"></div>
      <div id="slot4" class="split content"></div>
    </div>
    <div id="c" class="split split-horizontal">
      <div id="slot5" class="split content"></div>
      <div id="slot6" class="split content"></div>
    </div>`;
	
    Split(['#a', '#b', '#c'], {
      gutterSize: 4,
      cursor: 'col-resize'
    })

    Split(['#slot1', '#slot2'], {
      direction: 'vertical',
      gutterSize: 4,
      cursor: 'row-resize'
    })

    Split(['#slot3', '#slot4'], {
      direction: 'vertical',
      gutterSize: 4,
      cursor: 'row-resize'
    })

    Split(['#slot5', '#slot6'], {
      direction: 'vertical',
      gutterSize: 4,
      cursor: 'row-resize'
    })
}
