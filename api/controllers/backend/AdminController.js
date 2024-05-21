
var fs = require('fs');
var md5 = require('md5');
const nodemailer = require('nodemailer');
var generateSafeId = require('generate-safe-id');
let transport = nodemailer.createTransport({
	host: process.env.MAIL_HOST,
	port: process.env.MAIL_PORT,
	secure: false,
	from: 'SketchHaus <info@sketchhaus.com>',
	auth: {
		user: process.env.MAIL_USERNAME,
		pass: process.env.MAIL_PASSWORD
	}
});
// const fetch = require('node-fetch');
var moment = require('moment-timezone');
const commanModel = require('../../models/comman-model');
const commanHelper = require('../helper');
const { json } = require('body-parser');
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.SECRET_KEY, { pbkdf2Iterations: 10000, saltLength: 10 });
var jwt = require('jsonwebtoken');
const path = require('path');
const fetch = require("node-fetch");
const endpoint = "https://api.matterport.com/api/models/graph";
const TOKEN_ID = process.env.TOKEN_ID;
const TOKEN_SECRET = process.env.TOKEN_SECRET;
const auth = Buffer.from(TOKEN_ID + ':' + TOKEN_SECRET).toString('base64');

exports.login = async function (req, res) {
	try {
		var where = "email = '" + req.body.email + "'";
		var checkUser = await commanModel.select('admin_user', where, 'single');
		// console.log(checkUser)
		if (checkUser) {
			let token = "" + req.body.email + "SketchHausAdmin";
			var get_token = jwt.sign({ data: token }, 'secret', { expiresIn: '24h' });
			let B_token = 'Bearer_' + get_token + '';
			await commanModel.insert('admin_auth', { user_id: checkUser.id, auth_token: B_token })
			let pass = cryptr.decrypt(checkUser.password)
			if (pass == req.body.password) {
				delete checkUser.password
				checkUser.auth_token = B_token
				var result = { status: true, message: 'login successfully', data: checkUser };
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
		commanHelper.sendlogger('adminlogin', req, err);
		res.send({ status: false, message: 'Please try again.' });
	}
}
exports.getadminUserById = async function (req, res) {
	try {
		var where = "id = '" + req.body.id + "'";
		var data = await commanModel.select('admin_user', where, 'single');

		if (data) {
			let obj = {
				first_name: data.first_name,
				last_name: data.last_name,
				email: data.email,
				password: cryptr.decrypt(data.password),
				profile_img: nodeSiteUrl + '/storage/users/' + data.profile_img,
			}
			var result = { status: true, message: 'data found ', data: obj };
		}
		else {
			var result = { status: false, message: 'data Not Found.', data: {} };
		}
		res.send(result);

	}
	catch (err) {
		console.log(err)
		commanHelper.sendlogger('getadminUserById', req, err);
		res.send({ status: false, message: 'Please try again.' });
	}
}
exports.forgotpassword = async (req, res, next) => {
	try {
		var where = "email = '" + req.body.email + "'";
		var checkUser = await commanModel.select('admin_user', where, 'single');

		if (checkUser) {
			var newpassword = generateSafeId().slice(0, 10);
			var sql = "UPDATE `admin_user` SET `password`='" + cryptr.encrypt(newpassword) + "' WHERE `id` = '" + checkUser.id + "'";
			await commanModel.sqlQuery(sql, 'single');


			const mailOptions = {
				from: 'SketchHaus <info@sketchhaus.com>',
				to: `${checkUser.email}`,
				subject: 'SketchHaus',
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
                <!-- <img style="height: 100px;" src="${nodeSiteUrl}/backend/dist/img/SketchHaus-logo.svg" -->
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
		console.log(err)
		commanHelper.sendlogger('adminforgotPassword', req, err);
		res.send({ status: false, message: 'Please try again.' });
	}
};
exports.getUserList = async function (req, res) {

	try {

		var where = "id = '" + req.body.id + "'";

		let que = "SELECT * FROM users WHERE 1";
		if (req.body.filter) {
			que += " && (last_name LIKE '%" + req.body.filter + "%' OR first_name LIKE '%" + req.body.filter + "%' OR email LIKE '%" + req.body.filter + "%' OR mobile_number LIKE '%" + req.body.filter + "%' OR concat(users.first_name,users.last_name) LIKE '%" + req.body.filter.replace(/ /g, "") + "%')";
		}
		if (req.body.sfilter) {
			que += " && status LIKE '%" + req.body.sfilter + "%'";
		}

		if (req.body.pfilter) {
			que += " && progress_status LIKE '%" + req.body.pfilter + "%'";
		}
		que += ' ORDER BY `id` DESC';

		var data = await commanModel.sqlQuery(que);

		if (data) {
			for (let i = 0; i < data.length; i++) {
				var filePath = appDir + '/assets/storage/users/' + data[i].profile_img;
				if (fs.existsSync(filePath)) {
					data[i].profile_img = nodeSiteUrl + '/storage/users/' + data[i].profile_img;
				}
				else {
					data[i].profile_img = nodeSiteUrl + '/storage/users/default.png';
				}

			}
			var result = { status: true, message: 'data found ', data: data };
		}
		else {
			var result = { status: false, message: 'data Not Found.', data: {} };
		}
		res.send(result);

	}
	catch (err) {
		console.log(err)
		commanHelper.sendlogger('getUserList', req, err);
		res.send({ status: false, message: 'Please try again.' });
	}
}
exports.getUserById = async function (req, res) {
	try {
		var where = "id = '" + req.body.id + "'";
		var data = await commanModel.select('users', where, 'single');

		if (data) {

			var filePath = appDir + '/assets/storage/users/' + data.profile_img;
			if (fs.existsSync(filePath)) {
				data.profile_img = nodeSiteUrl + '/storage/users/' + data.profile_img;
			}
			else {
				data.profile_img = nodeSiteUrl + '/storage/users/default.png';
			}
			data.name = (data.first_name.charAt(0).toUpperCase() + data.first_name.slice(1)) + ' ' + (data.last_name ? data.last_name.charAt(0).toUpperCase() + data.last_name.slice(1) : '')
			data.created_at = moment(data.created_at).format('MMM/DD/YYYY  HH:mm:ss')

			var result = { status: true, message: 'data found ', data: data };
		}
		else {
			var result = { status: false, message: 'data Not Found.', data: {} };
		}
		res.send(result);

	}
	catch (err) {
		console.log(err)
		commanHelper.sendlogger('getUserById', req, err);
		res.send({ status: false, message: 'Please try again.', data: {} });
	}
}
exports.uploadPdf = async function (req, res) {
	try {
		let obj = {
			name: req.file.filename,
			user_id: req.body.user_id
		}
		var data = await commanModel.insert('user_pdf', obj);

		let message = "Great...! Your Design is ready check your registered mail"
		await commanModel.insert('notification', { user_id: req.body.user_id, title: 'Your Documents are Ready!', body: message, created_at: req.body.created_at });

		if (req.body.device_type == 'iOS') {
			if (req.body.device_token) {
				let badge = await commanModel.select('notification', `user_id = ${req.body.user_id} and read_status = 0`)
				await commanHelper.iosNotification(req.body.device_token, 'Your Documents are Ready!', message, badge.length);
			}
		}
		if (req.body.device_type == 'android') {
			if (req.body.device_token) {
				await commanHelper.androidNotification(req.body.device_token, 'Your Documents are Ready!', message)
			}
		}

		if (data.insertId) {
			const mailOptions = {
				from: 'SketchHaus <info@sketchhaus.com>',
				to: `${req.body.email}`,
				subject: 'SketchHaus',
				html: `<html lang="en-US">  <head></head><body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0"><meta content="text/html; charset=utf-8" http-equiv="Content-Type"> 
                <meta name="description" content=""> 
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
                <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:Rubik,sans-serif;">Congrats! Your documents are ready to download! </h1> 
                <spanstyle="display:inline-block; vertical-align:middle;="" margin:29px="" 0="" 26px;="" border-bottom:1px="" solid#cecece;="" width:100px;"=""> 
                <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">We are one step closer to seeing your dreams become a reality! </p> 
               
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
               `,
				attachments: [
					{   // use URL as an attachment
						filename: 'SketchHaus.pdf',
						// path: nodeSiteUrl + '/storage/pdf/' + req.file.filename,
						contentType: 'application/pdf',
						path: path.join(__dirname, '../../assets/storage/pdf/' + req.file.filename),
					},
				]
			};

			transport.sendMail(mailOptions, async function (err, info) {
				if (err) {
					console.log(err)
				}
			})


			res.send({ status: true, message: 'Mail sent successfully' });
		}

		else {
			res.send({ status: false, message: 'Mail not sent', data: {} });
		}
	}

	catch (err) {
		console.log(err)
		commanHelper.sendlogger('uploadPdf', req, err);
		res.send({ status: false, message: 'Please try again.' });
	}
}
exports.dashboardTotalcounts = async function (req, res) {
	try {
		let sql = "SELECT COUNT(users.id) as user ,	(SELECT COUNT(users.id) FROM`users` WHERE`progress_status` = '0') as initial,(SELECT COUNT(`users`.`id`) FROM `users` WHERE`progress_status` = '1') as inprogress, (SELECT COUNT(`users`.`id`) FROM `users` WHERE`progress_status` = '2') as delivered FROM `users`"
		let result = await commanModel.sqlQuery(sql, 'single')
		res.send({ status: true, message: "data found", data: result })
	}
	catch (err) {
		res.send({ status: false, message: "data not found", data: {} })

	}
}
exports.userchart = async function (req, res) {
	try {
		let slq2 = `SELECT MONTH(created_at) as month , COUNT(id) as count FROM users WHERE YEAR(created_at) = '${req.body.year}' GROUP BY MONTH(created_at)`
		let result2 = await commanModel.sqlQuery(slq2)
		let aa = []

		// for (let i = 0; i <= 11; i++) {

		// 	if (result2[i]) {
		// 		aa.push(result2[i])
		// 	}
		// 	else {
		// 		aa.push({ month: i, count: 0 })
		// 	}
		// }
		// var reslt = aa.sort(({ month: a }, { month: b }) => a - b);

		for (let i = 1; i <= 12; i++) {
			if (!result2.some(e => e.month == i)) {
				result2.push({ month: i, count: 0 })
			}
		}
		var reslt = result2.sort(({ month: a }, { month: b }) => a - b);

		let totalcount = 0
		for (let i = 0; i < result2.length; i++) {
			totalcount += result2[i].count
		}
		res.send({ status: true, message: "data found", data: reslt, totalcount: totalcount })

	}
	catch (err) {
		console.log(err)
		res.send({ status: false, message: "data not found", data: [], totalcount: 0 })

	}
}
exports.initialuserchart = async function (req, res) {
	try {
		let slq2 = `SELECT MONTH(created_at) as month , COUNT(id) as count FROM users WHERE YEAR(created_at) = '${req.body.year}' and progress_status = 0 GROUP BY MONTH(created_at)`
		let result2 = await commanModel.sqlQuery(slq2)

		let aa = []

		for (let i = 1; i <= 12; i++) {
			if (!result2.some(e => e.month == i)) {
				result2.push({ month: i, count: 0 })
			}
		}
		var reslt = result2.sort(({ month: a }, { month: b }) => a - b);

		let totalcount = 0
		for (let i = 0; i < result2.length; i++) {
			totalcount += result2[i].count
		}
		res.send({ status: true, message: "data found", data: reslt, totalcount: totalcount })

	}
	catch (err) {
		console.log(err)
		res.send({ status: false, message: "data not found", data: [], totalcount: 0 })

	}
}
exports.inprogressuserchart = async function (req, res) {
	try {
		let slq2 = `SELECT MONTH(created_at) as month , COUNT(id) as count FROM users WHERE YEAR(created_at) = '${req.body.year}' and progress_status = 1 GROUP BY MONTH(created_at)`
		let result2 = await commanModel.sqlQuery(slq2)
		// var myarray = result2

		let aa = []

		for (let i = 1; i <= 12; i++) {
			if (!result2.some(e => e.month == i)) {
				result2.push({ month: i, count: 0 })
			}
		}
		var reslt = result2.sort(({ month: a }, { month: b }) => a - b);
		let totalcount = 0
		for (let i = 0; i < result2.length; i++) {
			totalcount += result2[i].count
		}
		res.send({ status: true, message: "data found", data: reslt, totalcount: totalcount })

	}
	catch (err) {
		console.log(err)
		res.send({ status: false, message: "data not found", data: [], totalcount: 0 })

	}
}
exports.delivereduserchart = async function (req, res) {
	try {
		let slq2 = `SELECT MONTH(created_at) as month , COUNT(id) as count FROM users WHERE YEAR(created_at) = '${req.body.year}' and progress_status = 2 GROUP BY MONTH(created_at)`
		let result2 = await commanModel.sqlQuery(slq2)
		// var myarray = result2

		let aa = []

		for (let i = 1; i <= 12; i++) {
			if (!result2.some(e => e.month == i)) {
				result2.push({ month: i, count: 0 })
			}
		}
		var reslt = result2.sort(({ month: a }, { month: b }) => a - b);

		let totalcount = 0
		for (let i = 0; i < result2.length; i++) {
			totalcount += result2[i].count
		}
		res.send({ status: true, message: "data found", data: reslt, totalcount: totalcount })

	}
	catch (err) {
		console.log(err)
		res.send({ status: false, message: "data not found", data: [], totalcount: 0 })

	}
}
exports.changeproress = async function (req, res) {

	try {
		let where = ` id = ${req.body.id}`
		await commanModel.update('users', { progress_status: req.body.progress_status }, where)
		let message = ''
		if (req.body.progress_status == 0) message = "Great...! Your work is in Initial state"
		if (req.body.progress_status == 1) message = "Great...! Your work is in Inprogress state"
		if (req.body.progress_status == 2) message = "Great...! Your work is in Delivered state"
		await commanModel.insert('notification', { created_at: req.body.created_at, user_id: req.body.id, title: 'Progress Status', body: message });
		if (req.body.device_type == 'iOS') {
			if (req.body.device_token) {
				let badge = await commanModel.select('notification', `user_id = ${req.body.id} and read_status = 0`)
				await commanHelper.iosNotification(req.body.device_token, 'Progress Status', message, badge.length);
			}
		}
		if (req.body.device_type == 'android') {
			if (req.body.device_token) {
				await commanHelper.androidNotification(req.body.device_token, 'Progress Status', message)
			}
		}

		res.send({ status: true, message: "Progress status changed successfully" })
	}
	catch (err) {
		console.log(err)
		res.send({ status: false, message: "Progress status not changed" })


	}
}
exports.deleteUserAccount = async function (req, res) {
	// need to delete all users images as well
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
exports.getusrefolder = async function (req, res) {
	try {
		// var sql = "SELECT id as folder_id,folder_name from user_folder where `user_id` = '" + req.body.user_id + "'";

		var sql = "SELECT (SELECT COUNT(id) as count FROM `user_images` WHERE user_id = " + req.body.user_id + " and folder_id = user_folder.id)as img_count, user_folder.id as folder_id ,user_folder.folder_name from user_folder LEFT JOIN user_images ON user_images.folder_id = user_folder.id where user_folder.`user_id` = " + req.body.user_id + " GROUP by user_folder.id ORDER by user_folder.created_at "

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
exports.getusreimagesbyfolder = async function (req, res) {
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
		commanHelper.sendlogger('getusreimagesbyfolder', req, err);
		res.send({ status: false, message: "data not found.", data: [] });
	}
}
exports.adminUpdate = async function (req, res) {

	if (req.file) {
		req.body.profile_img = req.file.filename
	}
	req.body.password = cryptr.encrypt(req.body.password)

	var where = "id = '" + req.body.id + "'";
	var data = await commanModel.select('admin_user', where, 'single');
	if (data.profile_img != 'default.png' && data && req.file != undefined && data != undefined && req.body.profile_img != data.profile_img) {

		var filePath = appDir + '/assets/storage/users/' + data.profile_img;
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);

		}

	}
	try {
		var data = await commanModel.update('admin_user', req.body, where);

		if (data) {
			var result = { status: true, message: "Profile updated successfully." };
		} else {
			var result = { status: false, message: "Somthing went wrong." };
		}
		res.send(result);
	} catch (err) {
		console.log(err)
		commanHelper.sendlogger('adminUpdate', req, err);
		res.send({ status: false, message: "data not found." });
	}
}
exports.changeUserStatus = async function (req, res) {
	// return
	try {

		var where = "id = " + req.body.id + ""
		var data = await commanModel.update('users', { status: req.body.status }, where);
		if (data) {
			var result = { status: true, message: "status updated successfully." };
		} else {
			var result = { status: false, message: "Somthing went wrong." };
		}
		res.send(result);
	} catch (err) {
		console.log(err)
		commanHelper.sendlogger('changeUserStatus', req, err);
		res.send({ status: false, message: "Somthing went wrong." });
	}
}
exports.deleteiamges = async function (req, res) {

	try {

		for (let i = 0; i <= req.body.img_name_arr.length; i++) {
			var filePath = appDir + '/assets/storage/images/' + req.body.img_name_arr[i];

			if (fs.existsSync(filePath)) {

				fs.unlinkSync(filePath);
			}
		}
		let sql = 'DELETE FROM `user_images` WHERE id IN(' + req.body.imgarr + ')'

		var data = await commanModel.sqlQuery(sql);

		res.send({ status: true, message: "Images deleted successfully." });

	} catch (err) {
		console.log(err)
		commanHelper.sendlogger('deleteiamges', req, err);
		res.send({ status: false, message: "Somthing went wrong." });
	}

}
exports.sendNotification = async function (req, res) {
	// console.log(req.body,"bodyyyyyyyyyyyyyy")

	try {

		for (let i = 0; i < req.body.user_ids.length; i++) {
			await commanModel.insert('notification', { created_at: req.body.created_at, user_id: req.body.user_ids[i].id, title: req.body.msgtitle, body: req.body.msgbody });
			// write send notification code here

			if (req.body.user_ids[i].device_type == 'iOS') {
				if (req.body.user_ids[i].device_token) {
					let badge = await commanModel.select('notification', `user_id = ${req.body.user_ids[i].id} and read_status = 0`)
					let a = await commanHelper.iosNotification(req.body.user_ids[i].device_token, req.body.msgtitle, req.body.msgbody, badge.length);
				}
			}
			if (req.body.user_ids[i].device_type == 'android') {
				if (req.body.user_ids[i].device_token) {
					await commanHelper.androidNotification(req.body.user_ids[i].device_token, req.body.msgtitle, req.body.msgbody)
				}
			}

		}
		res.send({ status: true, message: "Notification sent successfully." });

	} catch (err) {
		console.log(err)
		commanHelper.sendlogger('sendBulkNotification', req, err);
		res.send({ status: false, message: "Somthing went wrong." });
	}
}
exports.deletetoken = async function (req, res) {
	try {
		let where = "auth_token = '" + req.body.auth_token + "'"
		let result = await commanModel.delete('admin_auth', where)

		res.send({ status: true, message: "logged out successfull" });

	} catch (err) {
		console.log(err)
		commanHelper.sendlogger('deletetoken', req, err);
		res.send({ status: false, message: "Somthing went wrong." });
	}

}
exports.getuserpdffiles = async function (req, res) {
	try {

		var where = "`user_id` = " + req.body.user_id + ""

		var data = await commanModel.select('user_pdf', where);

		if (data) {

			for (let i = 0; i < data.length; i++) {
				data[i].url = nodeSiteUrl + '/storage/pdf/' + data[i].name;

			}

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
exports.deletefolders = async function (req, res) {
	try {
		for (let i = 0; i < req.body.folder_id_arr.length; i++) {
			// get images name and id by folder id 
			var images = await commanModel.sqlQuery('SELECT * FROM `user_images` WHERE `user_id` = ' + req.body.user_id + ' AND `folder_id` = ' + req.body.folder_id_arr[i] + '');

			for (let j = 0; j < images.length; j++) {
				//delete from files and then delete from database
				var filePath = appDir + '/assets/storage/images/' + images[j].img_name;
				if (fs.existsSync(filePath)) {
					fs.unlinkSync(filePath);
				}
			}
			let sql = 'DELETE FROM `user_images` WHERE user_id = ' + req.body.user_id + ' AND folder_id = ' + req.body.folder_id_arr[i] + ' '
			await commanModel.sqlQuery(sql);
			let sql1 = 'DELETE FROM `user_folder` WHERE user_id = ' + req.body.user_id + ' AND id = ' + req.body.folder_id_arr[i] + ' '
			await commanModel.sqlQuery(sql1);
		}
		res.send({ status: true, message: "Folders deleted successfully." });

	} catch (err) {
		console.log(err)
		commanHelper.sendlogger('deleteiamges', req, err);
		res.send({ status: false, message: "Somthing went wrong." });
	}

}
exports.deletepdf = async function (req, res) {
	console.log(req.body, "deletepdf")


	try {

		for (let j = 0; j < req.body.pdf_name_arr.length; j++) {
			//delete from files and then delete from database
			var filePath = appDir + '/assets/storage/pdf/' + req.body.pdf_name_arr[j];
			console.log(fs.existsSync(filePath))
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			}
		}
		let sql = 'DELETE FROM `user_pdf` WHERE user_id = ' + req.body.user_id + ' AND id IN(' + req.body.pdf_id_arr + ') '
		await commanModel.sqlQuery(sql);
		console.log(sql, "sql")

		res.send({ status: true, message: "Pdf file deleted successfully." });

	} catch (err) {
		console.log(err)
		commanHelper.sendlogger('deletepdf', req, err);
		res.send({ status: false, message: "Somthing went wrong." });
	}

}

exports.getMatterportFolder = async function (req, res) {
	let folderID = req.body.id;
	try {
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
				folderId: folderID
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
				res.send({ data: data.data.folder, status: true, message: "Folder received successfully" })
			).catch((error) => {
				console.error(error);
				console.log('Failed to create folder.');
			});

	} catch (err) {
		console.log(err)
		res.send({ status: false, message: "Somthing went wrong." });
	}
}