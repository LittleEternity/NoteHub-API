import { Request, Response, NextFunction } from "express";
import { login } from "../controllers/authController";

var express = require('express');
var router = express.Router();

// 登录路由
router.post("/login", login);

/* GET users listing. */
router.get('/', function(req: Request, res: Response, next: NextFunction) {
  res.send('respond with a resource');
});


module.exports = router;
