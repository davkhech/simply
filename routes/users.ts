import crypto = require('crypto');
import express = require('express');
import path = require('path');
import uuid = require('uuid');
const router = express.Router();

const redis = require("redis"),
  client = redis.createClient();

import { checkAuth } from './middlewares';
import { getModels } from '../models';

router.get('/', checkAuth, async function (req, res, next) {
  const { User } = await getModels();
  let users = await User.find({
    modification_date: { $gt: Date.now() - 3600000 },
    session: { $ne: null }
  });
  const userNames = users.map((user: { name: string }) => user.name);
  const fields = userNames.map(
    (uname: string, ind: number) =>
      `<button id="button_${ind}" value="${uname}" name="user">${uname}</button>`
  ).join('\n');
  const document = `<form method="post"> ${fields} </form>`;

  res.send(document);
});

router.post('/', async function (req, res, next) {
  const { User } = await getModels();
  const user = await User.findOne({ name: req.body.user });
  if (user) {
    client.set(req.cookies.session, user.session);
    client.set(user.session, req.cookies.session);
  }
  res.sendFile('public/html/socket.html', {
    root: path.join(__dirname, '..', '..')
  });
});

router.get('/login', function (req, res, next) {
  res.sendFile('public/html/signin.html', {
    root: path.join(__dirname, '..', '..')
  });
});

router.post('/login', async function (req, res, next) {
  const { name, pass } = req.body;
  const { User } = await getModels();

  if (!name || !pass) {
    return res.send('Not enough credentials');
  }

  const passwordHash = generatePasswordHash(pass);
  const user = await User.findOne({ name });
  if (user) {
    if (user.password === passwordHash) {
      user.session = uuid.v4();
      await user.save();
      res.cookie("session", user.session);
      return res.redirect('/users');
    }
    return res.status(500).send('wrong password');
  }
  const newUser = new User({
    name,
    password: passwordHash,
    session: uuid.v4()
  });
  await newUser.save();
  res.cookie("session", newUser.session);
  return res.redirect('/users');
});

router.get('/logout', async function (req, res, next) {
  const { User } = await getModels();
  const user = await User.findOne({ session: req.cookies.session });
  if (user) {
    user.session = null;
    await user.save();
  }
  res.redirect('/users/login');
});

export default router;

function generatePasswordHash(passowrd: string) {
  let hash = crypto.createHash('sha1');
  let data = hash.update(passowrd, 'utf8');
  return data.digest('hex');
}
