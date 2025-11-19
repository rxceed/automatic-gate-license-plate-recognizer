import mongoose from "mongoose";
import { IVehicleProfile, IUserProfile, UserProfileSchema } from "../models";
import ApiError from "../utils/ApiError";
import { getUserByIdService, getUsersService, createUserService, deleteUserService, updateUserService } from "./user.service";

const UserProfile = mongoose.model<IUserProfile>("user_profiles", UserProfileSchema);

export const addVehicleService = async (user_id: number, vehicle: IVehicleProfile) => {
    const user = await getUserByIdService(user_id);

    user.vehicles.push(vehicle);
    await user.save();

    return user.vehicles;
};

export const getVehicleByIdService = async (vehicle_id: string) =>{
    const vehicle = await UserProfile.findOne({"vehicles.vehicle_id": vehicle_id});
    if(!vehicle) throw new ApiError(404, "Vehicle not found");
    return vehicle;
}

export const updateVehicleService = async (
    user_id: number,
    vehicle_id: string,
    data: Partial<IVehicleProfile>
) => {
    const user = await getUserByIdService(user_id);

    const vehicle = user.vehicles.find(v => v.vehicle_id === vehicle_id);
    if (!vehicle) throw new ApiError(404, "Vehicle not found");

    Object.assign(vehicle, data);
    await user.save();

    return user.vehicles;
};

export const deleteVehicleService = async (user_id: number, vehicle_id: string) => {
    const user = await getUserByIdService(user_id);

    user.vehicles = user.vehicles.filter(v => v.vehicle_id !== vehicle_id);
    await user.save();

    return true;
};