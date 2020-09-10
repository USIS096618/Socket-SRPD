'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const Chat = Schema({
    mensaje: {type: String, default: ''},
    foto: {type: String, default: null},
    Nombre: {type: String, default: 'SRP'},
    fecha: {type: Date, default: Date.now}
})

module.exports = Chat;