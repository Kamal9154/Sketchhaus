var mysql = require('mysql');
var connection = mysql.createConnection({
    host: nodeEnv.parsed.DB_HOST,
    user: nodeEnv.parsed.DB_USERNAME,
    password: nodeEnv.parsed.DB_PASSWORD,
    database: nodeEnv.parsed.DB_DATABASE,
    charset: 'utf8mb4'
});

module.exports = {
    select: function (table, where, condition, length, callback) {
        if (where) {
            var sql = "select * from `" + table + "` where " + where;
        }
        else {
            var sql = "select * from `" + table + "` ";
        }
        return new Promise((resolve, reject) => {
            connection.query(sql, function (error, result) {
                if (result)
                    if (condition == 'single') {
                        resolve(result[0])
                    }
                    else {
                        resolve(result)
                    }
                else reject(error);
            });

        });
    },
    insert: function (table, data, callback) {
        var columns = [];
        var values = [];
        for (let [key, value] of Object.entries(data)) {
            columns.push('`' + key + '`');
            values.push(connection.escape(value));
        }
        var sql = 'insert into `' + table + '` (' + columns.join(',') + ') values (' + values.join(',') + ') ';
        return new Promise((resolve, reject) => {
            connection.query(sql, function (error, result) {
                if (result) {
                    resolve(result)
                }
                else reject(error);
            });
        });
    },
    update: function (table, data, where, callback) {
        var columns_values_arr = [];
        for (let [key, value] of Object.entries(data)) {
            var columns_values = "`" + key + "`=" + connection.escape(value) + "";
            columns_values_arr.push(columns_values);
        }
        var sql = "update `" + table + "` set " + columns_values_arr + " where " + where;
       
        return new Promise((resolve, reject) => {
            connection.query(sql, function (error, result) {
                if (result) {
                    resolve(result)
                }
                else reject(error);
            });

        });
    },
    sqlQuery: function (sql, condition, callback) {
        return new Promise((resolve, reject) => {
            connection.query(sql, function (error, result) {
                if (result)
                    if (condition == 'single') {
                        resolve(result[0])
                    }
                    else {
                        resolve(result)
                    }
                else reject(error);
            });
        });
    },

    logger: function (data) {
        var sql = 'INSERT INTO `logger`(`device_details`,`api_function`, `request_detail`, `log_detail`) VALUES ("' + connection.escape(data.device_details) + '","' + data.api_function + '","' + connection.escape(data.request_detail) + '","' + connection.escape(data.log_detail) + '")';
        //   console.log(sql)
        return new Promise((resolve, reject) => {
            connection.query(sql, function (error, result) {
                if (result) {
                    resolve(result)
                }
                else reject(error);
            });
        });
    },
    countryCode: function (value, key) {
        // var sql = 'INSERT INTO `logger`(`device_details`,`api_function`, `request_detail`, `log_detail`) VALUES ("' + connection.escape(data.device_details) + '","' + data.api_function + '","' + connection.escape(data.request_detail) + '","' + connection.escape(data.log_detail) + '")';
        var sql = "UPDATE `settings` SET `meta_value`= " + connection.escape(value) + " WHERE `meta_key` = '" + key + "'";
        //   console.log(sql)
        return new Promise((resolve, reject) => {
            connection.query(sql, function (error, result) {
                if (result) {
                    resolve(result)
                }
                else reject(error);
            });
        });
    },
    delete: function (table, where) {
        if (where) {
            var sql = "DELETE FROM `" + table + "` WHERE " + where + "";
        }
        else {
            var sql = "DELETE FROM  `" + table + "` ";
        }
        return new Promise((resolve, reject) => {
            connection.query(sql, function (error, result) {
                if (result)
                    resolve(result);
                else reject(error);
            });

        });
    },
}