import express from 'express'
import { usuarios, registrar, autenticar, confirmarCuenta, olvidePassword, comprobarToken, nuevoPassword, perfil } from '../controllers/usuarioController.js'
import checkAuth from '../middleware/checkAuth.js'

//como express tiene un router, aqui es donde podremos usar get, post, put, delete
const router = express.Router()

//asi para explicar, luego al ver el controlador, definimos en usuarioController la fn
//y aqui se llamada ese controller
// router.get('/', (req, res) =>{
//     res.send("Desde API/USUARIOS");
// })
    //quedando asi y la funcionalidad en el controller (usuarioController)
//router.get('/', usuarios)

router.post('/', registrar)  //crea un nuevo usuario
router.post('/login', autenticar) //le suma a la ruta
//generamos routing dinamico con :token
router.get('/confirmarCuenta/:token', confirmarCuenta) //luego de enviar token que usuario confirme cuenta
router.post('/olvide-clave', olvidePassword) //para resetear la pass si la olvido
//router.get('/olvide-clave/:token', comprobarToken) //comprobar el token que enviamos para validar usuario
//router.post('/olvide-clave/:token', nuevoPassword) //para resetear la clave
//como comprobarToken y nuevoPassword tienen misma ruta, express soporta un metodo para combinarlas
router.route('/olvide-clave/:token').get(comprobarToken).post(nuevoPassword)

router.get('/perfil', checkAuth, perfil)

//podemos extender la ruta (que hara algo) a partir de /api/usuarios
// router.get('/confirmar', (req, res) =>{
//     res.send("CONFIRMAR USUARIOS");
// })
// router.post('/', (req, res) =>{
//     res.send('Desde - POST - /API/USUARIOS')
// })
// router.put('/', (req, res) =>{
//     res.send('Desde - PUT - /API/USUARIOS')
// })
// router.delete('/', (req, res) =>{
//     res.send('Desde - Delete - /API/USUARIOS')
// })

export default router