import mongoose from "mongoose";
import { IVehicleProfile, IUserProfile } from "../models";
import UserProfile from "../models/user.model"
import ApiError from "../utils/ApiError";
import { getUserByIdService, getUsersService, createUserService, deleteUserService, updateUserService } from "./user.service";


export const addVehicleService = async (user_id: number, vehicleData: IVehicleProfile) => {
    let vehicle_id: string, vehicleNumberByType: number;
    const user = await getUserByIdService(user_id);
    user.vehicles.push(vehicleData);
    await user.save();

    const lastIndex: number = user.vehicles.length-1;
    
    if(!user.vehicles[lastIndex]) throw new ApiError(404, "Vehicle not found")
    
    vehicleNumberByType = user.vehicles[lastIndex].vehicle_number_by_type;
    if(vehicleData.vehicle_type === "motorcycle")
    {
        vehicle_id = `M_${vehicleNumberByType}`;
    }
    else if(vehicleData.vehicle_type === "car")
    {
        vehicle_id = `C_${vehicleNumberByType}`;
    }
    else
    {
        throw new ApiError(400, "Invalid vehicle type")
    }

    user.vehicles[lastIndex].vehicle_id = vehicle_id;
    await user.save();

    return user.vehicles;
};

export const getVehicleByPlateService = async (license_plate: string) => {
    const vehicle = await UserProfile.findOne({"vehicles.license_plate": license_plate});
    if(!vehicle) throw new ApiError(404, "Vehicle not found");
    return vehicle;
}

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