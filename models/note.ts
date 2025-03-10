import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import short from "short-uuid";
const translator = short();

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
  parentNoteId?: string; // 父笔记ID
  path: string; // 笔记路径
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
      type: String,
      ref: "Note",
      default: null,
    },
    path: {
      type: String,
      default: "",
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
NoteSchema.index({ path: 1 });

// 全文搜索索引
NoteSchema.index({ title: "text", content: "text" });

// 保存前更新路径信息
NoteSchema.pre("save", async function (this: INote, next) {
  // 尝试将 this 上下文对象转换为 INote 类型
  let note = this as INote;

  if (note.parentNoteId) {
    try {
      // 查找父笔记
      const parentNote = await mongoose
        .model<INote>("Note")
        .findById(note.parentNoteId);
      if (parentNote) {
        // 更新笔记路径
        note.path = `${parentNote.path}/${note.noteId}`;
      }
    } catch (error) {
      // 若查找父笔记失败，记录错误信息
      console.error("Failed to find parent note:", error);
    }
  } else {
    // 若没有父笔记，笔记路径为自身 ID
    note.path = note.noteId;
  }

  // 继续执行保存操作
  next();
});

export default mongoose.model<INote>("Note", NoteSchema);
