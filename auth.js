const { render } = require('ejs')
const db = require('./db') // Use mysql2/promise na configuração do db
const express = require('express')
const router = express.Router()

const create_user = async (email, password) => {
    try {

        const query = 'INSERT INTO users (email, nickname,password) VALUES (?, ?, ?)'
        await db.query(query, [email, "user", password])

        const query2 = 'SELECT id FROM users WHERE email = ?'
        const [results2] = await db.query(query2, [email])

        if (results2.length !== 0) {
            const id = results2[0].id
            const query3 = `UPDATE users SET nickname = 'user_${id}' WHERE id = ?`
            await db.query(query3, [id])
        }
        return { success: true }
    } catch (error) {
        console.error('Error during user creation:', error)
        return { success: false, error: 'Usuário existente' }
    }
}

router.get('/logout', async (req, res) => {
    req.session.isLoggedIn = false
    res.redirect('/')
})

router.get('/createuser', async (req, res) => {
    const email = req.query.email
    res.render('cadastro', { email: email, msg: req.session.msg })
})

router.get('/paineluser', async (req, res) => {
    res.render('perfiluser', {nick: req.session.username })
})

router.post('/createuser', async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            req.session.msg = 'Por favor, preencha o email e a senha.'
            res.redirect(`/createuser?email=${encodeURIComponent(email)}`)
        } else {
            const result = await create_user(email, password)
            if (result.success) {
                req.session.isLoggedIn = true
                res.redirect('/')
            } else {
                req.session.msg = result.error
                res.redirect('/createuser')
            }
        }
    } catch (error) {
        console.error('Error during user creation:', error)
        return res.status(500).json({ success: false, error: 'An error occurred' })
    }
})

const login = async (email, password) => {
    try {
        const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email])
        if (results.length === 0) {
            return { success: false, message: 'User not found' }
        }

        const user_found = results[0]
        if (user_found.password === password) {
            return { success: true, user: user_found }
        } else {
            return { success: false, message: 'Wrong password' }
        }
    } catch (error) {
        console.error('Error during login:', error)
        return { success: false, error: 'An error occurred' }
    }
}

router.get('/login', async (req, res) => {
    res.render('login', { msg: req.session.msg })
    req.session.msg = ""
})

const func_data_user = async (name) => {
    try {
        const [results] = await db.query('SELECT * FROM users WHERE nickname = ?', [name])
        if (results.length === 0) {
            return { success: false, message: 'User not found' }
        } else {
            const user_found = results[0]
            return { success: true, user: user_found }
        }
    } catch (error) {
        console.error('Error during login:', error)
        return { success: false, error: 'An error occurred' }
    }
}

router.post('/api/fetchuser', async(req, res) => {
    const {nameuser} = req.body
    const result = await func_data_user(nameuser)
    res.json(result)
})

router.post('/login', async (req, res) => {
    req.session.msg1 = "OPA"
    const { email, password } = req.body
    req.session.isLoggedIn = false

    if (!email || !password) {
        req.session.msg = 'Por favor, preencha o email e a senha.'
        return res.redirect('/')
    }

    try {
        const result = await login(email, password)
        if (result.success) {
            func_data_user(result)
            req.session.isLoggedIn = true
            req.session.username = result.user.nickname
            res.redirect('/')
        } else {
            req.session.msg = result.message
            if (req.session.msg === 'User not found') {
                res.redirect(`/createuser?email=${encodeURIComponent(email)}`)
            } else {
                res.redirect('/login')
            }
        }
    } catch (error) {
        console.error('Error handling login:', error)
        res.status(500).json({ error: 'An error occurred' })
    }
})

module.exports = router