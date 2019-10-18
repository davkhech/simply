import { Request, Response } from "express";
import { getModels } from "../models";

export async function checkAuth(req: Request, res: Response, next: Function) {
    if (req.url == '/users/login') {
        return next();
    }
    const { User } = await getModels();
    const user = await User.findOne({session: req.cookies.session});
    if (user && user.modification_date > Date.now() - 3600000) {
        return next();
    }
    res.redirect('/users/login');
}