import mongoose from 'mongoose'

const conexionBD = async () =>{
    try {
        
        const connection = await mongoose.connect(process.env.MONGO_URI,{
            //opciones de configuracion 
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        const url = `${connection.connection.host} : ${connection.connection.port}`;
        console.log(`MongoDB conectado en: ${url}`);

    } catch (error) {
        console.log(`error: ${error.message}`);
        //para forzar que proceso termine, aunque haya mas instrucciones
        process.exit(1)
    }
}

export default conexionBD