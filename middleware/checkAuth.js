import jwt  from "jsonwebtoken";
import Usuario from "../models/Usuarios.js";

const checkAuth = async (req, res, next) => {

    console.log("Desde middleware checkAuth");
    //para que se vea los valores, debemos configurar en Postman, pestaña authorization y luego Bearer TOKEN, y en token escribir el valor
    // console.log(req.headers.authorization);
    // console.log(req.headers);
    let token;
    //si existe authorization y si empieza con Bearer que es la convencion para 
    if( req.headers.authorization && req.headers.authorization.startsWith("Bearer")){

        try {
            //como nos muestra en la salida "Bearer + el token" debe hacer el split, 
            //asi le asignamos solo el valor a la variable token
            token = req.headers.authorization.split(' ')[1]; //asi le asignamos solo el token (Bearer queda en [0])
            //console.log(token);
            //como viene codificado, lo vamos a verificar, para eso usamos el metodo verify de jwt
            // y le pasamos como param el "token" y la llave secreta que esta definida en .env
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            //console.log(decoded);
            req.usuario = await Usuario.findById(decoded.id).select("-password -confirmado -token -__v -createdAt -updatedAt")
            return next() //lo manda el otro middleware (perfil)

        } catch (error) {
            console.log(error);
            return res.status(404).json( {msg: "Token no válido"})
        }
    }
    //si no manda token
    if(!token){
        const error = new Error("Error autenticacion token")
        return res.status(401).json( { msg: error.message })
    }
    next();
}

export default checkAuth