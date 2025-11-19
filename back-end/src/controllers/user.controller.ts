import { Request, Response, NextFunction } from "express";
import {
    createUserService,
    getUsersService,
    getUserByIdService,
    updateUserService,
    deleteUserService
} from "../services/user.service";
import { vehicleProfileSchema, userProfileSchema } from "../utils/validator";
import { IVehicleProfile, IUserProfile } from "../models";
import ApiError from "../utils/ApiError";

/* ----------------------------------------
 * USER CONTROLLER
 * ---------------------------------------- */

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try 
    {
        const data: IUserProfile = req.body;
        const {error, value} = userProfileSchema.validate(data);
        if(error) throw new ApiError(400, error.message);
        const user = await createUserService(data);
        res.status(201).json({ success: true, user });
    } 
    catch(err)
    {
        next(err);
    }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try 
    {
        const users = await getUsersService();
        res.json({ success: true, users });
    } 
    catch(err) 
    {
        next(err);
    }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await getUserByIdService(Number(req.params.user_id));
        res.json({ success: true, user });
    } catch (err) {
        next(err);
    }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try 
    {
        const data: IUserProfile = req.body;
        const forkedUserProfileSchema = userProfileSchema.fork(["name", "identity_card_number", "birthdate"], (schema)=>schema.optional());
        const {error, value} = forkedUserProfileSchema.validate(data);
        if(error) throw new ApiError(400, error.message);
        const updated = await updateUserService(Number(req.params.user_id), req.body);
        res.json({ success: true, user: updated });
    } 
    catch(err) 
    {
        next(err);
    }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try 
    {
        await deleteUserService(Number(req.params.user_id));
        res.json({ success: true, message: "User deleted" });
    } 
    catch(err) 
    {
        next(err);
    }
};

