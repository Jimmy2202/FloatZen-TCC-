const express = require('express');
const session = require('express-session')
const path = require('path')
const auth = require('C:/Users/Arthur/SpotifyTest/auth.js')
const gptroute = require('C:/Users/Arthur/SpotifyTest/main_page_gpt.js')
const app = express();
const PORT = 3001

app.use(express.static(path.join(__dirname,'public'))) //deixar acessivel os arquivos estaticos
app.use(express.urlencoded({extended:true})) //tratar forms
app.use(express.json()) //tratar jsons

//cria session
app.use(session({
    secret: '1968',
    resave: false,
    saveUninitialized: true,
    cookie: {secure:false}
}))

//quando tiver na rota princpal, execute isso
app.get('/', (req,res) =>{
    if(req.session.isLoggedIn){
        res.render('index', {nick: req.session.username, content:'<div class = "container"></div>'})
    }else{
        res.redirect('/login')
    }
})

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

//auth está guardando um import de rotas do arquivo auth.js
app.use('/', auth, gptroute)

// daqui pra baixo é lógica de importação da api do spotify q está funcionando

app.listen(PORT, () =>{
    console.log(' | Server running On Port: ' + PORT + " |")
})