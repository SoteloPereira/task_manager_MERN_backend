//para comunicar rounting con modelos, usamos el controlador.

import Usuario from "../models/Usuarios.js";
import generarId from "../helpers/generarId.js";
import generarJWT from "../helpers/generarJWT.js";
import { emailRegistro, reestablecerPassword } from "../helpers/emails.js";

//Ejemplos
const usuarios = (req, res) => {
    res.send("Desde API/USUARIOS - GET");
}

// ********  Proyecto  *************
//fn para crearUsuario
const registrar = async (req, res) =>{
    
    //Evitar registros duplicados
    //Desestructuramos el objeto (accedemos con req.body) y obtenemos email
    const { email } = req.body
    //mongoose tiene muchos metodos, usaremos findOne para ver si existe el mail, le pasamos param
    const usuarioExiste = await Usuario.findOne( {email}) //deberia ser { email: email } como es igual, se deja solo { email }
    
    if(usuarioExiste){
        const error = new Error("Usuario ya existe!")
        return res.status(400).json({ msg: error.message})
    }

    try {
        //creamos una instancia del modelo Usuario con la data del json entregada en el POST
        const usuario = new Usuario(req.body)         //console.log(usuario);

        //creamos el token usando el helper
        usuario.token = generarId() 
        //guardamos en la BD el usuario
        //los comentamos ya que ahora enviamos la respuesta al front
        //const usuarioAlmacenado = await usuario.save()
        //res.json( usuarioAlmacenado )
        await usuario.save()

        //enviamos mail de confirmacion a usuario
        emailRegistro({
            nombre: usuario.nombre,
            email: usuario.email,
            token: usuario.token
        })

        //retornamos un objeto(json) con una propiedad msg la cual podemos acceder desde front (data)
        res.json({msg: "Usuario registrado correctamente, favor revisa tu email"})
    } catch (error) {
        console.log(error);
    }
}

const autenticar = async (req, res) =>{

    const { email, password } = req.body;
    //Comprobar si usuario existe
    const usuario = await Usuario.findOne({ email }); //nos trae la data desde la BD

    if(!usuario){
        const error = new Error("No existe el usuario")
        return res.status(404).json({ msg: error.message})
    }
    //Comprobar si esta confirmado
    if(!usuario.confirmado){
        const error = new Error("Usuario no confirmado")
        return res.status(403).json({ msg: error.message})
    }
    //Comprobar si la password coincide (de aqui lo pasamos al modelo para usar la fn de comprobacion )
    // await para esperar que la fn termine.
    const resp = await usuario.comprobarPassword(password)
    if(resp){
        console.log("La password coincide");
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email : usuario.email,
            token: generarJWT(usuario._id)
        })
    }else{
        const error = new Error("Password incorrecta")
        return res.status(400).json({ msg: error.message})
    }
}

//Enviar correo a usuario y que confirme la cuenta con routing dinamico
const confirmarCuenta = async (req, res) =>{
    //asi obtenemos el valor que viene desde la url
    console.log(req.params);
    //token porque asi se definió en Routes en la url
    const { token } = req.params
    //buscamos por token al usuario
    const usuarioConfirmado = await Usuario.findOne( { token });
    //si no encuentra nada...
    if(!usuarioConfirmado){
        const error = new Error("Token invalido")
        return res.status(403).json({ msg: error.message})
    }

    try {
        //estando todo bien, cambiamos el valor de confirmado
        usuarioConfirmado.confirmado = true
        //como el token es de un solo uso (confirmar la cuenta), una vez confirmado lo borramos
        usuarioConfirmado.token = ""
        //luego lo almacenamos en la BD
        await usuarioConfirmado.save()
        //resp para front
        res.json({ msg: "Usuario confirmado con éxito!" })
    } catch (error) {
        console.log(error);;
    }
}

const olvidePassword = async (req, res) =>{

    const {email} = req.body;
    const usuario = await Usuario.findOne({email}) //deberia ser { email: email } como es igual, se deja solo { email }
    
    if(!usuario){
        const error = new Error("Usuario NO existe!")
        return res.status(404).json({ msg: error.message})
    }

    try {
        //le damos un nuevo token para este proceso
        usuario.token = generarId()
        await usuario.save()

        //enviar email con instrucciones
        reestablecerPassword({
            nombre: usuario.nombre,
            email: usuario.email,
            token: usuario.token
        })

        res.json( {msg: "Hemos enviado un mail con las instrucciones"})
    } catch (error) {
        console.log(error);
    }

}

const comprobarToken = async (req, res) =>{

    const { token } = req.params;
    const tokenValido = await Usuario.findOne( { token })

    if(tokenValido){
        res.json({msg:"Token Válido"})
    }else{
        const error = new Error("Token Inválido")
        return res.status(400).json({ msg: error.message})
    }
}

const nuevoPassword = async (req, res) =>{
    const {token} = req.params
    const {password} = req.body
    const usuario = await Usuario.findOne( { token })
    
    if(usuario){
        //en modelo tiene la validacion de si se modifica o no la clave, si se hace toma la nueva y la hashea
        usuario.password = password //a la password extraida
        usuario.token = "" //de un solo uso
        try {
            await usuario.save() //guardamos en BD
            res.json({msg: "Password actualizado con exito"})
        } catch (error) {
            console.log(error);
        }
      
    }else{
        const error = new Error("Token inválido")
        return res.status(400).json({msg: error.message})
    }
}

const perfil = async (req, res) =>{
    console.log("Desde perfil de:");
    //lo extraemos desde la variable declarada en checkAuth al encontrar el registro por el token
    const { usuario } = req
    console.log(usuario.nombre);
    res.json(usuario) //debemos retornar el perfil para usarlo en el front
}


export {
    usuarios,
    registrar,
    autenticar,
    confirmarCuenta,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    perfil
}