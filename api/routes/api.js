var express = require('express');
var router = express.Router();

const multer = require('multer');
const commanModel = require('../models/comman-model');

var jwt = require('jsonwebtoken');

const storage2 = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, './assets/storage/users/')
    },
    filename: function (req, file, cb) {
        var fileFormat = (file.originalname).split(".");
        cb(null, Date.now() + '.' + fileFormat[fileFormat.length - 1])
    }
});
const storage3 = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, './assets/storage/images/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});
const storage4 = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, './assets/storage/pdf/')
    },
    filename: function (req, file, cb) {
        var fileFormat = (file.originalname).split(".");
        cb(null, Date.now() + '.' + fileFormat[fileFormat.length - 1])
    }
});


const fileFilter = (req, file, cb) => {
    cb(null, true);
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/jpg' || file.mimetype == 'image/png' || file.mimetype == 'multipart/form-data' || file.mimetype == '') {
    }
    else {
        cb(null, false);
    }
}
const userUpload = multer({ storage: storage2, fileFilter: fileFilter });
const imageUpload = multer({ storage: storage3, fileFilter: fileFilter });
const Uploadfile = multer({ storage: storage4, fileFilter: fileFilter });



var UsersController = require('../controllers/api/UsersController');
var AdminController = require('../controllers/backend/AdminController')
const CommonMiddleValidation = require('./CommonMiddleValidation');


router.post('/admin/login', [CommonMiddleValidation.adminloginValidation], AdminController.login);
router.post('/admin/getadminUserById/', adminAuthentication, AdminController.getadminUserById);
router.post('/admin/forgotpassword', AdminController.forgotpassword);
router.post('/admin/getuserlist', adminAuthentication, AdminController.getUserList);
router.post('/admin/getUserById', adminAuthentication, AdminController.getUserById);
router.post('/admin/userchart', adminAuthentication, AdminController.userchart);
router.post('/admin/initialuserchart', adminAuthentication, AdminController.initialuserchart);
router.post('/admin/inprogressuserchart', adminAuthentication, AdminController.inprogressuserchart);
router.post('/admin/delivereduserchart', adminAuthentication, AdminController.delivereduserchart);
router.post('/admin/dashboardTotalcounts', adminAuthentication, AdminController.dashboardTotalcounts);
router.post('/admin/deleteuserById', adminAuthentication, AdminController.deleteUserAccount);
router.post('/admin/getusrefolder', adminAuthentication, AdminController.getusrefolder);
router.post('/admin/getusreimagesbyfolder', adminAuthentication, AdminController.getusreimagesbyfolder);
router.post('/admin/adminUpdate', adminAuthentication, userUpload.single('profile_img'), AdminController.adminUpdate);
router.post('/admin/changeUserStatus', adminAuthentication, AdminController.changeUserStatus);
router.post('/admin/deleteiamges', adminAuthentication, AdminController.deleteiamges);
router.post('/admin/uploadPdf', adminAuthentication, Uploadfile.single('file'), AdminController.uploadPdf);
router.post('/admin/changeproress', adminAuthentication, AdminController.changeproress);
router.post('/admin/sendNotification', adminAuthentication, AdminController.sendNotification);
router.post('/admin/deletetoken', AdminController.deletetoken);
router.post('/admin/getuserpdffiles', adminAuthentication, AdminController.getuserpdffiles);
router.post('/admin/deletefolders', adminAuthentication, AdminController.deletefolders);
router.post('/admin/deletepdf', adminAuthentication, AdminController.deletepdf);
router.post('/admin/getMatterportFolder', AdminController.getMatterportFolder);



/* app path start */

/* User STARTS */

router.post('/api/cv-15021990-login', [CommonMiddleValidation.loginValidation], UsersController.login);
router.post('/api/cv-15021990-registration', [CommonMiddleValidation.registerValidation], UsersController.register);
router.post('/api/cv-15021990-forgot-password', [CommonMiddleValidation.forgotValidation], UsersController.forgotPassword);
router.post('/api/cv-15021990-change-password', [CommonMiddleValidation.changepassValidation, requiredUserAuthentication], UsersController.changePassword);
router.post('/api/cv-15021990-get-user-profile', [CommonMiddleValidation.getuserprofileValidation, requiredUserAuthentication], UsersController.getUserProfile);
router.post('/api/cv-15021990-create-folder', [CommonMiddleValidation.createFolderValidation, requiredUserAuthentication], UsersController.createFolder);
router.post('/api/cv-15021990-get-folder', [CommonMiddleValidation.getFolderValidation, requiredUserAuthentication], UsersController.getFolder);
router.post('/api/cv-15021990-get-folder-image', [CommonMiddleValidation.getFolderImageValidation, requiredUserAuthentication], UsersController.getFolderImage);
router.post('/api/cv-15021990-update-profile', userUpload.single('profile_img'), [CommonMiddleValidation.updateProfileValidation, requiredUserAuthentication], UsersController.updateProfile);
router.post('/api/cv-15021990-upload-image', imageUpload.single('image'), [CommonMiddleValidation.uploadImageValidation, requiredUserAuthentication], UsersController.uploadImage);
// router.post('/api/cv-15021990-delete-image', [CommonMiddleValidation.deleteImageValidation, requiredUserAuthentication], UsersController.deleteImage);
router.post('/api/cv-15021990-delete-user-account', [CommonMiddleValidation.deleteUserValidation, requiredUserAuthentication], UsersController.deleteUserAccount);
router.post('/api/cv-15021990-logout', [CommonMiddleValidation.logoutValidation, requiredUserAuthentication], UsersController.logout);
router.post('/api/cv-15021990-get-user-notification', [CommonMiddleValidation.getnotificationValidation, requiredUserAuthentication], UsersController.getNotifications)
router.post('/api/cv-15021990-update-read-status', [CommonMiddleValidation.updateReadStatus, requiredUserAuthentication], UsersController.updateReadStatus)
router.get('/api/cv-15021990-get-matterport-folder',UsersController.getmatterportFolderhtml);
router.get('/api/cv-15021990-delete-user-account-web-link',UsersController.deleteUserAccountWebView);
router.post('/api/cv-15021990-delete-user-account-web-link',UsersController.deleteUserAccountWebLink);



async function requiredUserAuthentication(req, res, next) {
    try {
        var where = "`id`='" + req.body.user_id + "'";
        var checkUser = await commanModel.select('users', where, 'single');
        if (checkUser) {
            if (checkUser.status == 1) {
                if (req.headers.authorization && checkUser.auth_token == req.headers.authorization) {
                    next();
                }
                else {
                    var result = { status: false, message: 'Wrong authorization' }
                    res.send(result);
                }
            }
            else {
                var result = { status: false, message: 'Your account has been blocked by Support' }
                res.send(result);
            }
        }
        else {
            // var result = { status: false, message: 'This user does not exist' }
            var result = { status: false, message: 'Wrong authorization' }
            res.send(result);
        }
    }
    catch (err) {
        console.log(err)
    }
}

async function adminAuthentication(req, res, next) {
    try {

        let authToken = req.headers.authorization.split("Bearer_")[1]
        var decoded_token = await jwt.verify(authToken, 'secret', function (err, decoded) {
            if (err) {
                return false;
            }
            else {
                return true;
            }
        })
        if (decoded_token == true) {

            var where = "`auth_token`='" + req.headers.authorization + "'";
            var checkUser = await commanModel.select('admin_auth', where, 'single');
            if (checkUser) {
                next();
            }
            else {
          
                await commanModel.delete('admin_auth', where)
                var result = { status: false, message: 'Wrong authorization' }
                res.send(result);
            }
        }
        else {
            await commanModel.delete('admin_auth', where)
            var result = { status: false, message: 'Session is expired please login again' }
            res.send(result);
        }
    }
    catch (err) {
        console.log(err)
        var where = "`auth_token`='" + req.headers.authorization + "'";
        await commanModel.delete('admin_auth', where)
        var result = { status: false, message: 'Session is expired please login again' }
        res.send(result)
    }
}


/* app path end */

module.exports = router;  
