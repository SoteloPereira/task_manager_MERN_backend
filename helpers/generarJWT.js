import jwt from 'jsonwebtoken'

//recibe el id desde la instancia de usuario en el controller
const generarJWT = (id) =>{
    //sign es un metodo que nos permite generar un jwt, 1er param es el payload o cuerpo
    //2do es la llave privada que se declara en las variables de entorno .env
    //finalmente toma un objeto con opciones
    return jwt.sign( { id }, process.env.JWT_SECRET, 
        {
            expiresIn: '30d' //tiempo para que expire
        })
}

export default generarJWT