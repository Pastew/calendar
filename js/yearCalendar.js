// Client ID and API key from the Developer Console
var CLIENT_ID = '257646318879-0lomsrp9hpgbm5hevq28pg0jbspfhs8k.apps.googleusercontent.com';
var API_KEY = 'AIzaSyBPz9MMaMjqHMilD_AiUgycZ99ndd4EUfU';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/calendar.events";

var authorizeButton = document.getElementById('authorize_button');
var signoutButton = document.getElementById('signout_button');

main();

function main() {
    console.log("main");
    initUI();
    generateCalendar();
}

function initUI() {
    let fab = document.querySelector('.fixed-action-btn');
    fab.addEventListener('click', function () {
        toggleScale(document.querySelector('#add_new_event_form'));
    });

    document.addEventListener('DOMContentLoaded', function () {
        const datePickerElems = document.querySelectorAll('.datepicker');
        const datePickerOptions = {
            autoClose: true,
            format: "yyyy-mm-dd",
            defaultDate: new Date(),
            setDefaultDate: true,
            container: document.querySelector("body")
        };
        const datePickerInstances = M.Datepicker.init(datePickerElems, datePickerOptions);


        const timePickerElems = document.querySelectorAll('.timepicker');
        const timePickerOptions = {
            autoClose: true,
            twelveHour: false,
            defaultTime: '8:00',
            container: 'body'
        };
        const timePickerInstances = M.Timepicker.init(timePickerElems, timePickerOptions);
    });
}

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
    console.log("handleClientLoad");
    gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;

    }, function (error) {
        console.log(JSON.stringify(error, null, 2));
    });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
        populateCalendar();
    } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
    }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}

function populateCalendar() {
    console.log("populateCalendar");
    let currentYear = new Date().getFullYear();
    let firstDayOfCurrentYearDate = new Date(currentYear, 0, 1);
    let lastDayOfCurrentYearDate = new Date(currentYear, 11, 32);

    gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': (firstDayOfCurrentYearDate).toISOString(),
        'timeMax': (lastDayOfCurrentYearDate).toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        /*'maxResults': 10,*/
        'orderBy': 'startTime'
    }).then(function (response) {
        var events = response.result.items;
        if (events.length > 0) {
            processEvents(events);
        } else {
            showInfo('No upcoming events found.');
        }
    });
}

function processEvents(events) {
    for (let i = 0; i < events.length; i++) {
        let event = events[i];
        let dateTime = event.start.dateTime;
        if (!dateTime) {
            dateTime = event.start.date;
        }
        dateTime = new Date(dateTime);
        let dateId = convertDatetimeToDayId(dateTime);
        let dayElement = document.querySelector("#" + dateId);
        let ul = dayElement.querySelector("ul");
        if (!ul) {
            ul = document.createElement("ul");
            ul.classList.add("eventList");
            dayElement.appendChild(ul);
        }

        let li = document.createElement("li");
        li.classList.add("event");
        let colorId = event.colorId === undefined ? "color-1" : "color-" + event.colorId;
        li.classList.add(colorId);
        li.classList.add("event");
        ul.appendChild(li);

        li.innerHTML = event.summary === undefined ? "???" : event.summary;
    }
}

function generateCalendar() {
    // Generate header - day numbers
    let calendar = document.querySelector('#calendar');
    let dayNumbersRow = document.createElement('tr');
    calendar.appendChild(dayNumbersRow);
    for (let i = 1; i <= 31; ++i) {
        let th = document.createElement('th');
        th.innerHTML = i;
        dayNumbersRow.appendChild(th);
    }

    // Generate day divs
    let currentYear = new Date().getFullYear();
    for (let i = 0; i < 12; ++i) {
        generateMonthTable(i, currentYear);
    }

    // Highlight current day
    const currentDayId = convertDatetimeToDayId(new Date());
    document.querySelector("#" + currentDayId).classList.add("currentDay");
}

function generateMonthTable(month, year) {

    let calendar = document.querySelector('#calendar');
    let daysRow = document.createElement("tr");
    daysRow.id = "month-" + month;
    calendar.appendChild(daysRow);

    let date = new Date(year, month, 1); // First day of given month
    while (date.getMonth() === month) {
        let td = document.createElement("td");
        daysRow.appendChild(td);
        td.appendChild(generateDayDiv(date));

        date.setDate(date.getDate() + 1);
    }
}


function generateDayDiv(date) {

    let dayDiv = document.createElement("div");
    dayDiv.id = convertDatetimeToDayId(date);
    dayDiv.classList.add("day");
    dayDiv.addEventListener('click', function () {
        showInfo("Clicked: " + this.id);
    });


    if (date.getDate() === 1) {
        const monthsNames = ['Sty.', 'Luty', 'Mar.', 'Kwie.', 'Maj', 'Cze.', 'Lip.', 'Sie.', 'Wrze.', 'Paz.', 'Lis.', 'Gru.'];
        let monthName = document.createElement("div");
        monthName.classList.add("monthName");
        monthName.innerText = monthsNames[date.getMonth()];
        dayDiv.appendChild(monthName);
    }

    const weekdaysNames = ['Nie.', 'Pon.', 'Wt.', 'Śr.', 'Czw.', 'Pią.', 'Sob.'];
    const weekdayNumber = Number(date.getDay()); // 0 = Sunday, 1 = Monday, ...
    let dayName = document.createElement("span");
    dayName.classList.add("dayName");
    dayName.innerText = weekdaysNames[weekdayNumber];
    dayDiv.appendChild(dayName);

    if (weekdayNumber === Number(0) || weekdayNumber === Number(6)) {
        dayDiv.classList.add("weekend");
    }

    return dayDiv;
}

/**
 *
 * @param date - datetime
 * @returns {string} day-yyyy-mm-dd
 */
function convertDatetimeToDayId(date) {
    return "day-" + date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
}

function showInfo(message) {
    M.toast({html: message})

}


/**
 * Adding a new events
 *
 *
 */

var event = {
    'summary': 'Google I/O 2015',
    'location': '800 Howard St., San Francisco, CA 94103',
    'description': 'A chance to hear more about Google\'s developer products.',
    'start': {
        'dateTime': '2015-05-28T09:00:00-07:00',
        'timeZone': 'America/Los_Angeles'
    },
    'end': {
        'dateTime': '2015-05-28T17:00:00-07:00',
        'timeZone': 'America/Los_Angeles'
    },
    'recurrence': [
        'RRULE:FREQ=DAILY;COUNT=2'
    ],
    'attendees': [
        {'email': 'lpage@example.com'},
        {'email': 'sbrin@example.com'}
    ],
    'reminders': {
        'useDefault': false,
        'overrides': [
            {'method': 'email', 'minutes': 24 * 60},
            {'method': 'popup', 'minutes': 10}
        ]
    }
};

function disableSaveButton() {
    let addNewEventButton = document.querySelector("#add_new_event_button");
    addNewEventButton.innerHTML = "Zapisuje...";
    addNewEventButton.classList.add("disabled");
}

function enableSaveButton() {
    let addNewEventButton = document.querySelector("#add_new_event_button");
    addNewEventButton.innerHTML = "Zapisz";
    addNewEventButton.classList.remove("disabled");
}

function addNewEvent() {
    disableSaveButton();

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    let event = {};
    event.summary = document.querySelector('#event_title').value;
    event.description = document.querySelector('#event_description').value;
    event.start = {};
    event.start.timeZone = timezone;
    event.end = {};
    event.end.timeZone = timezone;

    const dateStart = document.querySelector('#date_start').value;
    const dateEnd = document.querySelector('#date_end').value;

    const timeStart = document.querySelector('#time_start').value;
    const timeEnd = document.querySelector('#time_end').value;

    if (timeStart !== '' && timeEnd !== '') {
        event.start.dateTime = dateStart + 'T' + timeStart + ':00';
        event.end.dateTime = dateEnd + 'T' + timeEnd + ':00';
    }
    else {
        event.start.date = dateStart;
        event.end.date = dateEnd;
    }

    const event_example = {
        'summary': document.querySelector('#event_title').value,
        'description': document.querySelector('#event_description').value,
        'start': {
            'dateTime': '2018-12-28T09:00:00',
            'timeZone': timezone
        },
        'end': {
            'dateTime': '2018-12-28T15:00:00',
            'timeZone': timezone
        },
        'reminders': {
            'useDefault': false,
            'overrides': [
                {'method': 'email', 'minutes': 24 * 60},
                {'method': 'popup', 'minutes': 10}
            ]
        }
    };

    let request = gapi.client.calendar.events.insert({
        'calendarId': 'primary',
        'resource': JSON.stringify(event)
    });

    request.execute(function (event) {
        showInfo('Event created: ' + event.htmlLink);
        processEvents([event]);

        enableSaveButton();
        toggleScale(document.querySelector("#add_new_event_form"));
    });
}

function closeAddNewEventForm(){
    toggleScale(document.querySelector("#add_new_event_form"));
}

function toggleScale(element){
    const classes = element.classList;
    if (classes.contains("scale-in")){
        element.classList.remove("scale-in");
        element.classList.add("scale-out");
    }
    else{
        element.classList.remove("scale-out");
        element.classList.add("scale-in");
    }
}
