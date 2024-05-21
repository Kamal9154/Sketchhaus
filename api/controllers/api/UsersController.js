var app = require('express')();
var fs = require('fs');
var deviceDetector = require('node-device-detector');
var jwt = require('jsonwebtoken');
var moment = require('moment-timezone');
var axios = require('axios')

const commanModel = require('../../models/comman-model');
const commanHelper = require('../helper');
const nodemailer = require('nodemailer');
let transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }
});

require('dotenv').config();
const detector = new deviceDetector({
    clientIndexes: true,
    deviceIndexes: true,
    deviceAliasCode: false,
});

const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.SECRET_KEY, { pbkdf2Iterations: 10000, saltLength: 10 });
var generateSafeId = require('generate-safe-id');
const fetch = require("node-fetch");
const endpoint = "https://api.matterport.com/api/models/graph";
const TOKEN_ID = process.env.TOKEN_ID;
const TOKEN_SECRET = process.env.TOKEN_SECRET;
const auth = Buffer.from(TOKEN_ID + ':' + TOKEN_SECRET).toString('base64');


exports.login = async function (req, res) {

    try {
        var where = "email = '" + req.body.email + "'";
        var checkUser = await commanModel.select('users', where, 'single');

        if (checkUser) {
            let pass = cryptr.decrypt(checkUser.password)
            if (pass == req.body.password) {

                let token = "" + req.body.email + "SketchHaus";
                var get_token = jwt.sign({ data: token }, 'secret', {});
                let B_token = 'Bearer ' + get_token + '';
                let where = "email='" + req.body.email + "'"

                let updateObj = { 
                    auth_token: B_token, 
                    device_token: req.body.device_token, 
                    device_type: req.body.device_type == 'ios' ? 'iOS' : 'android' 
                }
                await commanModel.update('users',updateObj , where);


                let object = {
                    first_name: checkUser.first_name,
                    last_name: checkUser.last_name,
                    email: checkUser.email,
                    mobile_number: checkUser.mobile_number,

                    device_token: checkUser.device_token,
                    device_type: checkUser.device_type,
                    auth_token: B_token,
                    profile_img: (checkUser.profile_img == null) ? nodeSiteUrl + '/storage/users/default.png' : nodeSiteUrl + '/storage/users/' + checkUser.profile_img,
                    user_id: checkUser.id,
                    progress_status: checkUser.progress_status,

                };


                var result = { status: true, message: 'login successfully', data: object };
            }
            else {
                var result = { status: false, message: 'Invalid password', data: {} };
            }
        }
        else {
            var result = { status: false, message: 'User Not Found.', data: {} };
        }
        res.send(result);

    }
    catch (err) {
        console.log(err)
        commanHelper.sendlogger('login', req, err);
        res.send({ status: false, message: 'Please try again.', data: {} });
    }
};
exports.register = async function (req, res) {

    try {
        var where = "email = '" + req.body.email + "'";
        var checkEmail = await commanModel.select('users', where, 'single');

        var where = "mobile_number = '" + req.body.mobile_number + "'";
        var checkmobile = await commanModel.select('users', where, 'single');

        if (checkmobile) {
            var result = { status: false, message: 'Mobile number is already exist.', data: {} };
            // return
        } else if (checkEmail) {
            var result = { status: false, message: 'Email is already exist.', data: {} };
            // return
        }
        else {
            let token = "" + req.body.email + "SketchHaus";
            var get_token = jwt.sign({ data: token }, 'secret', {});
            let auth_token = 'Bearer ' + get_token + '';

            let object = {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                mobile_number: req.body.mobile_number,
                password: cryptr.encrypt(req.body.password),
                device_token: req.body.device_token,
                device_type: req.body.device_type,
                auth_token: auth_token,

            };
            if (req.file != undefined) {
                object.profile_img = req.file.filename;
            }
            else {
                object.profile_img = 'default.png'
            }

            var insert = await commanModel.insert('users', object);

            if (insert.insertId) {
                /* create first folder */
                let obj = {
                    folder_name: `${req.body.first_name}-${req.body.last_name}`,
                    user_id: insert.insertId,
                }
                createFolder(obj.folder_name, insert.insertId);
                await commanModel.insert('user_folder', obj);

                delete object.password

                object.user_id = insert.insertId
                object.profile_img = nodeSiteUrl + '/storage/users/' + object.profile_img
                object.progress_status = 0
                var result = { status: true, message: 'Registration has been successfully completed.', data: object };


                const mailOptions = {
                    from: 'SketchHaus <info@sketchhaus.com>',
                    to: `${req.body.email}`,
                    subject: 'Welcome to SketchHaus',
                    html: `<html lang="en-US">

                    <head></head>
                    
                    <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
                      <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
                      <meta name="description" content="Reset Password .">
                      <style type="text/css">
                        a:hover {
                          text-decoration: underline !important;
                        }
                      </style>
                    
                      <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
                        style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open/* + */Sans:300,400,600,700); font-family: Open Sans, sans-serif;">
                        <tbody>
                          <tr>
                            <td>
                              <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                                align="center" cellpadding="0" cellspacing="0">
                                <tbody>
                                  <tr>
                                    <td style="height:80px;">&nbsp;</td>
                                  </tr>
                                  <tr>
                                    <td style="text-align:center;">
                                      <div
                                        style="     overflow: hidden; background: #db2300;border-radius: 50%;height: 100px;width: 100px;padding: 10px;margin: 0 auto;position: relative;left: 0;right: 0;z-index: 2;border: 6px solid #fff;">
                                        <a style="" title="logo" target="_blank">
                                          <img style="height: 100px;" src="https://images.squarespace-cdn.com/content/v1/62f3efdfdf1e735995362458/1660153849785-3EOVZY7TYZRXG39WKHO7/sketch+haus.jpg?format=1500w"
                                            title="logo" alt="logo">
                                        </a>
                                      </div>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="height:20px;">&nbsp;</td>
                                  </tr>
                                  <tr>
                                    <td>
                                      <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                        style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                        <tbody>
                                          <tr>
                                            <td style="height:40px;">&nbsp;</td>
                                          </tr>
                                          <tr>
                                            <td style="padding:0 35px;">
                                              <div style="text-align:left;">
                                                <h1
                                                  style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:Rubik,sans-serif;">
                                                  Hello ${req.body.first_name}</h1><br>
                    
                                                <spanstyle="display:inline-block; vertical-align:middle;="" margin:29px="" 0="" 26px;=""
                                                  border-bottom:1px="" solid#cecece;="" width:100px;>
                                                  <p style="color:#455056; font-size:15px;line-height:24px; margin:0;"> Thank you for
                                                    joining
                                                    the SketchHaus!</p><br>
                                                  <p style="color:#455056; font-size:15px;line-height:24px; margin:0;"> At SketchHaus, we’ve
                                                    simplified the architectural process of creating custom floor plan drawings and
                                                    additional
                                                    documents to help you economically get you to the starting point of your home renovation
                                                    in a matter of days. </p>
                                                  <p style="font-size:15px;line-height:24px;">Regards</p>
                                                  <p style="font-size:15px;line-height:0px;">Team SketchHaus.</p>
                                              </div>
                    
                                              </spanstyle="display:inline-block;>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td style="height:40px;">&nbsp;</td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="height:20px;">&nbsp;</td>
                                  </tr>
                    
                                  <tr>
                                    <td style="height:80px;">&nbsp;</td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    
                    </body>
                    
                    </html>
                   `
                };
                transport.sendMail(mailOptions, async function (err, info) {
                    if (err) {
                        console.log(err)
                    }
                })
            }
            else {
                var result = { status: false, message: 'please try again, data is not inserted', data: {} };
            }
        } res.send(result);
    } catch (err) {
        console.log(err)
        commanHelper.sendlogger('register', req, err);
        res.send({ status: false, message: 'Please try again.', data: {} });
    }
};
exports.forgotPassword = async function (req, res) {

    try {
        var where = "email = '" + req.body.email + "'";
        var checkUser = await commanModel.select('users', where, 'single');

        if (checkUser) {
            var newpassword = generateSafeId().slice(0, 10);
            var sql = "UPDATE `users` SET `password`='" + cryptr.encrypt(newpassword) + "' WHERE `id` = '" + checkUser.id + "'";
            await commanModel.sqlQuery(sql, 'single');


            const mailOptions = {
                from: 'SketchHaus <info@sketchhaus.com>',
                to: `${checkUser.email}`,
                subject: 'Reset password request - SketchHaus',
                html: `<html lang="en-US">  <head></head><body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0"><meta content="text/html; charset=utf-8" http-equiv="Content-Type"> 
                <meta name="description" content="Reset Password ."> 
                <style type="text/css">a:hover {text-decoration: underline !important;}</style>                
                
               <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8" style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open/* + */Sans:300,400,600,700); font-family: Open Sans, sans-serif;">   <tbody><tr><td><table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0"> 
                <tbody><tr> 
                <td style="height:80px;">&nbsp;</td> 
                </tr> 
                <tr> 
                <td style="text-align:center;"> 
                <div style="     overflow: hidden; background: #db2300;border-radius: 50%;height: 100px;width: 100px;padding: 10px;margin: 0 auto;position: relative;left: 0;right: 0;z-index: 2;border: 6px solid #fff;"> 
                <a style="" title="logo" target="_blank"> 
                <img style="height: 100px;" src="https://images.squarespace-cdn.com/content/v1/62f3efdfdf1e735995362458/1660153849785-3EOVZY7TYZRXG39WKHO7/sketch+haus.jpg?format=1500w" 
                title="logo" alt="logo"> 
                </a> 
                </div> 
                </td> 
                </tr> 
                <tr> 
                <td style="height:20px;">&nbsp;</td> 
                </tr> 
                <tr> 
                <td> 
                <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);"><tbody><tr> 
                <td style="height:40px;">&nbsp;</td> 
                </tr> 
                <tr> 
                <td style="padding:0 35px;"> 
                <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:Rubik,sans-serif;">You have requested to reset your password</h1> 
                <spanstyle="display:inline-block; vertical-align:middle;="" margin:29px="" 0="" 26px;="" border-bottom:1px="" solid#cecece;="" width:100px;"=""> 
                <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">We cannot simply send you your old password, Here a unique new password has been generated for you.</p> 
                <a style="background:#db2300;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">  ${newpassword}     </a> 
                </spanstyle="display:inline-block;></td> 
                </tr> 
                <tr> 
                <td style="height:40px;">&nbsp;</td> 
                </tr> 
                </tbody></table> 
                </td> 
                </tr><tr> 
                <td style="height:20px;">&nbsp;</td> 
                </tr> 
                 
                <tr> 
                <td style="height:80px;">&nbsp;</td> 
                </tr> 
                </tbody></table> 
                </td> 
                </tr> 
                </tbody></table> 
                
               </body></html>
               `
            };
            console.log(mailOptions.html)
            transport.sendMail(mailOptions, async function (err, info) {
                if (err) {
                    console.log(err)
                }

            })
            var result = { status: true, message: 'Please check your email address.' };

        } else {
            var result = { status: false, message: 'User Not Found.', data: {} };
        }

        res.send(result);

    }
    catch (err) {
        commanHelper.sendlogger('forgotPassword', req, err);
        res.send({ status: false, message: 'Please try again.' });
    }
}
exports.changePassword = async function (req, res) {
    try {
        var where = "id = '" + req.body.user_id + "'";
        var result = await commanModel.select('users', where, 'single');
        if (cryptr.decrypt(result.password) == req.body.old_password) {

            let object = {
                password: cryptr.encrypt(req.body.new_password),
            };
            var update = await commanModel.update('users', object, where);

            if (update.affectedRows) {
                var result = { status: true, message: 'Password Updated successfully.' };
            }
            else {
                var result = { status: false, message: 'Password Updated failed.' };
            }
        } else {
            var result = { status: false, message: 'Your old passward was entered incorrectly' };
        }

        res.send(result);
    } catch (err) {
        console.log(err)
        commanHelper.sendlogger('changePassword', req, err);
        res.send({ status: false, message: 'Please try again.' });
    }
}
exports.getUserProfile = async function (req, res) {
    try {
        var where = "id = '" + req.body.user_id + "'";
        var data = await commanModel.select('users', where, 'single');

        if (data) {
            delete data.password
            var result = { status: true, message: 'Data found ', data: data };

        } else {
            var result = { status: false, message: 'Data not found', data: {} };
        }

        res.send(result);
    } catch (err) {
        console.log(err)
        commanHelper.sendlogger('getUserProfile', req, err);
        res.send({ status: false, message: 'Please try again.', data: {} });
    }
}
exports.createFolder = async function (req, res) {
    try {
        var where = "`user_id` = '" + req.body.user_id + "' AND `folder_name` = '" + req.body.folder_name + "'";
        var data = await commanModel.select('user_folder', where, 'single');

        if (data) {
            delete data.password
            var result = { status: false, message: "Folder " + req.body.folder_name + " already exists", data: [] };

        } else {
            let obj = {
                folder_name: req.body.folder_name,
                user_id: req.body.user_id,
            }
            await commanModel.insert('user_folder', obj);
            var sql = "SELECT * FROM `user_folder` WHERE `user_id` = " + req.body.user_id + " ORDER by folder_name";
            var data1 = await commanModel.sqlQuery(sql);
            var result = { status: true, message: "Folder created successfully", data: data1 };
        }

        res.send(result);
    } catch (err) {
        console.log(err)
        commanHelper.sendlogger('getUserProfile', req, err);
        res.send({ status: false, message: 'Please try again.', data: {} });
    }
}
exports.getFolderImage = async function (req, res) {
    // folder_id
    // user_id
    /* get images which should to come from images table on the basis of user_id and folder_id  */
    try {
        var sql = "select id as image_id,folder_id,created_at,img_name from user_images where `user_id` = '" + req.body.user_id + "' AND `folder_id` = '" + req.body.folder_id + "'";
        var data = await commanModel.sqlQuery(sql);

        if (data) {
            for (let i = 0; i < data.length; i++) {
                data[i].img_name_url = `${nodeSiteUrl}/storage/images/${data[i].img_name}`
                data[i].img_name = data[i].img_name
            }

            var result = { status: true, message: "data found.", data: data };
        } else {
            var result = { status: false, message: "data not found.", data: [] };
        }
        res.send(result);
    } catch (err) {
        console.log(err)
        commanHelper.sendlogger('getUserProfile', req, err);
        res.send({ status: false, message: "data not found.", data: [] });
    }


}
exports.getFolder = async function (req, res) {
    try {
        var sql = "SELECT id as folder_id,folder_name from user_folder where `user_id` = '" + req.body.user_id + "'";
        var data = await commanModel.sqlQuery(sql);

        if (data) {

            var result = { status: true, message: "data found.", data: data };
        } else {
            var result = { status: false, message: "data not found.", data: [] };
        }

        res.send(result);
    } catch (err) {
        console.log(err)
        commanHelper.sendlogger('getFolder', req, err);
        res.send({ status: false, message: "data not found.", data: [] });
    }


}
exports.updateProfile = async function (req, res) {

    try {
        var obj1 = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            mobile_number: req.body.mobile_number,
            email: req.body.email,
        };
        var where = "`id`='" + req.body.user_id + "'";
        var checkUser = await commanModel.select('users', where, 'single');

        if (checkUser) {

            if (req.file != undefined) {
                var obj2 = { profile_img: req.file.filename };
                if (checkUser != undefined) {
                    if (checkUser.profile_img != 'default.png') {
                        var filePath = appDir + '/assets/storage/users/' + checkUser.profile_img;
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                        }
                    }
                }
            }

            var object = { ...obj1, ...obj2 };
            await commanModel.update('users', object, where);

            var getUser = await commanModel.select('users', where, 'single');

            let userobject = {
                profile_img: (getUser.profile_img == null) ? nodeSiteUrl + '/storage/users/default.png' : nodeSiteUrl + '/storage/users/' + getUser.profile_img,
                first_name: getUser.first_name,
                last_name: getUser.last_name,
                email: getUser.email,
                mobile_number: getUser.mobile_number,

            }


            var result = { status: true, message: 'User profile has been updated successfully.', data: userobject };
        }
        else {
            var result = { status: false, message: 'Please try again, User profile has not been updated.', data: {} };
        }
        res.send(result);
    }
    catch (err) {
        commanHelper.sendlogger('updateProfile', req, err);
        res.send({ status: false, message: 'Please try again.', data: {} });
    }
};
exports.uploadImage = async function (req, res) {

    try {
        if (req.file == undefined) {
            var result = { status: false, message: 'image must not be empty.', data: [] };
            res.send(result);
            return
        }
        var where03 = "`id`='" + req.body.folder_id + "'";
        let folderexist = await commanModel.select('user_folder', where03, 'single');
        if (!folderexist) {
            var result = { status: false, message: 'folder not found.' };
            res.send(result);
            return
        }

        let object = {
            user_id: req.body.user_id,
            folder_id: req.body.folder_id,
            img_name: req.file.filename
        }
        await commanModel.insert('user_images', object);

        let user = await commanModel.select('users', `id = ${req.body.user_id}`, 'single');
        const mailOptions = {
            from: 'SketchHaus <info@sketchhaus.com>',
            to: `${process.env.ADMIN_MAIL_ID}`,
            subject: 'Image uploaded - SketchHaus',
            html: `<html lang="en-US">  <head></head><body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0"><meta content="text/html; charset=utf-8" http-equiv="Content-Type"> 
            <meta name="description" content="Reset Password ."> 
            <style type="text/css">a:hover {text-decoration: underline !important;}</style>                
            
           <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8" style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open/* + */Sans:300,400,600,700); font-family: Open Sans, sans-serif;">   <tbody><tr><td><table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0"> 
            <tbody><tr> 
            <td style="height:80px;">&nbsp;</td> 
            </tr> 
            <tr> 
            <td style="text-align:center;"> 
            <div style="     overflow: hidden; background: #db2300;border-radius: 50%;height: 100px;width: 100px;padding: 10px;margin: 0 auto;position: relative;left: 0;right: 0;z-index: 2;border: 6px solid #fff;"> 
            <a style="" title="logo" target="_blank"> 
            <img style="height: 100px;" src="https://images.squarespace-cdn.com/content/v1/62f3efdfdf1e735995362458/1660153849785-3EOVZY7TYZRXG39WKHO7/sketch+haus.jpg?format=1500w" 
            title="logo" alt="logo"> 
            </a> 
            </div> 
            </td> 
            </tr> 
            <tr> 
            <td style="height:20px;">&nbsp;</td> 
            </tr> 
            <tr> 
            <td> 
            <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);"><tbody><tr> 
            <td style="height:40px;">&nbsp;</td> 
            </tr> 
            <tr> 
            <td style="padding:0 35px;"> 
            <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:Rubik,sans-serif;">Notification of Image Upload</h1> <br>
            <spanstyle="display:inline-block; vertical-align:middle;="" margin:29px="" 0="" 26px;="" border-bottom:1px="" solid#cecece;="" width:100px;"=""> 
            <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">A new image has been uploaded by <span style="font-weight:900">${ user.first_name.toUpperCase()} ${user.last_name.toUpperCase()}.</span> </p> 

            <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">Thanks</p> 
      
            </spanstyle="display:inline-block;></td> 
            </tr> 
            <tr> 
            <td style="height:40px;">&nbsp;</td> 
            </tr> 
            </tbody></table> 
            </td> 
            </tr><tr> 
            <td style="height:20px;">&nbsp;</td> 
            </tr> 
             
            <tr> 
            <td style="height:80px;">&nbsp;</td> 
            </tr> 
            </tbody></table> 
            </td> 
            </tr> 
            </tbody></table> 
            
           </body></html>
           
           `
        };
        transport.sendMail(mailOptions, async function (err, info) {
            if (err) {
                console.log(err)
            }

        })

        var result = { status: true, message: 'Image uploaded successfully.' };

        res.send(result);
    }
    catch (err) {
        console.log(err)
        commanHelper.sendlogger('uploadImage', req, err);
        res.send({ status: false, message: 'Please try again.', data: [] });
    }
};
exports.deleteImage = async function (req, res) {
    try {
        var where = "`user_id`='" + req.body.user_id + "' AND `folder_id`= '" + req.body.folder_id + "' AND `id`='" + req.body.image_id + "'";
        var checkUser = await commanModel.select('user_images', where, 'single');

        if (checkUser) {
            var filePath = appDir + '/assets/storage/images/' + checkUser.img_name;
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            await commanModel.delete('user_images', where);

            var result = { status: true, message: 'image deleted successfully' }
        }
        else {
            var result = { status: false, message: 'image not found with this user' }
        }
        res.send(result)
    }
    catch (err) {
        commanHelper.sendlogger('uploadImage', req, err);
        res.send({ status: false, message: 'Please try again.' });
    }
};
exports.deleteUserAccount = async function (req, res) {
    try {

        var where1 = " `user_id` = '" + req.body.user_id + "' ";

        let data = await commanModel.select('user_images', where1);
        for (let i = 0; i < data.length; i++) {
            var filePath = appDir + '/assets/storage/images/' + data[i].img_name;
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await commanModel.delete('notification', where1);
        await commanModel.delete('user_images', where1);
        await commanModel.delete('user_folder', where1);
        await commanModel.delete('user_pdf', where1);

        var where2 = " `id` = '" + req.body.user_id + "' ";
        await commanModel.delete('users', where2);


        var result = { status: true, message: 'Account has been deleted' };

        res.send(result);
    }
    catch (err) {
        console.log(err)
        commanHelper.sendlogger('deleteUserAccount', req, err);
        res.send({ status: false, message: 'Please try again.' });
    }
}
exports.logout = async function (req, res) {
    try {

        var object = {
            device_token: '',
        };
        var updateUser = await commanModel.update('users', object, `id = ${req.body.user_id}`);
        if (updateUser) {
            var result = { status: true, message: 'User logged out successfully.' };
        }
        else {
            var result = { status: false, message: 'Please try again, The user has not logged out.' };
        }

        res.send(result);
    }
    catch (err) {
        console.log(err)
        commanHelper.sendlogger('logout', req, err);
        res.send({ status: false, message: 'Please try again.' });
    }
};
exports.getNotifications = async function (req, res) {

    try {
        var sql = " select * from notification where user_id = '" + req.body.user_id + "' ORDER by id DESC";
        var data = await commanModel.sqlQuery(sql);

        if (data) {
            // console.log(data)
            // for (let i = 0; i < data.length; i++) {
            // data[i].created_at = data[i].created_at
            // data[i].created_at = moment(data[i].created_at).format('YYYY-MM-DD HH:mm:ss')
            // }
            var result = { status: true, message: "data found.", data: data };
        } else {
            var result = { status: false, message: "data not found.", data: [] };
        }
        console.log(result, "get notification")
        res.send(result);
    } catch (err) {
        console.log(err)
        commanHelper.sendlogger('getFolder', req, err);
        res.send({ status: false, message: "data not found.", data: [] });
    }


}
exports.updateReadStatus = async function (req, res) {
    try {
        await commanModel.update('notification', { read_status: 1 }, `user_id = ${req.body.user_id}`)
        res.send({ status: true, message: "Read status updated successfully." });

    } catch (err) {
        console.log(err)
        commanHelper.sendlogger('updateReadStatus', req, err);
        res.send({ status: false, message: "Somthing went wrong." });
    }

}


// exports.getmatterportFolder = async (req, res) => {
//     try {
//         var where = "id = '" + req.body.user_id + "'";
//         var checkUser = await commanModel.select('users', where, 'single');
//         // console.log(checkUser.matterport_folder_id,"dddddddddddddddddddd")//1zcbrPsGqHA

//         if(!checkUser.matterport_folder_id){
//             res.send({ data: {html : '', matterport_folder_name:''}, status: false, message: "No matterport folder found please contact to admin" })
//         } else{

//         // console.log('getting matterport user--------->', checkUser);
//         const body = JSON.stringify({
//             query: `
//             query getFolderAndModelDetails($folderId: ID!) {
//         folder(id: $folderId) {
//             id
//             name
//           models(offset: null) {
//             nextOffset
//             totalResults
//             results {
//                 id
//                 name
//                 assets {
//                 clips {
//                     filename
//                   url
//                   thumbnailUrl
//                   format
//                 }
//               }
//             }
//           }
//         }
//       }
//       `,
//             variables: {
//                 folderId: checkUser.matterport_folder_id
//             }
//         });

//         const config = {
//             headers: {
//                 'Authorization': `Basic ${auth}`,
//                 'Content-Type': 'application/json',
//             },
//         };

//         axios.post(endpoint, body, config)
//             .then(async (response) => {
//                if(response.data.data.folder.models.results.length == 0){
//                 res.send({ data: {html : '', matterport_folder_name:''}, status: false, message: "data not found." })
//                 }else{
//                 let html_part = ``
//                 for (let i = 0; i < response.data.data.folder.models.results.length; i++) {

//                     html_part += ` 
//                     <div class="gal-grid-item">
//                     <div class="grid-spacer"></div>
//                     <iframe class="gal-item-frame" width="100%" height="100%" allowfullscreen="true" frameborder="0" src="https://my.matterport.com/show/?m=${response.data.data.folder.models.results[i].id}&play=1"></iframe>
//                 </div>`
//                 }
//                 let html = `
//                 <!doctype html>
//                     <html lang="en">
//                       <head>
//                         <meta charset="utf-8">
//                         <meta name="viewport" content="width=device-width, initial-scale=1">
//                         <title>Sketch Haus Mobile Web View</title>
//                         <style type="text/css">
//                         	a,abbr,acronym,address,applet,article,aside,audio,b,big,blockquote,body,canvas,caption,center,cite,code,dd,del,details,dfn,div,dl,dt,em,embed,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,header,hgroup,html,i,iframe,img,ins,kbd,label,legend,li,main,mark,menu,nav,object,ol,output,p,pre,q,ruby,s,samp,section,small,span,strike,strong,sub,summary,sup,table,tbody,td,tfoot,th,thead,time,tr,tt,u,ul,var,video{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}article,aside,details,figcaption,figure,footer,header,hgroup,main,menu,nav,section{display:block}[hidden]{display:none}menu,ol,ul{list-style:none}blockquote,q{quotes:none}blockquote:after,blockquote:before,q:after,q:before{content:'';content:none}table{border-collapse:collapse;border-spacing:0}
//                     			body {color: #332e38;font-weight: 400;font-family: Roboto, "Helvetica Neue", sans-serif;font-size: 16px;}
//                     			.gal-grid-wrap {position: relative;padding: 6px;display: flex;flex-direction: column;grid-gap: 6px;max-width: 540px;margin: 0 auto;}
//                     			.gal-grid-wrap .gal-grid-item {position: relative;display: block;}
//                     			.gal-grid-wrap .gal-item-frame {position: absolute;left: 0;right: 0;top: 0;bottom: 0;z-index: 5;}
//                     			.gal-grid-wrap .grid-spacer {position: relative;z-index: 1;padding: 30%;}
//                         </style>
//                       </head>
//                       <body>
//                         <div class="gal-grid-wrap">

//                         	${html_part}
//                         </div>
//                       </body>
//                     </html>
//                 `
//                 res.send({ data: {html : html, matterport_folder_name:response.data.data.folder.name}, status: true, message: "Folder received successfully" })
//             }
//             })
//             .catch((error) => {
//                 // console.error(error);
//                 // console.log('Failed to get the folder');
//                 res.send({ data: {html : '', matterport_folder_name:''}, status: false, message: "Somthing went wrong please try again" })

//             });
//         }

//     } catch (error) {
//         // console.log('get matterport Folder ', error);
//         res.send({ data: {html : '', matterport_folder_name:''}, status: false, message: "Somthing went wrong please try again" })
//     }
// }
exports.getmatterportFolderhtml = async (req, res) => {
    try {
        var where = "id = '" + req.query.user_id + "'";
        var checkUser = await commanModel.select('users', where, 'single');
        if (!checkUser || !checkUser.matterport_folder_id) {
            // res.send({ data: {html : '', matterport_folder_name:''}, status: false, message: "No matterport folder found please contact to admin" })
            res.send("Matterport twin not found")


        } else {

            // console.log('getting matterport user--------->', checkUser);
            const body = JSON.stringify({
                query: `
            query getFolderAndModelDetails($folderId: ID!) {
        folder(id: $folderId) {
            id
            name
          models(offset: null) {
            nextOffset
            totalResults
            results {
                id
                name
                assets {
                clips {
                    filename
                  url
                  thumbnailUrl
                  format
                }
              }
            }
          }
        }
      }
      `,
                variables: {
                    folderId: checkUser.matterport_folder_id
                }
            });

            const config = {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json',
                },
            };

            axios.post(endpoint, body, config)
                .then(async (response) => {

                    if (response.data.data.folder.models.results.length == 0) {
                        // res.send({ data: {html : '', matterport_folder_name:''}, status: false, message: "data not found." })
                        res.send("Matterport twin not found")
                    } else {
                        let html_part = ``
                        for (let i = 0; i < response.data.data.folder.models.results.length; i++) {

                            html_part += ` 
                    <div class="gal-grid-item">
                    <div class="grid-spacer"></div>
                    <iframe class="gal-item-frame" width="100%" height="100%" allowfullscreen="true" frameborder="0" src="https://my.matterport.com/show/?m=${response.data.data.folder.models.results[i].id}&play=1"></iframe>
                </div>`
                        }
                        res.render('./matterportview', { html_part: html_part })
                        // res.send({ data: {html : html, matterport_folder_name:response.data.data.folder.name}, status: true, message: "Folder received successfully" })
                    }
                })
                .catch((error) => {
                    console.error(error);
                    res.send("Matterport twin not found")
                    // res.send({ data: {html : '', matterport_folder_name:''}, status: false, message: "Matterport twin not found" })

                });
        }

    } catch (error) {
        console.log('get matterport Folder ', error);
        res.send("Matterport twin not found")
    }
}

async function createFolder(folderName, id) {
    try {
        const data = {
            query: `
    mutation {
      addFolder(folderDetails: {
        name: "${folderName}-${id}",
        parent: "${process.env.MATTERPORT_PARENT}"
      }) {
        id
      }
    } 
  `,
        };

        const config = {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
        };

        axios.post(endpoint, data, config)
            .then(async (response) => {
                console.log('Folder created successfully.', response.data.data.addFolder.id);
                var object = {
                    matterport_folder_id: response.data.data.addFolder.id,
                    matterport_folder_name: `${folderName}-${id}`
                };
                var updateUser = await commanModel.update('users', object, `id = ${id}`);
            })
            .catch((error) => {
                console.error(error);
                console.log('Failed to create folder.');
            });
    } catch (error) {
        if (error.response) {
            console.error('API Response Error:', error.response.data);
        } else {
            console.error('An error occurred:', error.message);
        }
    }
}


async function deleteMatterportFolder(folder_id) {
    try {
        const body = JSON.stringify({
            query: `
				mutation deleteFolder($folderId: ID!) {
					deleteFolder(id: $folderId) 
				  }
		  		`,
            variables: {
                folderId: folder_id
            }
        });

        fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-type': 'application/json'
            },
            body: body,
        })
            .then(res => res.json())
            .then(data =>
                console.log('Delete folder response------', data)
            ).catch((error) => {
                console.error(error);
                console.log('Delete folder error------');
            });

    } catch (err) {
        console.log(err)
        res.send({ status: false, message: "Somthing went wrong." });
    }
}

exports.deleteUserAccountWebView = async (req, res) => {
    try {
        let webPage = {
            pageName: "Sketch Haus Delete User"
        }
        res.render('./deleteUserAccountWeb', { webPage: webPage })
    } catch (error) {
        console.log('delete User Account Web Link ERROR', error);
    }
}


exports.deleteUserAccountWebLink = async (req, res) => {
    try {
        var where = "email = '" + req.body.email + "'";
        var checkUser = await commanModel.select('users', where, 'single');

        if (checkUser) {
            let pass = cryptr.decrypt(checkUser.password)
            if (pass == req.body.password) {
                // deleteMatterportFolder(checkUser.matterport_folder_id)
                var where1 = " `user_id` = '" + checkUser.id + "' ";

                let data = await commanModel.select('user_images', where1);
                for (let i = 0; i < data.length; i++) {
                    var filePath = appDir + '/assets/storage/images/' + data[i].img_name;
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }

                await commanModel.delete('notification', where1);
                await commanModel.delete('user_images', where1);
                await commanModel.delete('user_folder', where1);
                await commanModel.delete('user_pdf', where1);

                var where2 = " `id` = '" + checkUser.id + "' ";
                await commanModel.delete('users', where2);
                // console.log('User Deleted successfully');
                var result = { status: true, message: 'Account has been deleted' };
            }
            else {
                // console.log('Invalid password');
                var result = { status: false, message: 'Invalid password', data: {} };
            }
        }
        else {
            // console.log('User Not Found.');
            var result = { status: false, message: 'User Not Found.', data: {} };
        }
        res.send(result);

    }
    catch (err) {
        console.log(err)
        res.send({ status: false, message: 'Please try again.', data: {} });
    }
}


















// this URL give api, and using this api to get all models, all folders and subFolder and also get models that inside or folder
// https://api.matterport.com/api/graphiql/?query=query%20getFolderAndModelDetails%20%7B%0A%20%20rootFolder%20%7B%0A%20%20%20%20models(offset%3A%20null)%20%7B%0A%20%20%20%20%20%20nextOffset%0A%20%20%20%20%20%20totalResults%0A%20%20%20%20%20%20results%20%7B%0A%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20name%0A%20%20%20%20%20%20%20%20assets%20%7B%0A%20%20%20%20%20%20%20%20%20%20clips%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20filename%0A%20%20%20%20%20%20%20%20%20%20%20%20url%0A%20%20%20%20%20%20%20%20%20%20%20%20thumbnailUrl%0A%20%20%20%20%20%20%20%20%20%20%20%20format%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%20%20subfolders(offset%3A%20null)%20%7B%0A%20%20%20%20%20%20nextOffset%0A%20%20%20%20%20%20totalResults%0A%20%20%20%20%20%20results%20%7B%0A%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20name%0A%20%20%20%20%20%20%20%20models(offset%3A%20null)%20%7B%0A%20%20%20%20%20%20%20%20%20%20nextOffset%0A%20%20%20%20%20%20%20%20%20%20totalResults%0A%20%20%20%20%20%20%20%20%20%20results%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20%20%20%20%20name%0A%20%20%20%20%20%20%20%20%20%20%20%20assets%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20clips%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20filename%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20url%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20thumbnailUrl%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20format%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%23%20futher%20subfolders%20if%20necessary%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D