'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const Comment = Schema({
    mensaje: {type: String, default: ''},
    foto: {type: String, default: null},
    idDocente: Schema.Types.ObjectId,
    fecha: {type: Date, default: Date.now},

})

module.exports = Comment;