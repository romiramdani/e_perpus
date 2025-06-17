const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const path = require('path')
const app = express();
const routes = require('./routes/index.js')
const port = 3000;

const mysqlOptions = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'e_perpustakaan',
    port: '3306'
}

const sessionStore = new MySQLStore(mysqlOptions);

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')))

app.use(
    session({
      key: 'e_perpus_cookie',
      store: sessionStore,
      secret: 'secret-key',
      resave: false,
      saveUninitialized: true, 
      cookie: { maxAge: 1800000 } 
    })
);

app.use('/', routes)

app.listen(port, () => {
    console.log( `server running at http://localhost:${port} `);
    
})