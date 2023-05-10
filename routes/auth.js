const express = require('express');
const validateBody = require('../helpers/validateSchemas');
const { registerSchema, loginSchema } = require('../models/users');
const authenticate = require('../middlewares/authenticate');

const ctrl = require('../controllers/auth');
const router = express.Router();

router.post('/register', validateBody(registerSchema), ctrl.register);

router.post('/login', validateBody(loginSchema), ctrl.login);

router.post('/logout', authenticate, ctrl.logout);

router.get('/current', authenticate, ctrl.current);

module.exports = router;
