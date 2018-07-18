import {Application, NextFunction, Request, Response} from "express";

export type ExpressSignature = (req: Request, res: Response, next: NextFunction) => void;

export interface IRoute {
    URL: string;

    decorate(app: Application);
}
