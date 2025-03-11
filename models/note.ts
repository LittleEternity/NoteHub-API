import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import short from "short-uuid";
const translator = short();

// 存储每个用户的操作路径
const userPaths = new Map<string, string[]>();

export interface INote extends Document {
  noteId: string; // 笔记ID
  title: string; // 笔记标题
  creatorId: string; // 创作者ID
  lastEditorId: string; // 最后编辑者ID
  coverImage?: string; // 封面图片
  icon?: string; // 图标名称
  content?: string[]; // 笔记内容
  createdAt: Date; // 创建时间
  updatedAt: Date; // 更新时间
  parentNoteId?: string[]; // 父笔记ID
}

export interface NoteModel extends mongoose.Model<INote> {
  recordUserPath: (userId: string, noteId: string) => Promise<void>;
  getHierarchyPath: (
    userId: string
  ) => Promise<{ noteId: string; title: string }[]>;
}

const NoteSchema: Schema = new Schema(
  {
    noteId: {
      type: String,
      required: true,
      unique: true,
      default: () => translator.fromUUID(uuidv4()),
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    creatorId: {
      type: String,
      ref: "User",
      required: true,
      index: true,
    },
    lastEditorId: {
      type: String,
      ref: "User",
      required: true,
      index: true,
    },
    coverImage: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: null,
    },
    content: {
      type: [String],
      ref: "Node",
      default: [],
    },
    parentNoteId: {
      type: [String],
      ref: "Note",
      default: [],
    },
  },
  {
    timestamps: true, // 自动添加createdAt和updatedAt
    versionKey: false, // 禁用__v字段
  }
);

// 添加复合索引优化查询
NoteSchema.index({ creatorId: 1, updatedAt: -1 });
NoteSchema.index({ parentNoteId: 1 });

// 全文搜索索引
NoteSchema.index({ title: "text", content: "text" });

// 记录用户打开笔记的操作
NoteSchema.statics.recordUserPath = async function (
  userId: string,
  noteId: string
) {
  const currentPath = userPaths.get(userId) || [];
  const note = this.findOne({ noteId });
  if (note) {
    if (currentPath.length > 0) {
      const lastNoteId = currentPath[currentPath.length - 1];
      const lastNote = this.findOne({ lastNoteId });
      if (
        lastNote &&
        note.parentNoteId &&
        note.parentNoteId.includes(lastNoteId)
      ) {
        currentPath.push(noteId);
      } else {
        // 如果当前笔记不是上一个笔记的子笔记，重新开始记录路径
        currentPath.length = 0;
        currentPath.push(noteId);
      }
    } else {
      currentPath.push(noteId);
    }
    userPaths.set(userId, currentPath);
  }
};

// 获取用户当前笔记的层级路径
NoteSchema.statics.getHierarchyPath = async function (userId: string) {
  const currentPath = userPaths.get(userId) || [];
  let path = [];
  for (let i = 0; i < currentPath.length; i++) {
    const noteId = currentPath[i];
    const note = await this.findOne({ noteId });
    if (note) {
      path.push({
        noteId: note.noteId,
        title: note.title,
      });
    }
  }
  return path;
};

export default mongoose.model<INote, NoteModel>("Note", NoteSchema);
