let debug = false;

let isArabic = debug ? false : "ar" == parent.System.vars.language;
if (isArabic) {
  let langElements = document.querySelectorAll(".lang");
  langElements.forEach((element) => {
    element.innerText =
      element.dataset.ar != undefined ? element.dataset.ar : element.innerText;
  });
  let arabicStyleElement = document.createElement("style");
  arabicStyleElement.innerText = `
    .incident-count-card {
      flex-direction: row-reverse;
      padding-right: 30px;
      padding-left: 0px;
    }
    .info-column {
      align-items: flex-end;
      padding-right: 10px;
    }

  `;
  document.querySelector("head").appendChild(arabicStyleElement);
}

function getIncidentNumber(api, fieldSelector) {
  type = "all"; //Define this as internal, external, or all when copy pasting into the custom widget
  let request = new XMLHttpRequest();
  request.open("GET", api);
  request.send();
  request.onload = function () {
    var count = 0;
    var internal = 0;
    var external = 0;
    if (this.status === 200) {
      let data = JSON.parse(this.responseText);
      data.instances.forEach(function (row) {
        if (row.values["69"] === 109) {
          //109 for internal
          internal += parseInt(row.values.column2, 10);
        }
        if (row.values["69"] === 111) {
          //111 for external
          external += parseInt(row.values.column2, 10);
        }
      });
      if (type == "all") {
        count = internal + external;
      } else if (type == "internal") {
        count = internal;
      } else {
        count = external;
      }
    } else if (this.status === 204) {
      count = 0;
    } else {
      count = isArabic ? "غير متاح" : "not available";
    }
    let total = internal + external;
    document
      .querySelector(fieldSelector)
      .closest(".incident-count-card")
      .querySelector(".refresh").style.display = "none";
    document.querySelector(fieldSelector).innerText = count;
    let elementParent =
      document.querySelector(fieldSelector).parentNode.parentNode;
    elementParent.querySelector(".internal .sp-count").innerText = internal;
    elementParent.querySelector(".internal .sp-percent").innerText =
      ((internal / (total == 0 ? 1 : total)) * 100).toFixed(2) + "%";
    elementParent.querySelector(".external .sp-count").innerText = external;
    elementParent.querySelector(".external .sp-percent").innerText =
      ((external / (total == 0 ? 1 : total)) * 100).toFixed(2) + "%";
  };
  request.onerror = function () {
    document.querySelector(fieldSelector).innerText = isArabic
      ? "غير متاح"
      : "not available";
  };
}
function getFilterCount(api, fieldSelector) {
  let request = new XMLHttpRequest();
  request.open("GET", api);
  request.send();
  request.onload = function () {
    var count = 0;
    if (this.status === 200) {
      let data = JSON.parse(this.responseText);
      count = data["filterCount"];
    } else if (this.status === 204) {
      count = 0;
    } else {
      count = isArabic ? "غير متاح" : "not available";
    }
    document
      .querySelector(fieldSelector)
      .closest(".incident-count-card")
      .querySelector(".refresh").style.display = "none";
    document.querySelector(fieldSelector).innerText = count;
  };
}

function loadReport() {
  getIncidentNumber(
    debug
      ? "api/c2.json"
      : "https://app.cdc-hq-nwc.live/?q=api/call&request=customData/reports/31/instances",
    "#new-incident-number"
  );
  getIncidentNumber(
    debug
      ? "api/c2.json"
      : "https://app.cdc-hq-nwc.live/?q=api/call&request=customData/reports/3/instances",
    "#in-progress-number"
  );
  getIncidentNumber(
    debug
      ? "api/c2.json"
      : "https://app.cdc-hq-nwc.live/?q=api/call&request=customData/reports/5/instances",
    "#solved-incident-number"
  );
  getIncidentNumber(
    debug
      ? "api/c2.json"
      : "https://app.cdc-hq-nwc.live/?q=api/call&request=customData/reports/83/instances",
    "#all-incident-number"
  );
  getFilterCount(
    debug
      ? "api/c2.json"
      : "https://app.cdc-hq-nwc.live/?q=api/call&request=customData/reports/87/instances?limit=1",
    "#delayed-incident-number"
  );
}

loadReport();
metronome.bindUpdate(() => {
  loadReport();
  metronome.completeUpdate();
});