import Tarea from '../models/Tareas.js'
import Proyecto from '../models/Proyectos.js';

const agregarTarea = async(req, res) =>{
    const { proyecto } = req.body;

    if(proyecto.match(/^[0-9a-fA-F]{24}$/)) {
        const proyectoExiste = await Proyecto.findById(proyecto)
        if(proyectoExiste){
            const tarea = await Tarea(req.body)
            if(proyectoExiste.creador.toString() !== req.usuario._id.toString()){
                const error = new Error("No tienes permisos para agregar tareas")
                return res.status(403).json({ msg: error.message})
            }
            try {
                const tareaAlmacenada = await tarea.save()
                //Almacenar ID de tarea en proyecto
                proyectoExiste.tareas.push(tareaAlmacenada)
                await proyectoExiste.save()
                res.json(tareaAlmacenada)
            } catch (error) {
                console.log(error);
            }
        }

    }else{
        const error = new Error("El proyecto no existe")
        res.status(404).json({ msg: error.message})
    }
}

const obtenerTarea = async(req, res) =>{
    const { id } = req.params;
    if(id.match(/^[0-9a-fA-F]{24}$/)) {
        const tarea = await Tarea.findById(id).populate("proyecto");
        //validamos que la tarea fue creada por el usuario logueado
        if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
            const error = new Error("No tienes permisos para ver esta tarea")
            return res.status(401).json({ msg: error.message})
        }
        res.json(tarea)
    }else{
        const error = new Error("La tarea no existe")
        res.status(404).json({ msg: error.message})
    }
    
}
const editarTarea = async(req, res) =>{
    const { id } = req.params;
    if(id.match(/^[0-9a-fA-F]{24}$/)) {
        const tarea = await Tarea.findById(id).populate("proyecto");
        //validamos que la tarea fue creada por el usuario logueado
        if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
            const error = new Error("No tienes permisos para modificar esta tarea")
            return res.status(401).json({ msg: error.message})
        }
        //modificamos la data que nos haya pasado el usuario
        tarea.nombre = req.body.nombre
        tarea.descripcion = req.body.descripcion || tarea.descripcion
        tarea.prioridad = req.body.prioridad || tarea.prioridad
        tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega

        try {
            const tareaAlmacenada = await tarea.save()
            res.json(tareaAlmacenada)
        } catch (error) {
            console.log(error);
        }
    }else{
        const error = new Error("La tarea no existe")
        res.status(404).json({ msg: error.message})
    }
}

const eliminarTarea = async(req, res) =>{
    const { id } = req.params;
    if(id.match(/^[0-9a-fA-F]{24}$/)) {
        const tarea = await Tarea.findById(id).populate("proyecto");
        //validamos que la tarea fue creada por el usuario logueado
        if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
            const error = new Error("No tienes permisos para ver esta")
            return res.status(401).json({ msg: error.message})
        }
        try {
            //nos traemos el proyecto a partir del id del objeto tarea
            const proyecto = await Proyecto.findById(tarea.proyecto)
            proyecto.tareas.pull(tarea._id)
            //van a comenzar al mismo tiempo => igual a Promise.all()
            await Promise.allSettled( [ await proyecto.save(), await tarea.deleteOne()])
            res.json({msg:"Tarea Eliminada"})
        } catch (error) {
            console.log(error);
        }   
    }else{
        const error = new Error("La tarea no existe")
        res.status(404).json({ msg: error.message})
    }
}
const cambiarEstado = async(req, res) =>{
    const { id } = req.params;
    if(id.match(/^[0-9a-fA-F]{24}$/)) {
        const tarea = await Tarea.findById(id).populate("proyecto");
        //validamos que la tarea fue creada por el usuario logueado
        if(tarea.proyecto.creador.toString() !== req.usuario._id.toString() && !tarea.proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())){
            const error = new Error("Acción inválida")
            return res.status(401).json({ msg: error.message})
        }
        if(!tarea){
            const error = new Error("No existe la tarea")
            return res.status(404).json({ msg: error.message})
        }
        //todo bien
        tarea.estado = !tarea.estado
        tarea.completado = req.usuario._id //para ver quien hizo la accion (usuario logueado)
        await tarea.save()
        //para poder actualizar el estado del usuario, ya que si se hace arriba el populate a completado
        //no se alcanza a reflejar, por eso debemos hacerlo despues que se guarda
        const tareaAlmacenada = await Tarea.findById(id).populate("proyecto").populate("completado");

        res.json(tareaAlmacenada)
    }
}

export {agregarTarea, obtenerTarea, editarTarea, eliminarTarea, cambiarEstado}