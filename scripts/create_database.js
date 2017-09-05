/**
 * node scripts/create_database.js
 */

var mysql = require('mysql');
var dbconfig = require('../config/database');

var connection = mysql.createConnection(dbconfig.connection);

connection.query('CREATE DATABASE ' + dbconfig.database);

connection.query('\
CREATE TABLE `' + dbconfig.database + '`.`' + dbconfig.users_table + '` ( \
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `email` VARCHAR(80) NOT NULL, \
    `nombre` VARCHAR(20) NULL, \
    `apellidopaterno` VARCHAR(20) NULL, \
    `apellidomaterno` VARCHAR(20) NULL, \
    `rol` enum("general", "contenido", "profesor", "alumno") NULL, \
    `password` CHAR(100) NOT NULL, \
    `activo` enum("si", "no") NULL, \
        PRIMARY KEY (`id`), \
    UNIQUE INDEX `id_UNIQUE` (`id` ASC), \
    UNIQUE INDEX `email_UNIQUE` (`email` ASC) \
)');

console.log('Success: Database Created!')

connection.end();
