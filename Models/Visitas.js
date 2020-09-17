'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const date = new Date()

const Chart = Schema({
    fecha: {type: String, default: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`},
    visitas: {type: Number, default: 1}
})

module.exports = mongoose.model('Visitas', Chart);