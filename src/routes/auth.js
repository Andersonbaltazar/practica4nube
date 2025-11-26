const express = require('express');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { query } = require('../db/database');

const router = express.Router();

// Registrar usuario
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar si usuario existe
    const userExists = await query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'El usuario o email ya existe' });
    }

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    await query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
      [username, email, hashedPassword]
    );

    res.json({ success: true, message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error en el registro' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    // Si 2FA está habilitado, ir a verificación
    if (user.two_fa_enabled) {
      req.session.tempUserId = user.id;
      return res.json({ success: true, requires2FA: true });
    }

    // Si no hay 2FA, login directo
    req.session.userId = user.id;
    req.session.username = user.username;
    res.json({ success: true, requires2FA: false });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el login' });
  }
});

// Configurar 2FA
router.post('/setup-2fa', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const secret = speakeasy.generateSecret({
      name: `TaskApp (${req.session.username})`,
      issuer: 'TaskApp'
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      secret: secret.base32,
      qrCode: qrCode
    });
  } catch (error) {
    console.error('Error configurando 2FA:', error);
    res.status(500).json({ error: 'Error configurando 2FA' });
  }
});

// Confirmar 2FA
router.post('/confirm-2fa', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const { secret, token } = req.body;

    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({ error: 'Token inválido' });
    }

    // Guardar secret en BD
    await query('UPDATE users SET two_fa_secret = $1, two_fa_enabled = true WHERE id = $2', 
      [secret, req.session.userId]
    );

    res.json({ success: true, message: '2FA configurado exitosamente' });
  } catch (error) {
    console.error('Error confirmando 2FA:', error);
    res.status(500).json({ error: 'Error confirmando 2FA' });
  }
});

// Verificar token 2FA
router.post('/verify-2fa', async (req, res) => {
  try {
    if (!req.session.tempUserId) {
      return res.status(401).json({ error: 'No hay sesión temporal' });
    }

    const { token } = req.body;

    const result = await query('SELECT two_fa_secret FROM users WHERE id = $1', [req.session.tempUserId]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];
    const verified = speakeasy.totp.verify({
      secret: user.two_fa_secret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({ error: 'Token 2FA inválido' });
    }

    // Completar login
    const userResult = await query('SELECT id, username FROM users WHERE id = $1', [req.session.tempUserId]);
    const loginUser = userResult.rows[0];

    req.session.userId = loginUser.id;
    req.session.username = loginUser.username;
    delete req.session.tempUserId;

    res.json({ success: true, message: 'Login exitoso' });
  } catch (error) {
    console.error('Error verificando 2FA:', error);
    res.status(500).json({ error: 'Error verificando 2FA' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error al logout' });
    }
    res.json({ success: true, message: 'Logout exitoso' });
  });
});

module.exports = router;
