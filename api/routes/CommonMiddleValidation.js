const Joi = require('joi');


loginValidation = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().min(1),
        password: Joi.string().min(1),
        device_token: Joi.required(),
        device_type: Joi.string().min(1),
    }).options({ allowUnknown: true });
    validateRequest(req, next, schema, res, req.body);
};
registerValidation = (req, res, next) => {
    // console.log(req.body,"validtionnnnn")
    const schema = Joi.object({
        first_name: Joi.string().min(1),
        last_name: Joi.string().min(1),
        email: Joi.string().min(1),
        password: Joi.string().min(1),
        mobile_number: Joi.string().min(1),

        device_token: Joi.required(),
        device_type: Joi.string().min(1),
    }).options({ allowUnknown: true });
    validateRequest(req, next, schema, res, req.body);
};
forgotValidation = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().min(1),
    }).options({ allowUnknown: true });
    validateRequest(req, next, schema, res, req.body);
};
changepassValidation = (req, res, next) => {
    const schema = Joi.object({
        user_id: Joi.number().min(1),
        new_password: Joi.string().min(1),
        old_password: Joi.string().min(1),
    }).options({ allowUnknown: true });
    validateRequest(req, next, schema, res, req.body);
};
getuserprofileValidation = (req, res, next) => {
    const schema = Joi.object({
        user_id: Joi.number().min(1),
    }).options({ allowUnknown: true });
    validateRequest(req, next, schema, res, req.body);
};
createFolderValidation = (req, res, next) => {
    const schema = Joi.object({
        user_id: Joi.number().min(1),
        folder_name: Joi.string().min(1),
    }).options({ allowUnknown: true });
    validateRequest3(req, next, schema, res, req.body);
};
getFolderImageValidation = (req, res, next) => {
    const schema = Joi.object({
        user_id: Joi.number().min(1),
        folder_id: Joi.string().min(1),
    }).options({ allowUnknown: true });
    validateRequest(req, next, schema, res, req.body);
};
getFolderValidation = (req, res, next) => {
    const schema = Joi.object({
        user_id: Joi.number().min(1)
    }).options({ allowUnknown: true });
    validateRequest(req, next, schema, res, req.body);
};
updateProfileValidation = (req, res, next) => {
    const schema = Joi.object({
        user_id: Joi.number().min(1),
        first_name: Joi.string().min(1),
        last_name: Joi.string().min(1),
        email: Joi.string().min(1),
        mobile_number: Joi.string().min(1),
    });
    validateRequest(req, next, schema, res, req.body);
};
uploadImageValidation = (req, res, next) => {
    const schema = Joi.object({
        user_id: Joi.number().min(1),
        folder_id: Joi.number().min(1),
    });
    validateRequest(req, next, schema, res, req.body);
};
deleteImageValidation = (req, res, next) => {
    const schema = Joi.object({
        image_id: Joi.number().min(1),
        user_id: Joi.number().min(1),
        folder_id: Joi.number().min(1),
    });
    validateRequest(req, next, schema, res, req.body);
};
deleteUserValidation = (req, res, next) => {
    const schema = Joi.object({
        user_id: Joi.number().min(1)
    });
    validateRequest(req, next, schema, res, req.body);
};
logoutValidation = (req, res, next) => {
    const schema = Joi.object({
        user_id: Joi.number().min(1),
    }).options({ allowUnknown: true });
    validateRequest2(req, next, schema, res, req.body);
};
getnotificationValidation = (req, res, next) => {
    const schema = Joi.object({
        user_id: Joi.number().required().min(1),
    }).options({ allowUnknown: true });
    validateRequest2(req, next, schema, res, req.body);
};
updateReadStatus = (req, res, next) => {
    const schema = Joi.object({
        user_id: Joi.string().required().min(1),
    }).options({ allowUnknown: true });
    validateRequest2(req, next, schema, res, req.body);
};

getmatterportFolder = (req, res, next) => {
    const schema = Joi.object({
        user_id: Joi.string().required().min(1),
    }).options({ allowUnknown: true });
    validateRequest2(req, next, schema, res, req.body);
}

/* admin starts */
adminloginValidation = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().min(1),
        password: Joi.string().min(1),
    }).options({ allowUnknown: true });
    validateRequest(req, next, schema, res, req.body);
};
/* admin ends */
function validateRequest(req, next, schema, res) {
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: true, // ignore unknown props
        stripUnknown: true // remove unknown props
    };
    const { error, value } = schema.validate(req.body, options);
    var errors = "";
    if (error) {
        for (let [indexes, values] of error.details.entries()) {
            var errorsMessage = (values.message).replace('\"', "");
            errors += errorsMessage.replace('\"', "") + ', ';
        }
        return res.send({ status: false, message: errors, data: {} })
    } else {
        req.body = value;
        next();
    }
}
function validateRequest2(req, next, schema, res) {
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: true, // ignore unknown props
        stripUnknown: true // remove unknown props
    };
    const { error, value } = schema.validate(req.body, options);
    var errors = "";
    if (error) {
        for (let [indexes, values] of error.details.entries()) {
            var errorsMessage = (values.message).replace('\"', "");
            errors += errorsMessage.replace('\"', "") + ', ';
        }
        return res.send({ status: false, message: errors })
    } else {
        req.body = value;
        next();
    }
}
function validateRequest3(req, next, schema, res) {
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: true, // ignore unknown props
        stripUnknown: true // remove unknown props
    };
    const { error, value } = schema.validate(req.body, options);
    var errors = "";
    if (error) {
        for (let [indexes, values] of error.details.entries()) {
            var errorsMessage = (values.message).replace('\"', "");
            errors += errorsMessage.replace('\"', "") + ', ';
        }
        return res.send({ status: false, message: errors, data: [] })
    } else {
        req.body = value;
        next();
    }
}

const CommonMiddleValidation = {
    loginValidation,
    registerValidation,
    forgotValidation,
    changepassValidation,
    getuserprofileValidation,
    createFolderValidation,
    getFolderImageValidation,
    getFolderValidation,
    updateProfileValidation,
    uploadImageValidation,
    deleteImageValidation,
    deleteUserValidation,
    adminloginValidation,
    getnotificationValidation,
    logoutValidation,
    updateReadStatus,
    getmatterportFolder





}

module.exports = CommonMiddleValidation;
