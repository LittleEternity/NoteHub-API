import { Request, Response } from "express";

exports.homeController = (req: Request, res: Response) => {
  res.render("index", { title: "Express" });
};
