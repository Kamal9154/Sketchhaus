var app = require('express')();
var fs = require('fs');
// const { base64encode, base64decode } = require('nodejs-base64');
var moment = require('moment-timezone');
var deviceDetector = require('node-device-detector');
var jwt = require('jsonwebtoken');
const commanModel = require('../../models/comman-model');
const commanHelper = require('../helper');
require('dotenv').config();
const detector = new deviceDetector({
    clientIndexes: true,
    deviceIndexes: true,
    deviceAliasCode: false,
});