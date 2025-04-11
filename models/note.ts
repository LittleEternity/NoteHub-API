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
  parentNoteId: string[]; // 父笔记ID
}

export interface NoteModel extends mongoose.Model<INote> {
  getHierarchyPath: (
    noteId: string,
    pathChain: string[]
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

// ... existing code ...

// 添加静态方法查找笔记的指定层级路径
NoteSchema.statics.getHierarchyPath = async function (
  this: NoteModel,
  noteId: string,
  pathChain: string[] = []
): Promise<{ noteId: string; title: string }[]> {
  const note = await this.findOne({ noteId });
  if (!note) {
    return [];
  }
  if (pathChain.length === 0) {
    if (!note.parentNoteId || note.parentNoteId.length === 0) {
      return [{ noteId: note.noteId, title: note.title }];
    }
    // 如果没有提供父链，默认选择第一个父笔记
    const firstParentId = note.parentNoteId[0];
    const parentPath = await this.getHierarchyPath(firstParentId, []);
    return [...parentPath, { noteId: note.noteId, title: note.title }];
  }
  const currentParentId = pathChain.shift();
  if (
    !currentParentId ||
    (note.parentNoteId && !note.parentNoteId.includes(currentParentId))
  ) {
    throw new Error("Invalid parent chain provided");
  }
  const parentPath = await this.getHierarchyPath(currentParentId, pathChain);
  return [...parentPath, { noteId: note.noteId, title: note.title }];
} as (
  this: mongoose.Model<INote>,
  noteId: string,
  pathChain?: string[]
) => Promise<{ noteId: string; title: string }[]>;

export default mongoose.model<INote, NoteModel>("Note", NoteSchema);
