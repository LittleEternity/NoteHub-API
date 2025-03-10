import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import short from "short-uuid";
const translator = short();

export interface INode {
  nodeId: string; // 内容节点ID
  sort: number; // 排序
  type: string; // 内容节点类型
  content: any; // 内容节点内容
  noteId: string; // 所属笔记ID
  createdAt: Date; // 创建时间
  updatedAt: Date; // 更新时间
}

const NodeSchema = new Schema(
  {
    nodeId: {
      type: String,
      required: true,
      unique: true,
      default: () => translator.fromUUID(uuidv4()),
      index: true,
    },
    sort: {
      type: Number,
      required: true,
      default: 0,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "text", // 文本
        "image", // 图片
        "video", // 视频
        "audio", // 音频
        "code", // 代码
        "math", // 数学公式
        "table", // 表格
        "list", // 列表
        "quote", // 引用
        "divider", // 分割线
        "heading", // 标题
        "page", // 页面
        "file", // 文件
        "gallery", // 画廊
      ], // 限制可选值
      default: "text", // 默认值
    },
    value: {
      type: Schema.Types.Mixed,
      default: "",
    },
    noteId: {
      type: String,
      ref: "Note",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true, // 自动添加createdAt和updatedAt
    versionKey: false, // 禁用__v字段
  }
);

export default mongoose.model<INode>("Node", NodeSchema);
