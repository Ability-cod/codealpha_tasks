const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { setSecret, enable, disable, getSecret } = require('../models/twoFactorModel');

const setup = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `Pulse Connect (${req.user.username})`
    });

    await setSecret(req.user.id, secret.base32);
    const qrDataUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.json({ qrCode: qrDataUrl, manualKey: secret.base32 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const confirm = async (req, res) => {
  try {
    const { code } = req.body;
    const record = await getSecret(req.user.id);

    if (!record?.two_factor_secret) {
      return res.status(400).json({ message: 'Start setup first' });
    }

    const verified = speakeasy.totp.verify({
      secret: record.two_factor_secret,
      encoding: 'base32',
      token: code,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid code. Please try again' });
    }

    await enable(req.user.id);
    res.json({ message: 'Two-factor authentication enabled' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const turnOff = async (req, res) => {
  try {
    const { password } = req.body;
    const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);

    if (!rows[0] || !(await bcrypt.compare(password, rows[0].password))) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    await disable(req.user.id);
    res.json({ message: 'Two-factor authentication disabled' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

module.exports = { setup, confirm, turnOff };