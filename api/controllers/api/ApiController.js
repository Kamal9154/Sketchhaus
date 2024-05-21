
require('dotenv').config();

exports.respond = async function (endpoint, socket) {
    //console.log(socket.id);
};

exports.inviteAndroid = async function (req, res) {
    try {
        res.redirect('https://play.google.com/store/apps/details?id=app.sketchhaus');
    }
    catch (err) {
        console.log(err);
    }
};


