import nodemailer from 'nodemailer'

//recibe los datos (objeto)  
export const emailRegistro = async (datos) => {

    const { email, nombre, token } = datos

    //colocamos la configuracion del cliente que envia mail con variables de entorno
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

    //informacion email
    //indicamos a que endpoint apuntara en href con la variable de entorno y token como se probo en postman
      const info = await transport.sendMail({
        from: '"Task Manager - Gestion de proyectos" <cuenta@taskmanager.com',
        to: email,
        subject: "Task Manager - Confirma tu cuenta",
        text: "Comprueba tu cuenta en Task Manager",
        html: `
            <p>Hola ${nombre}, comprueba tu cuenta en Task Manager</p>
            <p>Tu cuenta esta casi lista, debes comprobarla en el siguiente enlace:</p>
            <a href="${process.env.FRONTEND_URL}/confirmar-cuenta/${token}">Comprobar cuenta</a>
            <p>Si no fuiste tu, porfavor ignorar este mensaje.</p>
            <p>Saludos desde Task Manager!!!</p>
        `
      })
}

export const reestablecerPassword = async (datos) =>{

    const {nombre, email, token} = datos

     //colocamos la configuracion del cliente que envia mail con variables de entorno
     const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

    //informacion del email
    const info = await transport.sendMail({
        from: '"Task Manager - Gestion de proyectos" <cuenta@taskmanager.com',
        to: email,
        subject: "Task Manager - Recupera tu clave",
        text: "Recupera tu contraseña en Task Manager",
        html: `
            <p>Hola ${nombre}, recupera tu cuenta en Task Manager</p>
            <p>Ingresa en el siguiente link para que puedas reestablecer tu contraseña</p>
            <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer contraseña</a>
            <p>Si no fuiste tú, porfavor ignorar este mensaje.</p>
            <p>Saludos desde Task Manager!!!</p>
        `
      })
}