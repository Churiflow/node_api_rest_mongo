const express = require('express')
const router = express.Router()
const Book = require('../models/book.model')

//MIDLEWARE PARA PODER TOMAR UN SOLO LIBRO Y DESPUES ESA FUNCION LA UTILIZAMOS EN LAS OTRAS LLAMADAS
// EL ASYNC RECIBE REQUES, RESPONSE, Y  NEXT

const getBook = async(req,res,next) => {
    // LET BOOK LO QUE VAMOS A MODIFICAR
    let book;
    // Y SACAMOS EL ID DE LOS PARAMETROS QUE RECIBIMOS DEL REQUEST
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)){
        return res.status(404).json(
            {
                message: 'El ID del libre no es valido'
            }
        )
    } 

    try {
        book = await Book.findById(id)
        if(!book){
            return res.status(404).json(
                {
                    message:'No se ha encontrado el libro con ese ID'
                
                }
            )
        }
    } catch(error){
        return res.status(500).json(
            {
                message: error.message
            }
        )
    }
    // AQUI RES CONFIGURA EN LA RESPUESTA EL BOOK 
    res.book = book;
    // NEXT ES PARA QUE SIGA DESPUES DEL MIDLEWARE,
    // OSEA DESPUES QUE YA SE CONFIGURÓ LA RESPUESTA EN EL BOOK
    next()

}

// Get all books = Obtener todos los libros [GET ALL]
// SOLAMENTE BARRA / PORQUE EL BOOK YA VA ESTAR EN LA URL DE LA APLICACION EN GENERAL
// NO SE NECESITA QUE  LO INGRESEN EN LA RUTA
router.get('/', async (req, res) => {
    try {
        //CONST BOOKS PORQUE VAMOS A TRATAR DE TRAERNOS TODOS LOS BOOKS
        // AWAIT DE BOOKS Y FIND ASI COMO ESTA PARA QUE BUSQUE TODOS LOS BOOKS
        const books = await Book.find()
        //SI NO HAY LIBROS MANDAMOS UN ERROR 204 VACIO 
        if (books.length === 0) {
            return res.status(204).json([])
        }
        // RES DE BOOKS ES PARA VER LA RESPUESTA QUE ESTAMOS BUSCANDO VAN A SER LOS BOOKS
        //IMPORTANTE PONER JSON PARA QUE SE PUEDA GUARDAR EN LA BASE DE DATOS
        res.json(books)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//CREAR UN NUEVO LIBRO (RECURSO) [POST]
// EL POST ES PARA AGREGAR UN RECURSO Y NECESITA UN BODY
router.post('/', async (req, res) => {
    // BODY DEL REQUEST O REQ
    // DESESTRUCTURAR Y TRAER LO MISMO QUE DICE MONGOOSE
    // AL FINAL LO TRAE DE REQ.BODY
    const { title, author, genre, publication_date }  = req?.body
    // SI NINGUNO ODE ESTO NO BIENE
    if (!title || !author || !genre || !publication_date) {
        return res.status(400).json({ 
            message: 'Los campos titulo, autor, genero y fecha son obligatorios' 
        }) 
    }

    const book = new Book(
        {

            title,
            author,
            genre,
            publication_date

        }
    )
 
    try {
        const newBook = await book.save()
        console.log(newBook)
        res.status(201).json(newBook)
    } catch (error){
        res.status(400).json({
            message: error.message
        })

    }

})

//GET INDIVIDUAL
//LO ESTAMOS PASANDO COMO UN MIDLEWAREs
//EL EL PRIMER GET DEBE ESTAR MACHEADO  CON EL ID PARA PODER ENCONTRAR EL ID EN EL POSTMAN

router.get('/:id', getBook, async(req, res) => {
    res.json(res.book);
})

//PUT  - ACTULIZACION DE DATOS (MODIFICAR)
router.put ('/:id', getBook, async(req, res) => {
    try {
        //EL RES.BOOK BIENE DEL MIDLEWARE EL BOOK LO PUSO EN EL RES.BOOK
        const book = res.book
        //NO ES NECESASRIO HACER DENUEVO UN IF SI ARRIBA EN EL MIDELEWARE YA TIENE IF "SI" NO EXISTE
        //DIRECTAMENTE LO NODIFICAMOS 
        book.title = req.body.title || book.title;
        book.author = req.body.author || book.author; 
        book.genre = req.body.genre || book.genre;
        book.publication_date = req.body.publication_date || book.publication_date;
        
        //HACEMOS EL BOOK.SAVE PARA QUE LO GUARDE
        const updatedBook = await book.save()
        // Y DEVOLVEMOS EL UPDATE DEL BOOK ATRAVES DEL JSON PARA QUE LO MUESTRE
        res.json(updatedBook)
    } catch (error){
        res.status(400).json({
            message: error.message
        })
    }
})


//PATCH
router.patch ('/:id', getBook, async(req, res) => {
    //SI NO ESTA EN EL BODY NINGUNO DE ESTOS 4 
    if(!req.body.title && !req.body.author && !req.body.genre && !req.body.publication_date){
        //DEVOLVEMOS EL SIGUIENTE MENSAJE 
        return res.status(400).json({
            message: 'Al menos  uno de estos campos debe ser enviado: Titulo, Autor, genero o fecha de publicacion'
        })
    }
    
    try {
        //EL RES.BOOK BIENE DEL MIDLEWARE EL BOOK LO PUSO EN EL RES.BOOK
        const book = res.book
        //NO ES NECESASRIO HACER DENUEVO UN IF SI ARRIBA EN EL MIDELEWARE YA TIENE IF "SI" NO EXISTE
        //DIRECTAMENTE LO NODIFICAMOS 
        book.title = req.body.title || book.title;
        book.author = req.body.author || book.author; 
        book.genre = req.body.genre || book.genre;
        book.publication_date = req.body.publication_date || book.publication_date;
        
        //HACEMOS EL BOOK.SAVE PARA QUE LO GUARDE
        const updatedBook = await book.save()
        // Y DEVOLVEMOS EL UPDATE DEL BOOK ATRAVES DEL JSON PARA QUE LO MUESTRE
        res.json(updatedBook)
    } catch (error){
        res.status(400).json({
            message: error.message
        })
    }
})

// DELETE
router.delete('/:id', getBook, async (req, res) => {
    try {
        // EL LIBRO A ELIMINAR SE ENCUENTRA EN res.book GRACIAS AL MIDDLEWARE getBook
        const book = res.book;
        
        // ELIMINAMOS EL LIBRO
        // NO ME FUNCIONO CON EL METOIDO REMOVE  ASI QUE USE DELETEONE
        // POR ESO ME DABA EL ERROR 400 IS NOT A FUNCTION PERO ES SOLO POR ESO
        // EL RESTO DEL CODIGO ESTABA TODO BIEN SOLO EL METODO DEL DELETE.REMOVE NO FUNCIONABA
        await book.deleteOne({
            _id: book._id
        });
        
        // ENVIAMOS UNA RESPUESTA DE ÉXITO
        res.json({ message: 'Libro eliminado correctamente' });
    } catch (error) {
        // console.log(error); ESTE CONSOLE LOG ES PARA VER EXACTAMENTE QUE ERROR ES
        // SI HAY ALGÚN ERROR, ENVIAMOS UN MENSAJE DE ERROR
        res.status(400).json({ message: error.message });
    }
});


//EXPORTAR LAS RUTAS PARA QUE SE PUEDA CREAR NUESTRA BASE DE DATOS EN 
// EL MONGO DB SINO NO SE VA CREAR
module.exports = router

