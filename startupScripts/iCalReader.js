const ical = require('node-ical');
const discord = require('../node_modules/discord.js');
const config = require("../private/config.json");
const schedule = require('node-schedule');
const validUrl = require('valid-url')
// var subjects = config.ids.channelIDs.subject;
var serverID = config.ids.serverID;
var botUserID = config.ids.userIDS.botUserID;
var embed = '';
const {
    DateTime
} = require('luxon');
const {
    MessageButton,
    MessageActionRow
} = require('discord-buttons');


exports.run = async (client) => {

    var today = localDate();

    for (entry in config.calendars) {

        var events = {};
        var webEvents = await ical.async.fromURL(config.calendars[entry]);
        var eventsFromIcal = await getEvents(webEvents, today, events, client);
        await filterToadaysEvents(client, today, eventsFromIcal);

    }

}


function localDate() {

    var tempToday = DateTime.local().toString();
    var todayString = tempToday.slice(0, -10) + "z";
    var today = new Date(todayString);
    return today;

}


//NOTE: This function is from stackoverflow
//I don't understand it, but it works
Date.prototype.getWeek = function () {

    var date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);

    var week1 = new Date(date.getFullYear(), 0, 4);

    return 2 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);

}

var datesAreOnSameDay = (first, second) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();




function getEvents(webEvents, today, events, client) {
    var weekStartDate = localDate();
    weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay() + 1);

    mainLoop:
        for (entry in webEvents) {

            var icalEvent = webEvents[entry];

            if (icalEvent.type == "VEVENT") {

                var summary = icalEvent.summary;
                var tempEventStart = icalEvent.start;
                eventStart = convertDate(tempEventStart);
                var description = icalEvent.description;

                if (datesAreOnSameDay(eventStart, today)) {

                    addEntryToWeeksEvents(events, eventStart.getDay(), eventStart, summary, description)
                    continue;

                }


                if (eventStart > today) {

                    continue;

                }


                if (icalEvent.rrule) { //check if rrule exists in icalEvent

                    var ruleOption = icalEvent.rrule.options;

                    if (ruleOption.until) {

                        if ((ruleOption.until - today) < 0) {

                            continue;

                        }

                    }


                    if (icalEvent.exdate) {

                        for (entry in icalEvent.exdate) {

                            if (datesAreOnSameDay(icalEvent.exdate[entry], today)) {

                                continue mainLoop;

                            }
                        }

                    }


                    var count = ruleOption.count;

                    if (count) {

                        if (ruleOption.interval > 0) {

                            var intervallModifier = (ruleOption.interval > 0) ? ruleOption.interval : 1;
                            //retuns days until last day of webEvent based on interval
                            var daysInWeek = 7;
                            var intervalEndDate = new Date(eventStart);
                            intervalEndDate.setDate(intervalEndDate.getDate() + daysInWeek * intervallModifier * count)

                            if (amountOfDaysDifference(today, intervalEndDate) == 0) {

                                addEntryToWeeksEvents(events, eventStart.getDay(), eventStart, summary, description);
                                continue;

                            }

                            if (intervalEndDate < today) {

                                continue;

                            }

                        }

                    }



                    var interval = ruleOption.interval;

                    if (interval) {

                        if ((Math.abs(weekStartDate.getWeek() - eventStart.getWeek()) % interval) == 0) {

                            if (eventStart.getDay() == today.getDay()) {

                                addEntryToWeeksEvents(events, eventStart.getDay(), eventStart, summary, description);
                                continue mainLoop;

                            }


                            var byday = ruleOption.byweekday;

                            if (byday.length > 1) {

                                for (day in byday) {

                                    if ((byday[day] + 1) == today.getDay()) {

                                        addEntryToWeeksEvents(events, today.getDay(), eventStart, summary, description);
                                        continue mainLoop;

                                    }

                                }

                            }

                        }

                        continue;

                    }


                    var byday = ruleOption.byweekday;

                    if (byday.length > 1) {

                        for (day in byday) {

                            if ((byday[day] + 1) == today.getDay()) {

                                addEntryToWeeksEvents(events, byday[day] + 1, eventStart, summary, description);
                                continue mainLoop;

                            }

                        }

                    }

                }

            }

        }

    client.channels.cache.get(config.ids.channelIDS.bottest).send(todaysLessons(events, client));
    console.log(events);
    return events;

}

function todaysLessons(events, client) {
    var fooEmbed = new discord.MessageEmbed()
        .setColor("#FF0000")
        .setAuthor(`Informationen`, client.guilds.resolve(serverID).members.resolve(botUserID).user.avatarURL())
        .setTitle('Heutige Vorlesungen')
    for (entry in events) {
        var lessonStart = events[entry].start.toString().slice(16, 24);

        if (events[entry].description) {
            fooEmbed.addFields({
                name: "Fach",
                value: events[entry].summary,
                inline: true
            }, {
                name: "eventStart",
                value: lessonStart,
                inline: true
            }, {
                name: "description",
                value: events[entry].description,
                inline: true
            })

        } else {
            fooEmbed.addFields({
                name: "Fach",
                value: events[entry].summary,
                inline: true
            }, {
                name: "eventStart",
                value: lessonStart,
                inline: true
            }, {
                name: '‎',
                value: '‎',
                inline: true
            })
        }

    }

    return fooEmbed;
}



function convertDate(eventStart) {
    //This works, because the DATE.toString() already converts to Date Object in the propper Timezone
    //All this function does, is take the parameters and sets a new date object based on these parameters
    var convertedDate;
    var eventStartString = eventStart.toString();

    var eventYear = eventStartString.slice(11, 15); //11 = startOfYearIndex, 15 = endOfYearIndex
    var enventMonth = monthToIndex(eventStartString.slice(4, 7)) //4 = startOfMonthIndex, 7 = endOfMonthIndex
    var eventDay = eventStartString.slice(8, 10); //8 = startOfDayIndex, 10 = endOfDayIndex
    var eventHours = eventStartString.slice(16, 18); //16 = startOfHourIndex, 10 = endOfHourIndex
    var eventMinutes = eventStartString.slice(19, 21); //8 = startOfMinuteIndex, 10 = endOfMinuteIndex

    return convertedDate = new Date(eventYear, enventMonth, eventDay, eventHours, eventMinutes);
}


function monthToIndex(month) {

    var months = {
        "Jan": "0",
        "Feb": "1",
        "Mar": "2",
        "Apr": "3",
        "May": "4",
        "Jun": "5",
        "Jul": "6",
        "Aug": "7",
        "Sep": "8",
        "Okt": "9",
        "Nov": "10",
        "Dec": "11"
    }

    return months[month];
}

function addEntryToWeeksEvents(events, day, start, summary, description) {

    events[Object.keys(events).length] = {
        "day": day,
        "start": start,
        "summary": summary,
        "description": description
    }

    return events

}

function amountOfDaysDifference(dateToday, dateToCheck) {

    var milisecondsInOneMinute = 1000;
    var minutesInOneHour = 3600;
    var hoursInOneDay = 24;
    var timediff = Math.abs(dateToCheck - dateToday.getTime());
    var diffDays = Math.ceil(timediff / (milisecondsInOneMinute * minutesInOneHour * hoursInOneDay));

    return diffDays;

}

async function filterToadaysEvents(client, today, thisWeeksEvents) {

    for (entry in thisWeeksEvents) {

        if (thisWeeksEvents[entry].day == today.getDay()) {

            var event = thisWeeksEvents[entry];
            var summary = event.summary;
            //extract the subject after the "-" in the string
            var subject = summary.split(' - ')[1];

            //extract the professors Name before the "-" in the string 
            var professor = summary.split(' - ')[0];

            var link = extractZoomLinks(event.description);

            var time = event.start;

            var cronDate = dateToCron(time, today.getDay(), summary);

            var role = findRole(subject, config.ids.roleIDS)

            var embed = dynamicEmbed(client, role, subject, professor, link)

            var channel = findChannel(subject, config.ids.channelIDS.subject)


            if (channel == undefined) {

                channel = config.ids.channelIDs.generalChannels.general;

            }

            if (noVariableUndefined(cronDate, channel, role, embed, client)) {

                role = ("<@&" + role + ">")


            } else if (role == undefined) {

                role = "";

            }

            createCron(cronDate, channel, role, embed, link, client);

        }

    }

}


/**
 * extracts the zoom Links from HTML tag
 * if the HTML tag contains "#success" it cuts the string before that string, to make the link automatically open zoom 
 * @param {*} description 
 * @returns link
 */
function extractZoomLinks(description) {

    if (description.length == 0) {

        return

    }

    let splitString = '>'

    //check for 'id' , because some links might contain an id parameter, which is not needed
    if (description.includes('id')) {

        splitString = 'id'

    }
    //check for '#success' , because some links might have been copied wrong
    if (description.includes('#success')) {

        splitString = '#success'

    }
    //check for html hyperlink parsing , because google calendar does some weird stuff
    if (description.includes('<a href=')) {

        return description.split('<a href=')[1].split(splitString)[0];

    } else {

        return description;

    }

}

/**
 * generate all needed variables for the CRON-Format
 *  
 * SECONDS MINUTES HOURS DAY_OF_MONTH MONTH DAY_OF_WEEK
 * 
 * @param {Date} date 
 * @returns 
 */
function dateToCron(date, weekDay, summary) {

    var seconds = '0';
    var minutes = '55';
    var hour = date.getHours() - 1; //Subtract one, to give the alert not at the exact start of the event, but coupled with minutes = '55' 5 minutes earlier
    var dayOfMonth = '*'; //set to * so the Cron is for the current week
    var month = '*'; //set to * so the Cron is for the current week
    var day = weekDay; //Extracts the weekday of the date string


    if (summary.toLowerCase().includes("(üb)")) {

        minutes = '30'

    }

    var cronString = seconds + ' ' + minutes + ' ' + hour + ' ' + dayOfMonth + ' ' + month + ' ' + day;

    return cronString;

}

/**
 * Builds dynamic embed
 * 
 * Only returns an embed with link, when link is set
 * 
 * @param {object} client needed for the client Avatar
 * @param {string} subject used to set the Title and contents of the embed
 * @param {string} professor sets the professor
 * @param {string} link link to the lecture
 * @returns {any} Embed that was built using the given parameters
 */
function dynamicEmbed(client, role, subject, professor, link) {

    var roleColor = client.guilds.resolve(serverID).roles.cache.get(role).color;
    var courseType = "Vorlesung";

    if (subject.toLowerCase().includes("(ü)")) {
        courseType = "Übung";
    }

    embedDynamic = standardEmbed(client, roleColor, subject, professor, courseType);

    if (subject.toLowerCase().includes("(üb)")) {
        embedDynamic.setAuthor(`Übungsblatt Abgabe Reminder`)
        embedDynamic.setDescription(`Die Abgabefirst des Übungsblattes ist in 30 Minuten.`)
    }

    if (link) {

        embedDynamic.setURL(link);

    }

    return embedDynamic;

}

function standardEmbed(client, roleColor, subject, professor, courseType) {

    try {
        var generatedEmbed = new discord.MessageEmbed()
            .setColor(roleColor)
            .setAuthor(`${courseType}s Reminder`, client.guilds.resolve(serverID).members.resolve(botUserID).user.avatarURL())
            .setTitle(subject + ' Reminder')
            .setDescription(`Die ${courseType} fängt in 5 Minuten an`)
            .setThumbnail('https://pics.freeicons.io/uploads/icons/png/6029094171580282643-512.png')
            .addFields({
                name: 'Dozent',
                value: professor,
                inline: false
            })
            .setFooter('Powered by: Christoph', client.guilds.resolve(serverID).members.resolve(botUserID).user.avatarURL());

    } catch (e) {

        embed = "There was an error creating the embed";
        client.channels.cache.get('846069738059988993').send(embed + "\n" + e); //sends login embed to channel

    }

    return generatedEmbed;
}

/**
 * returns channelID
 * 
 * analyzes the contents of the "subject" and sets "channel" based on its contents
 * sends in case of an error, said error to the debug channel
 * 
 * @param {object} client necessary to return error messages to debug channel
 * @param {String} subject subject exported from iCal
 * @return {string}     returns the channelID based on subject
 * 
 * @throws Error in debug channel
 */
function findChannel(subject, channels) {

    var channel = "";

    Object.keys(channels).forEach(function (key) {

        if (subject.includes(key)) {

            channel = channels[key];

        }

    })

    return channel;

}

function findRole(subject, roles) {

    var role = "";

    Object.keys(roles).forEach(function (key) {

        if (subject.toLowerCase().includes(key.toLowerCase())) {

            role = roles[key];

        }

    })
    return role;
}

function noVariableUndefined() {

    for (arg in arguments) {

        if (arguments[arg] == undefined) {

            return false;

        }

    }

    return true;

}



/**
 * 
 * @param {string} cronDate string in Cron format
 * @param {string} channel destination channel for message
 * @param {string} role role what is supposed to be pinged
 * @param {object} embed embed what is sent
 * @param {object} client required by discord.js
 */
function createCron(cronDate, channel, role, embed, link, client) {
    if (!validUrl.isUri(link)) {
        var job = schedule.scheduleJob(cronDate, function () {
            client.channels.cache.get(channel).send(role, embed.setTimestamp())
                .then(msg => msg.delete({
                    timeout: 5400000
                }))
        });
    } else {
        let linkButton = new MessageButton()
            .setStyle('url')
            .setLabel('In Zoom öffnen')
            .setURL(link)
            .setEmoji('776402157334822964')

        let row = new MessageActionRow()
            .addComponent(linkButton)

        var job = schedule.scheduleJob(cronDate, function () {
            client.channels.cache.get(channel).send(role, {
                    components: [row],
                    embed: embed.setTimestamp()
                })
                .then(msg => msg.delete({
                    timeout: 5400000
                }))
        });
    }
}