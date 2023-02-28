import Proyecto from '../models/Proyectos.js'
import Usuario from '../models/Usuarios.js'

const obtenerProyectos = async (req, res) => {
    //metodo find trae todo (se puede filtrar), para ello el where y el valor a comparar
    const proyectos = await Proyecto.find({
        '$or': [
            {"colaboradores" : {$in : req.usuario}},
            {"creador" : {$in: req.usuario}}
        ]
    })
    //.where("creador").equals(req.usuario) lo comentamos porque ya hacemos el where con la nueva validacion
    .select("-tareas")
    res.json(proyectos)
}

const nuevoProyecto = async (req, res) =>{
    console.log("Nuevo proyecto");
    //aqui creamos una instancia de Proyecto, donde le pasamos a proyecto las propiedades del body (nombre, desc,cliente) y completa el schema
    const proyecto = new Proyecto(req.body)
    //le agregamos la propiedad creador con el valor del id del usuario logueado
    proyecto.creador = req.usuario._id
    
    try {
        //guardamos en BD
        const proyectoAlmacenado = await proyecto.save()
        //lo retornamos para darle respuesta a usuario y manejar el state de React
        res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error);
    }
}

const editarProyecto = async (req, res) =>{
    const {id} = req.params; 
   
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        const error = new Error("Proyecto no encontrado")
        return res.status(404).json({ msg: error.message })  
    }
    const proyecto = await Proyecto.findById(id); 
    
    if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("Accion no permitida")
        return res.status(401).json({ msg: error.message }) 
    }
    //aqui ya paso todas las validaciones de login y permisos
    proyecto.nombre = req.body.nombre || proyecto.nombre; //lo cambia o deja el mismo
    proyecto.cliente = req.body.cliente || proyecto.cliente;
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;

    try {
        //luego de las modificaciones, guardamos en BD
        const proyectoAlmacenado = await proyecto.save();
        res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error);
    }
}

const obtenerProyecto = async (req, res) =>{

    const {id} = req.params;  console.log(id);
   //validamos que sea del formato indicado en el modelo y asi no tener el error (en notepad BSON)
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        const error = new Error("Proyecto no encontrado")
        return res.status(404).json({ msg: error.message }) 
    }
    const proyecto = await Proyecto.findById(id)
    .populate({path: "tareas", populate: { path: "completado", select: "nombre" }})
    .populate("colaboradores", "nombre email")
    
    //asi podemos comparar el id creador en el proyecto y el id del usuario logeado
    if(proyecto.creador.toString() !== req.usuario._id.toString() && !proyecto.colaboradores.some(colaborador => colaborador._id.toString() ===req.usuario._id.toString())){
        const error = new Error("Accion no permitida")
        return res.status(401).json({ msg: error.message }) 
    }
    //obtener las tareas asociadas al proyecto 
    //teniamos una fn para obtener las tareas, donde se usaba la consulta con where y equals
    //como queremos que cuando se seleccione un proyecto muestre altiro las tareas asociadas
    //colocamos la consulta a la BD que haciamos en la fn obtenerTarea aqui
        //const tareas = await Tarea.find().where("proyecto").equals(id)  //para filtrar las tareas por proyecto
    //luego para poder mostrar el proyecto y las tareas, exportamos 
    res.json({
        proyecto,
    //    tareas
    })
}

const eliminarProyecto = async (req, res) =>{

    const {id} = req.params; 
   
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        const error = new Error("Proyecto no encontrado")
        return res.status(404).json({ msg: error.message })  
    }
    const proyecto = await Proyecto.findById(id); 
    
    if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("Accion no permitida")
        return res.status(401).json({ msg: error.message }) 
    }

    try {
        await proyecto.deleteOne(); //toma el id que le pasamos como param en la URL
        res.json({msg: "Proyecto Eliminado"})
    } catch (error) {
        console.log(error);
    }
}

const buscarColaborador = async (req, res) =>{
    const {email} = req.body
    const usuario = await Usuario.findOne({email}).select("-password -createdAt -confirmado -token -updatedAt")

    if(!usuario){
        const error = new Error("Usuario no encontrado")
        return res.status(404).json({msg: error.message})
    }
    res.json(usuario)
}

const agregarColaborador = async (req, res) =>{
   
    const proyecto = await Proyecto.findById(req.params.id)
    if(!proyecto){
        const error = new Error("Proyecto no encontrado")
        return res.status(404).json({msg: error.message})
    }

    if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("Acción Inválida")
        return res.status(404).json({msg: error.message})
    }

    const {email} = req.body
    const usuario = await Usuario.findOne({email}).select("-password -createdAt -confirmado -token -updatedAt")
    if(!usuario){
        const error = new Error("Usuario no encontrado")
        return res.status(404).json({msg: error.message})
    }
    //Colaborador no puede ser el admin del proyecto
    if(proyecto.creador.toString() === usuario._id.toString()){
        const error = new Error("El creador del proyecto no puede ser colaborador")
        return res.status(404).json({msg: error.message})
    }
    //revisar que no este ya agregado al proyecto
    if(proyecto.colaboradores.includes(usuario._id)){
        const error = new Error("El colaborador ya esta agregado al proyecto")
        return res.status(404).json({msg: error.message})
    }
    //todo bien, se agrega
    proyecto.colaboradores.push(usuario._id)
    await proyecto.save()
    res.json({msg: "Colaborador agregado al proyecto"})
}

const eliminarColaborador = async (req, res) =>{
    const proyecto = await Proyecto.findById(req.params.id)
    if(!proyecto){
        const error = new Error("Proyecto no encontrado")
        return res.status(404).json({msg: error.message})
    }

    if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("Acción Inválida")
        return res.status(404).json({msg: error.message})
    }

    //todo bien, se elimina
    proyecto.colaboradores.pull(req.body.id)
    await proyecto.save()
    res.json({msg: "Colaborador eliminado del proyecto"})
}

// const obtenerTareas = async (req, res) =>{
//     console.log("Obteniendo tareas");
//     const { id } = req.params;   console.log(id);

//     if(!id.match(/^[0-9a-fA-F]{24}$/)) {
//         const error = new Error("Proyecto no encontrado")
//         return res.status(404).json({ msg: error.message })  
//     }
//     const proyecto = await Proyecto.findById(id); 
    
//     if(proyecto.creador.toString() !== req.usuario._id.toString()){
//         const error = new Error("Accion no permitida")
//         return res.status(401).json({ msg: error.message }) 
//     }
//     //para filtrar las tareas por proyecto
//     const tareas = await Tarea.find().where("proyecto").equals(id)
//     res.json(tareas)
// }

// exporta los controladores para ser accedidos desde routes
export { 
    obtenerProyecto,
    obtenerProyectos,
    nuevoProyecto,
    editarProyecto,
    eliminarProyecto,
    agregarColaborador,
    eliminarColaborador,
    buscarColaborador
    //obtenerTareas
}