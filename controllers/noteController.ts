import { Request, Response, NextFunction } from "express";
import Note from "../models/note";

// 创建笔记
export const createNote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { creatorId, lastEditorId, parentNoteId } = req.body;
    const userId = req.user && req.user.userId;
    const newNote = await Note.create({
      creatorId: creatorId || userId,
      lastEditorId: lastEditorId || creatorId || userId,
      title: "",
      content: null,
      coverImage: null,
      icon: null,
      parentNoteId: parentNoteId || null,
    });

    res &&
      res.status &&
      res.status(201).json({
        success: true,
        message: "笔记创建成功",
        data: newNote,
      });
  } catch (error) {
    next(error);
  }
};

// 根据userId获取笔记列表
export const getNoteList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { creatorId } = req.query;
    const userId = req.user && req.user.userId;
    const notes = await Note.find({ creatorId: creatorId || userId }).sort({
      updatedAt: -1,
    }).select("-_id");
    res.json({
      success: true,
      data: notes,
    });
  } catch (error) {
    next(error);
  }
};

// 获取笔记详情
export const getNoteDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { noteId } = req.params;
    // 如果用户没传 noteId 则默认返回根节点
    if (!noteId) {
      const notes = await Note.find({ parentNoteId: null }).sort({
        updatedAt: -1,
      }).select("-_id");
      return res.json({
        success: true,
        data: notes.length > 0 ? notes[0] : [],
      });
    } else {
        const note = await Note.findById(noteId);
        if (!note) {
          return res.status(404).json({ message: "笔记未找到" });
        }
        res.json({
          success: true,
          data: note,
        });
    }
  } catch (error) {
    next(error);
  }
};

// 更新笔记
export const updateNote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { noteId } = req.params;
    const userId = req.user && req.user.userId;
    if (!userId) {
        return res.status(401).json({ message: "未提供有效的 userId" });
      }
    const { title, content, coverImage, icon } = req.body;
    const note = await Note.findById(noteId).select("-_id");
    if (!note) {
      return res.status(404).json({ message: "笔记未找到" });
    }
    note.title = title;
    note.content = content;
    note.coverImage = coverImage;
    note.icon = icon;
    note.lastEditorId = userId || '';
    await note.save();
    res.json({
      success: true,
      message: "笔记更新成功",
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

// 删除笔记
export const deleteNote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "笔记未找到" });
    }
    await note.deleteOne();
    res.json({
      success: true,
      message: "笔记删除成功",
    });
  } catch (error) {
    next(error);
  }
};

// 移动笔记
export const moveNote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { noteId, parentNoteId } = req.params;
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "笔记未找到" });
    }
    note.parentNoteId = parentNoteId;
    await note.save();
    res.json({
      success: true,
      message: "笔记移动成功",
    });
  } catch (error) {
    next(error);
  }
};

// 获取笔记子节点
export const getNoteChildren = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { noteId } = req.params;
    const notes = await Note.find({ parentNoteId: noteId }).sort({
      updatedAt: -1,
    }).select("-_id");
    res.json({
      success: true,
      data: notes,
    });
  } catch (error) {
    next(error);
  }
};

// 搜索笔记
export const searchNotes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { keyword } = req.query;
    if (typeof keyword !== "string") {
      return res.status(400).json({ message: "请提供有效的搜索关键字" });
    }
    const notes = await Note.find({ $text: { $search: keyword } }).sort({
      updatedAt: -1,
    }).select("-_id");
    res.json({
      success: true,
      data: notes,
    });
  } catch (error) {
    next(error);
  }
};

// 构建笔记树的辅助函数
function buildNoteTree(notes: any[]) {
  const noteMap: { [key: string]: any } = {};
  const tree: any[] = [];

  // 首先将所有笔记存储到一个映射中，方便快速查找
  notes.forEach((note) => {
    note.children = [];
    noteMap[note._id] = note;
  });

  // 然后遍历笔记，将子笔记添加到其父笔记的 children 数组中
  notes.forEach((note) => {
    if (note.parentNoteId) {
      const parent = noteMap[note.parentNoteId];
      if (parent) {
        parent.children.push(note);
      }
    } else {
      // 如果没有父笔记，将其作为根节点添加到树中
      tree.push(note);
    }
  });

  return tree;
}

// 获取笔记树
export const getNoteTree = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { creatorId } = req.query;
    const userId = req.user && req.user.userId;
    const notes = await Note.find({ creatorId: creatorId || userId }).sort({ updatedAt: -1 }).select("-_id");
    const tree = buildNoteTree(notes);
    res.status(200).json({
      success: true,
      data: tree,
    });
  } catch (error) {
    next(error);
  }
};

// 获取笔记路径
export const getNotePath = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "笔记未找到" });
    }
    const pathIds = note.path.split("/");
    const notes = await Note.find({ noteId: { $in: pathIds } }).select(
      "title noteId"
    );
    const path = notes
      .sort((a, b) => pathIds.indexOf(a.noteId) - pathIds.indexOf(b.noteId))
      .map((n) => n.title)
      .join("/");
    res.json({
      success: true,
      data: {
        path,
      },
    });
  } catch (error) {
    next(error);
  }
};
