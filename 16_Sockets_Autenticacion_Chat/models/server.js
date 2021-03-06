require('dotenv').config()

const express = require('express')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const timeout = require('connect-timeout')

const ConfigDB = require('../database/config.db')
const { socketController } = require('../sockets/sockets.controller')

const db = new ConfigDB()


class Server {
    constructor() {
        this.app = express()
        this.PORT = process.env.PORT
        this.server = require('http').createServer(this.app)
        this.io = require('socket.io')(this.server)
        this.paths = {
            auth: '/api/auth',
            users: '/api/users',
            categories: '/api/categories',
            products: '/api/products',
            search: '/api/search',
            uploads: '/api/uploads'
        }
        this.connectDB()
        this.middlewares()
        this.routes()
    }

    async connectDB() {
        await db.dbConnection()
    }

    middlewares() {
        this.app.use(cors())
        this.app.use(timeout('360s'))
        this.app.use(express.json())
        this.app.use(express.static('public'))
        this.app.use(fileUpload({
            useTempFiles: true,
            tempFileDir: '/tmp/',
            createParentPath: true
        }))
        this.sockets()
    }

    routes() {
        this.app.use(this.paths.auth, require('../routes/auth.routes'))
        this.app.use(this.paths.users, require('../routes/user.routes'))
        this.app.use(this.paths.categories, require('../routes/categories.routes'))
        this.app.use(this.paths.products, require('../routes/products.routes'))
        this.app.use(this.paths.search, require('../routes/search.routes'))
        this.app.use(this.paths.uploads, require('../routes/uploads.routes'))
    }

    sockets() {
        this.io.on('connection', (socket) => socketController(socket, this.io))
    }

    listen() {
        this.server.listen(this.PORT, () => {
            console.log(`Aplicación corriendo en http://localhost:${this.PORT}`);
        })
    }
}


module.exports = Server