import mongoose from "mongoose";
import { IVehicleProfile, IUserProfile } from "../models";
import UserProfile from "../models/user.model"
import ApiError from "../utils/ApiError";

export const createUserService = async (data: IUserProfile) => {
    return await UserProfile.create(data);
};

export const getUsersService = async () => {
    return await UserProfile.find();
};

export const getUserByIdService = async (user_id: number) => {
    const user = await UserProfile.findOne({user_id: user_id});
    if (!user) throw new ApiError(404, "User not found");
    return user;
};

export const updateUserService = async (user_id: number, data: IUserProfile) => {
    const updated = await UserProfile.findOneAndUpdate({user_id: user_id }, data, { new: true });
    if (!updated) throw new ApiError(404, "User not found");
    return updated;
};

export const deleteUserService = async (user_id: number) => {
    const deleted = await UserProfile.findOneAndDelete({ user_id });
    if (!deleted) throw new ApiError(404, "User not found");
    return deleted;
};
