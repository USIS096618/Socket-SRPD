const Config = require('./Config')
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
const Chat = require('./Models/Chat');
const Comment = require('./Models/Comments')
const Foro = require('./Models/Foro')
const Visitas = require('./Models/Visitas')

mongoose.set('useFindAndModify', false);

mongoose.Promise = global.Promise;

const newVisitaDate = (model, io) => {

  model.save((err)=> {
    if (err) {
      console.log(err);
    }
    else{
      io.emit('searchVisit', {})
    }
  })
}

const updateVisitaDate = (model, io, date) => {
  model.updateOne({fecha: date}, {$inc: {visitas: 1} }, (err) => {
    if (err) {
      console.log(err);
    }
    else{
      io.emit('searchVisit', {})
    }
  })
}

mongoose.connect(Config.db, { useNewUrlParser: true , useUnifiedTopology: true})
        .then(() => {
          
          io.on("connection", (socket) => {
            console.log('connect');
            socket.on("requestMessage", (data) => {
              const Model = mongoose.model(`ChatCollection${data}`, Chat);

              Model.find({}, (err, data) => {
                if (err) {
                  console.log(err);
                }
                else{
                  socket.emit("recivedMensajes", data)
                }
              })
            });

            socket.on("sendMensajes", (data) => {
              const Model = mongoose.model(`ChatCollection${data.id}`, Chat);
              const modeloChat = new Model();
              modeloChat.mensaje = data.info.message

              if (data.info.foto) {
                modeloChat.foto = data.info.foto
              }
              if (data.info.nombre) {
                modeloChat.Nombre = data.info.nombre
              }
              modeloChat.save((err) => {
                if (err) {
                  console.log(err);
                }
                Model.find({}, (err, data) => {
                  if (err) {
                    console.log(err);
                  }
                  else{
                    io.emit("searchMSG", data)
                  }
                })
              });

              
            })

            // Commentarios

            socket.on("requestComment", (data) => {
              const Model = mongoose.model(`CommentCollection${data}`, Comment);

              const config = [
                  {
                      $lookup: {
                          from: 'docentes',
                          localField: 'idDocente',
                          foreignField: '_id',
                          as: 'Docente'
                      }
                  },
                  {
                      $project: {
                          _id: "$_id",
                          imagen: "$foto",
                          comment: "$mensaje",
                          date: "$fecha",
                          Nombre: "$Docente.Nombre",
                          PerfilImage: "$Docente.PerfilImage"
                      }
                  }
              ];
      
              Model.aggregate(config).then((resp) => {
                socket.emit("recivedComment", resp)
              });

            });

            socket.on("sendComment", (data) => {
              const Model = mongoose.model(`CommentCollection${data.id}`, Comment);
              const modeloComment = new Model();
              modeloComment.mensaje = data.info.message
              modeloComment.idDocente = data.info.idDocente
              
              if (data.info.foto) {
                modeloComment.foto = data.info.foto
              }

              modeloComment.save((err) => {
                if (err) {
                  console.log(err);
                }
                else{
                  Foro.findByIdAndUpdate(mongoose.Types.ObjectId(data.id), { $inc: {comentarios: 1}}, (err, response) => {
                    if (err) {
                      console.log(err);
                    }
                    else{
                      console.log(response);
                      io.emit("searchCMT", data)
                    }
                  })
                }
              });

              
            })

            // Contador de Visitas
            socket.on('requestVisitas', (data) => {
              
              Visitas.find({},(err, data) => {

                if (err) {
                  console.log(err);
                }
                else{
                  socket.emit('receivedVisit', data)
                }
                
              });

            });

            socket.on('newVisit', (data) => {

              const date = new Date()
              const dateNow = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`

              Visitas.findOne({fecha: dateNow}, (err, data) => {
                if (err || !data) {
                  newVisitaDate(new Visitas(), io);
                }
                else{
                  updateVisitaDate(Visitas, io, dateNow)
                }
              })

            })

          });


          http.listen(Config.port, () => {
            console.log('Chat Corriendo en http://localhost:3380' );
          });

        });

