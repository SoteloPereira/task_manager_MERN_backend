import mongoose from "mongoose";

const proyectoSchema = mongoose.Schema( {
    nombre:{
        type: String,
        trim: true,
        required: true
    },
    descripcion:{
        type: String,
        trim: true,
        required: true
    },
    fechaEntrega:{
        type: Date,
        default: Date.now()
    },
    cliente:{
        type: String,
        trim: true,
        required: true
    },
    creador:{
        type: mongoose.Schema.Types.ObjectId, //hace referencia al ID del usuario
        ref: 'Usuario' //se coloca el nombre puesto al definir el modelo
    },
    tareas:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tarea"
        }
    ],
    colaboradores: [ // indicamos que será una array de objetos (n colaboradores)
        {
            type : mongoose.Schema.Types.ObjectId,
            ref: 'Usuario'
        }
    ]

},{
    timestamps: true
    }
);

const Proyecto = mongoose.model("Proyecto", proyectoSchema)

export default Proyecto