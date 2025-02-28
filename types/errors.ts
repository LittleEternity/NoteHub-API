export class AppError extends Error {
    constructor(
      public readonly message: string,
      public readonly statusCode: number = 400
    ) {
      super(message);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = "资源未找到") {
        super(message, 404);
    }
}

export class ValidationError extends AppError {
    constructor(message: string = "请求参数错误") {
        super(message, 400);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = "未授权访问") {
        super(message, 401);
    }
}

export class MethodNotAllowedError extends AppError {
    constructor(message: string = "请求方法错误") {
        super(message, 405);
    }
}