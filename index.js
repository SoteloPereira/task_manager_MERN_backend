//con commonJS ya que no teniamos configurado el module en package
//const express = require('express') //va a node_modules, busca el paquete de express y lo asigna en la variable

import express from 'express' //asi se importa express luego de configurar module en package
import conectionDB from './config/db.js'
import dotenv from 'dotenv'
import usuarioRouter from './routes/usuarioRoutes.js'
import proyectoRouter from './routes/proyectoRoutes.js'
import tareaRouter from './routes/tareaRoutes.js'
//para permitir las conexiones desde el dominio del frontend
import cors from 'cors'
 
//app tendra toda la funcionalidad de express
const app = express() 
//para poder procesar las peticiones JSON
app.use(express.json())

dotenv.config() //va a consultar por la configuracion

//ejecutamos la fn para conectarse
conectionDB()
console.log("¡¡¡¡¡¡Desde index.js!!!!!!");

//Routing  - app tiene todo de express
// 1- verbo .use, responde a todos los verbos
// 2- el endpoint 
// 3- callback que aqui usa metodo send para enviar algo a pantallas
// app.get('/', (req, res) => {
//     res.send("Hola gente")
//     //res.json( {msg: "OK"}) -> nos devolveria un json
// })

//configurar CORS
const whiteList = [process.env.FRONTEND_URL, 'https://www.google.com/'] //URL del front que quiere hacer req
const corsOptions = {
    origin: function(origin, callback){
        //console.log(origin);
        if(whiteList.includes(origin)){
            //si el origen esta en la lista blanca, permito el acceso a API
            callback(null, true)
            console.log("Entro al CORS");   
        }else{
            //no le doy acceso e indico error
            callback(new Error("Error de cors(acceso)"))
        }
    }
}

app.use(cors(corsOptions))
//para evitar tener muchos req y res, se recomienda agrupar en rutas y controladores
//verbo .use, responde a todos los verbos
app.use('/api/usuarios', usuarioRouter)
app.use('/api/proyectos', proyectoRouter)
app.use('/api/tareas', tareaRouter)

//variable entorno, se crea automaticamente, todos los soportan
const PORT = process.env.PORT || 4000
//se le indica un puerto y un callback que enviara un mensaje
//se asigna a una variable servidor para usar en instancia de Server de Socket.io
const servidor = app.listen(4000, () =>{
    console.log(`Servidor corriendo en puerto ${PORT}`);
})

//Socket.io
import { Server } from "socket.io"
//nueva instancia de Server en io
const io = new Server(servidor, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL
    }
})

io.on("connection", (socket) => {
    console.log("*****************Conectado a socket.io*******************");
    //emit envia un evento, y on indica que haremos cuando ese evento ocurra
    //mismo string que en emit y recibe los parametros que se le pasen
    
    //Definir los eventos de socket.io
    socket.on('abrir proyecto', (proyecto)=>{
        console.log("Desde proyecto ", proyecto);
        //entro al room de ese proyecto (por el id que recibe)
        socket.join(proyecto)
        //para limitar a quien va la respuesta con .to
        //socket.to("63e42023c575e13ae1fed73e").emit("respuesta", {nombre: "Freya"})
    });

    //Eventos del proyecto
    socket.on('nueva tarea', (tarea) =>{
        // const {proyecto} = tarea //desestructuramos 
        // socket.on(proyecto).emit("tarea agregada", tarea)
        console.log(tarea);
        const {proyecto} = tarea
        console.log(proyecto);
        // .to para indicar que en ese room /id proyecto responderá con la tarea 
        socket.to(proyecto).emit("tarea agregada", tarea)
    });

    socket.on('eliminar tarea', (tarea) =>{
        console.log(tarea);
        const {proyecto} = tarea
        socket.to(proyecto).emit("tarea eliminada", tarea)
    });
    socket.on('editar tarea', (tarea) =>{
        console.log(tarea);
        const {proyecto} = tarea
        console.log(proyecto);
        socket.to(proyecto._id).emit("tarea editada", tarea)
    });
    socket.on("cambiar estado", tarea =>{
        console.log(tarea);
        const {proyecto} = tarea
        console.log(proyecto._id);
        socket.to(proyecto._id).emit("estado cambiado", tarea)
    })
});