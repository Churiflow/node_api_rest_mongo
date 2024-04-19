const express = require('express')
//AQUI ME TRAIGO EL MONGOOSE TAMBIEN 
const mongoose = require( 'mongoose' )
const bodyParser = require('body-parser')
const { config } = require('dotenv')
config()

//TAMBIEN NECESITO IMPORTAR LAS RUTAS BOOKROUTES PORQUE PUEDEN SER VARIAS
const bookRoutes = require('./routes/book.routes')
//USAMOS EXPRESS PARA LOSO MIDLEWARES
const app = express();
// PARSEAR EN LA TERMINAL NPM I BODY-PARSER
//PARSEADOR DE BODIES
app.use(bodyParser.json())

//ACA CONECTAREMOS LAS BASE DE DATOS
mongoose.connect(process.env.MONGO_URL, {dbName: process.env.MONGO_DB_NAME})
const db = mongoose.connection;

//USAR OTRO MIDLEWARE MAS PAEA USAR LAS RUTAS
//SI ES BARRA BOOKS VA BUSCAR LA RUTA DE LOS LIBROS
//SI ES OTRA RUTA VA BUSCAR LA RUTA QUE CORRESPONDE
app.use('/books', bookRoutes)

const port = process.env.PORT || 3000

app.listen(port, () => { 
    console.log(`Server running on PORT ${port}`)
})