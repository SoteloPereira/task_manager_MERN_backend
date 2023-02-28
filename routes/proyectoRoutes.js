import express from 'express'
import { obtenerProyecto, obtenerProyectos, nuevoProyecto, editarProyecto,
    eliminarProyecto, agregarColaborador, eliminarColaborador, buscarColaborador } from '../controllers/proyectoController.js'
import checkAuth from '../middleware/checkAuth.js'

const router = express.Router()

//para las fn obtener, editar y eliminar, necesitaremos un id (routing dinamico)
router.route('/:id').get(checkAuth, obtenerProyecto).put(checkAuth, editarProyecto).delete(checkAuth, eliminarProyecto)

//colocamos primero el checkAuth, asi validará que el usuario esta logueado y hará el next(), si no error
// router.get('/', checkAuth, obtenerProyectos)
// router.post('/', checkAuth, nuevoProyecto)
//como son iguales, cambia el verbo y la fn usamos el route
router.route('/').get(checkAuth, obtenerProyectos).post(checkAuth, nuevoProyecto)

//lo relacionado a colaborador y sus tareas
//router.get('/tareas/:id', checkAuth, obtenerTareas) //:id es del proyecto
router.post('/colaboradores/:id', checkAuth, agregarColaborador)
router.post('/eliminar-colaborador/:id', checkAuth, eliminarColaborador) //Cuando vamos a eliminar no le puedes enviar valores, por lo que es mejor cambiarlo a post y 
//cambiar la ruta /eliminar-colaboradores/:id
router.post('/colaboradores',checkAuth,buscarColaborador)

export default router