//express
const express = require('express');
const app = express();

//mongoose
const mongoose = require('mongoose');

// se envia y recibe informacion tipo json
app.use(express.json());

const uri = "mongodb+srv://ssavio:sabri2020@cluster0.tujpy.mongodb.net/libreria?retryWrites=true&w=majority";


async function conectar() {
    try{
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Conectado a la base de datos metodo: mongoodb - async-await");
    }
    catch(e){
        console.log(e);
    }
};
conectar();

const GeneroSchema = new mongoose.Schema({
    nombre : String,
    deleted: Number
});

const GeneroModel = mongoose.model("generos", GeneroSchema);

const LibroSchema = new mongoose.Schema({
    titulo: String,
    descripcion: String,
    genero: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'generos'
    },
    lended: String,
    deleted: Number
});
const LibroModel = mongoose.model("libros", LibroSchema);


//API /GENERO-------------------------------

app.get('/genero', async (req, res)=>{
    try{
        let respuesta = null;
        respuesta = await GeneroModel.find({deleted: 0});
        res.status(200).send(respuesta);
    }
    catch(e){
        console.log(e);
        res.status(422).send({error: e});
    }
});

app.get('/genero/:id', async (req, res)=>{
    try{
        let id = req.params.id;

        let respuesta = null;

        respuesta = await GeneroModel.findById(id);

        res.status(200).send(respuesta);
    }
    catch(e){
        console.log(e);

        res.status(422).send({error: e});
    }
});

app.post('/genero', async (req, res)=>{
    try{
        let nombre = req.body.nombre;
        // Validacion de datos
        if(nombre == undefined){
            throw new Error('Tenes que enviar un nombre');
        }

        if(nombre == ''){
            throw new Error('El nombre no puede ser vacio');
        }

        let existeNombre = null;

        existeNombre =  await GeneroModel.find({nombre: nombre.toUpperCase()});

        if(existeNombre.length > 0){
            throw new Error('Ese genero ya existe');
        }

        let genero = {
            nombre:  nombre.toUpperCase(),
            deleted: 0
        }

        await GeneroModel.create(genero);
        
        res.status(200).send(genero);
    }
    catch(e){
        console.log(e);

        res.status(422).send({error: e});
    }
});

app.delete('/genero/:id', async (req, res)=>{
    try{
        let id = req.params.id;

        let respuesta = null;

        //Se busca un genero por id para verificar que exista
        let generoGuardado = await GeneroModel.findById(id);

        generoGuardado.deleteOne();
        
        await GeneroModel.findByIdAndUpdate(id, generoGuardado);

        res.status(200).send({"message": "OK"});
    }
    catch(e){
        console.log(e);

        res.status(422).send({error: e});
    }
});

app.put('/genero/:id', async (req, res)=>{
    try{
        // Validacion de datos
        let nombre = req.body.nombre;

        let id = req.params.id;

        if(nombre == undefined){
            throw new Error('Tenes que enviar un nombre');
        }
        if(nombre == ''){
            throw new Error('El nombre no puede ser vacio');
        }
        // Verificamos condiciones para poder modificar
        let generoExiste = await GeneroModel.find({"nombre": nombre});
        if(generoExiste.length > 0){
            generoExiste.forEach(unGenero => {
                if(unGenero.id != id){
                    throw new Error("Ya existe ese genero");
                }
            });
        }
        let librosConEseGenero = null;

        librosConEseGenero = await LibroModel.find({"genero": id});

        if(librosConEseGenero.length > 0){
            throw new Error("No se puede modificar, hay libros asociados");
        }
        let generoModificado = {
            nombre: nombre
        }
        await GeneroModel.findByIdAndUpdate(id, generoModificado);

        res.status(200).send(generoModificado);
    }
    catch(e){
        console.log(e);

        res.status(422).send({error: e});
    }
});


//API LIBRO------------------------------------

app.get('/libro', async (req, res)=>{
    try{
        let respuesta = null;
        respuesta = await LibroModel.find();
        res.status(200).send(respuesta);
    }
    catch(e){
        console.log(e);
        res.status(422).send({error: e});
    }
});

app.get('/libro/:id', async (req, res)=>{
    try{
        let id = req.params.id;

        let respuesta = null;

        respuesta = await LibroModel.findById(id);

        res.status(200).send(respuesta);
    }
    catch(e){
        console.log(e);

        res.status(422).send({error: e});
    }
});

app.post('/libro', async (req, res)=>{
    try{
        let titulo = req.body.titulo;
        let descripcion = req.body.descripcion;
        let genero =  req.body.genero;
        // el prestado va vacio
        let lended = '';

        // Validacion de datos
        if(titulo == undefined){
            throw new Error("No enviaste el nombre");
        }
        if(titulo == ''){
            throw new Error("El nombre no puede ser vacio");
        }
        if(descripcion == undefined){
            throw new Error("descripcion incorrecta");
        }
        if(descripcion == ''){
            throw new Error("descripcion vacia");
        }
        if(genero == isNaN(undefined)){
            throw new Error("No enviaste el genero");
        }
        if(genero == ''){
            throw new Error("El genero no puede ser vacio");
        }
        if(lended == undefined){
            throw new Error("No enviaste el nombre");
        }
        if(lended == ''){
            throw new Error("lended no puede estar vacio");
        }

        let libro = {
            titulo: titulo,
            descripcion: descripcion,
            genero: genero,
            lended: lended,
            deleted: 0
        }
        //se guarda el libro
        await LibroModel.create(libro);
      
        res.status(200).send(libro);
    }
    catch(e){
        console.log(e);

        res.status(422).send({error: e});
    }
});

app.delete('/libro/:id', async (req, res)=>{
    try{
        let id = req.params.id;

        let respuesta = null;

        let generoGuardado = await LibroModel.findById(id);

        generoGuardado.deleteOne();

        await LibroModel.findByIdAndUpdate(id, generoGuardado);

        res.status(200).send({"message": "OK"});
    }
    catch(e){
        console.log(e);

        res.status(422).send({error: e});
    }
});

app.put('/libro/:id', async (req, res)=>{
    try{
        var id = req.params.id;

        res.status(200).send("El id es "+id);
    }
    catch(e){
        console.log(e);

        res.status(422).send({error: e});
    }
});

app.listen(3000, ()=>{
    console.log("Servidor escuchando en el puerto 3000");
});
