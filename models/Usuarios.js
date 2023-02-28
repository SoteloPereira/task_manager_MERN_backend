import mongoose from "mongoose";
import bcrypt from 'bcrypt'

const usuarioSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true //elimina espacios del inicio y final
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    token: {
        type: String
    },
    confirmado:{
        type: Boolean,
        default: false
    }

},
{
    timestamps: true //crea 2 columnas mas, una de fecha de creacion y de actualizado
})

//usamos el pre (de bcrypt) para que las tareas se hagan antes del guardado
usuarioSchema.pre('save', async function(next){
    //agregamos una validacion, con el metodo de mongoose
    //preguntamos, vas a cambiar el pass? no. entonces no hagas nada (next)
    if(!this.isModified('password')) //=> va a revisar que el password no haya sido cambiado (por la !)
    {
        next(); //=> usamos el next para saltar a otro middleware (asi no ejecuta lo de abajo, el return lo cortaria)
    }

    //el salt entre mas alto el numero, mas complicado el hash, pero consume mas recursos
    const salt = await bcrypt.genSalt(10) //10 es buen numero - con await porque necesitamos usar salt despues
    //usamos fn normal para usar el this y tener la referencia del objeto que pasamos (json)
    //el metodo hash requiere 2 parametros, el string a hashear y la configuracion (salt)
    this.password = await bcrypt.hash(this.password, salt)
})

//fn para verificar el password
usuarioSchema.methods.comprobarPassword = async function(passwordFormulario){  //usamos fn normal para usar el this y tener la referencia del objeto que pasamos (json)

  //el metodo compare de bcrypt, lo que hace es comparar un string no hasheado con el que si, y ver si coindicen
  //recibe 2 param, 1ro la pass del usuario, 2do la pass guardada hasheada
  return await bcrypt.compare(passwordFormulario, this.password) //this para hacer ref a la instancia de usuario
}


//definimos el modelo, le colocamos un nombre y le pasamos el schema que tendrá
const Usuario = mongoose.model("Usuario", usuarioSchema)

export default Usuario