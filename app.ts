var { NotFound } = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
import dotenv from 'dotenv';
dotenv.config();

import { Request, Response, NextFunction } from "express";
import routes from "./routes";
import { connectDB } from "./config/db";
import { httpErrorHandler, errorHandler } from "./middlewares/errorHandler";

var app = express();

// 创建数据库连接
connectDB();

// 启用日志中间件
app.use(logger('dev'));

// 解析 JSON 格式的请求体
app.use(express.json());

// 解析 URL 编码格式的请求体
app.use(express.urlencoded({ extended: false }));

//解析请求中的 Cookie 数据
app.use(cookieParser());

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));


app.use("/", routes);

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(NotFound('API Not Found'));
});

// http错误处理
app.use(httpErrorHandler);

// 其他错误处理中间件
app.use(errorHandler);

module.exports = app;
