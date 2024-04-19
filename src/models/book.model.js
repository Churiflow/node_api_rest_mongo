const mongoose = require( 'mongoose' )


// CUANDO TENGAMOS UNA BASE DE DATOSE ESTE OBJETO ES LA FORMA
// EL ESQUEMA QUE VA TENER EL LIBRO
const bookSchema = new mongoose.Schema(
    {
        title: String,
        author: String,
        genre : String,
        publication_date: String,

    }
)

//EXPORTAR COMO UN MONGO MODEL
module.exports = mongoose.model( "Book", bookSchema ) //LE PASAMOS EL NOMBRE DEL MODELO Y EL ESQUEMA

