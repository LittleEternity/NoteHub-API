import { Request, Response, NextFunction } from "express";
import Note from "../models/note";
import Node from "../models/node";
import mongoose from "mongoose";
import type { INote } from "../models/note";
import node from "../models/node";

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
    const notes = await Note.find({ creatorId: creatorId || userId })
      .sort({
        updatedAt: -1,
      })
      .select("-_id");
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
    const { noteId } = req.query;
    // 如果用户没传 noteId 则默认返回根节点
    let result: any = {};
    if (!noteId) {
      result = await Note.findOne({ parentNoteId: null }).select("-_id");
    } else {
      result = await Note.findOne({ noteId }).select("-_id");
    }
    const note = {
      noteId: result.noteId,
      creatorId: result.creatorId,
      lastEditorId: result.lastEditorId,
      title: result.title,
      content: result.content,
      coverImage: result.coverImage,
      icon: result.icon,
      parentNoteId: result.parentNoteId,
    };
    if (!note) {
      return res.status(404).json({ message: "笔记未找到" });
    }
    const nodeIds = note.content || [];
    if (nodeIds && Array.isArray(nodeIds) && nodeIds.length > 0) {
      const nodes = await Node.find({
        nodeId: { $in: nodeIds },
      })
        .select("-_id")
        .sort({ sort: 1 }); // 按照 sort 字段升序排列
      const parsedNodes = nodes.map((node: any) => {
        return {
          nodeId: node.nodeId,
          type: node.type,
          value: node.value,
        };
      });
      note.content = parsedNodes;
    } else {
      note.content = [];
    }
    res.json({
      success: true,
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

// 更新笔记
export const updateNote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "未提供有效的 userId" });
      return;
    }
    const { noteId, title, content, coverImage, icon } = req.body;
    const note: any = await Note.findOne({ noteId });
    if (!note) {
      res.status(404).json({ message: "笔记未找到" });
      return;
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (content) {
        const newNodes: string[] = []; // 存储新创建的节点的 nodeId
        const existingNodeIds: string[] = []; // 存储已存在的节点的 nodeId
        for (let index = 0; index < content.length; index++) {
          const item = content[index];
          if (item.nodeId) {
            const node = await Node.findOneAndUpdate(
              { nodeId: item.nodeId },
              {
                type: item.type,
                sort: index,
                value: item.value,
                noteId: note.noteId,
              },
              { new: true, session }
            );
            if (node) existingNodeIds.push(node.nodeId);
          } else {
            const [newNode] = await Node.create(
              [
                {
                  type: item.type,
                  sort: index,
                  value: item.value,
                  noteId: note.noteId,
                },
              ],
              { session }
            );
            newNodes.push(newNode.nodeId);
          }
        }

        if (!note.content || !Array.isArray(note.content)) {
          note.content = [...existingNodeIds, ...newNodes];
        } else {
          const currentNodeIds = note.content.map((node: any) => node.nodeId);
          const nodesToDelete = currentNodeIds.filter(
            (id: any) => !existingNodeIds.includes(id) && !newNodes.includes(id)
          );
          if (nodesToDelete.length > 0) {
            await Node.deleteMany(
              { nodeId: { $in: nodesToDelete } },
              { session }
            );
          }
          note.content = [...existingNodeIds, ...newNodes];
        }
      }

      note.title = title;
      note.coverImage = coverImage;
      note.icon = icon;
      note.lastEditorId = userId;

      await note.save({ session });
      await session.commitTransaction();

      res.json({
        success: true,
        message: "笔记更新成功",
        data: note,
      });
    } catch (error) {
      await session.abortTransaction();
      next(error);
    } finally {
      session.endSession();
    }
  } catch (error) {
    next(error);
  }
};
// ... existing code ...

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
    const notes = await Note.find({ parentNoteId: noteId })
      .sort({
        updatedAt: -1,
      })
      .select("-_id");
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
    const notes = await Note.find({ $text: { $search: keyword } })
      .sort({
        updatedAt: -1,
      })
      .select("-_id");
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
    const notes = await Note.find({ creatorId: creatorId || userId })
      .sort({ updatedAt: -1 })
      .select("-_id");
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
