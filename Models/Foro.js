'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ForoSchema = Schema({
    idDocente: Schema.Types.ObjectId,
    titulo: String,
    descripcion: String,
    imagen: {type: String, default: null},
    datePublish: {type: Date, default: Date.now},
    comentarios: {type: Number, default: 0}
});

module.exports = mongoose.model('foro', ForoSchema);