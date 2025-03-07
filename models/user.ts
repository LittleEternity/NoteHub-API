import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import short from 'short-uuid';
const translator = short();

export interface IUser {
  userId: string; // 用户ID
  avatar: string; // 头像
  gender: "male" | "female" | "other" | ""; // 性别
  desc: string; // 个性签名
  name: string; // 用户名
  email: string; // 邮箱
  password: string; // 密码
  createdAt: Date; // 创建时间
  updatedAt: Date; // 更新时间
  lastLoginAt: Date; // 最后登录时间
}

const UserSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      default: () => translator.fromUUID(uuidv4()),
      index: true,
    },
    avatar: {
      type: String,
      default: "", // 默认头像
    },
    gender: {
      type: String,
      default: "", // 性别
      enum: ["male", "female", "other", ""], // 限制可选值
    },
    desc: {
      type: String,
      default: "", // 个性签名
    },
    name: {
      type: String,
      required: true,
      unique: true,
      minlength: 2,
      maxlength: 20,
      index: true, // 添加索引
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [
        // 邮箱格式验证
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "请输入有效的邮箱地址",
      ],
      index: true, // 添加索引
    },
    password: {
      type: String,
      required: true,
      select: false, // 默认不返回密码字段
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // 自动添加createdAt和updatedAt
    versionKey: false, // 禁用__v字段
    toJSON: {
      // 添加序列化配置
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

// 添加密码加密中间件
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

export default mongoose.model<IUser>("User", UserSchema);
