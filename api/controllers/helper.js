var admin = require("firebase-admin");
var fs = require('fs');
var apn = require('apn');
var deviceDetector = require('node-device-detector');



const commanModel = require('../models/comman-model');

var serviceAccount = require("./api/sketchhaus-6a9c8-firebase-adminsdk-6pnta-b92bb95323.json");
const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});


const detector = new deviceDetector({
    clientIndexes: true,
    deviceIndexes: true,
    deviceAliasCode: false,
});

if (nodeEnv.parsed.PUSH_NOTIFICATION_MODE == 'true') {
    var production = true;
    console.log("production", production)
}
else {
    var production = false;
    console.log("production", production)
}

const options = {
    token: {
        key: fs.readFileSync(__dirname + '/api/AuthKey_CGZ478S5RG.p8'),
        teamId: '2WC8HA4CPT',
        keyId: 'CGZ478S5RG'
    },
    production: production,
};
const apnProvider = new apn.Provider(options);

async function iosNotification(deviceToken, msgtitle, msgbody,badge) { 
    let a = ''
    try {
        const note = new apn.Notification({ aps: { "content-available": 1 } });
        note.expiry = Math.floor(Date.now() / 1000) + 3600;
         note.badge = badge;
       
        note.sound = "ping.aiff";
        note.alert = msgtitle;
        note.payload = { data: { title: msgtitle, body: msgbody } };
        note.topic = "app.SketchHaus";
        let a = await apnProvider.send(note, deviceToken)
        console.log(a.response)

        return true;
    } catch (err) {
        console.log('error in ios notifiation',err)
        sendlogger('iosNotification-response-error', a, err);
        return false;
    }
}

// async function androidNotification(deviceToken, msgtitle, msgbody) {
//     try {
//         let payload = {
//             data: {
//                 body: JSON.stringify({ title: msgtitle, body: msgbody }),
//             },
//             token: deviceToken
//         };
//         console.log(deviceToken)
//         app.messaging().send(payload)
//         .then(response => {
//             console.log('Notification sent to app:', response);
//         })
//         .catch(error => {
//             console.error('Error sending notification to app:', error);
//         });

//     } catch (err) {
//         console.log(err)
//         sendlogger('androidNotification-response-error', '', err);
//         return false;
//     }
// }
async function androidNotification(deviceToken, msgtitle, msgbody) {
    try {
        let payload = {
            data: {
                body: JSON.stringify({ title: msgtitle, body: msgbody }),
            },
            token: deviceToken
        };
        console.log(deviceToken);
        const response = await app.messaging().send(payload);
        console.log('Notification sent to app:', response);
        return true;
    } catch (error) {
        console.error('Error sending notification to app:', error);
        sendlogger('androidNotification-response-error', '', error);
        return false;
    }
}


async function sendlogger(api, request, error) {
    var os = ''

    // var userAgent = request.get('User-Agent');
    // const result_os = detector.detect(userAgent);
    // os = JSON.stringify(result_os.os);


    var logObject = {
        device_details: '',
        api_function: api,
        request_detail: JSON.stringify(request.body),
        log_detail: JSON.stringify(error)
    };
    await commanModel.logger(logObject)
}

module.exports = {
    androidNotification,
    sendlogger,
    // otpSentMessage,
    iosNotification,
    //  iosNotificationForChat,
    //  SentMessage
};
