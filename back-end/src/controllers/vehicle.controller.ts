import { Request, Response, NextFunction } from "express";
import {
    addVehicleService,
    updateVehicleService,
    deleteVehicleService,
    getVehicleByIdService
} from "../services";
import { vehicleProfileSchema, userProfileSchema } from "../utils/validator";
import { IVehicleProfile, IUserProfile } from "../models";
import ApiError from "../utils/ApiError";

export const addVehicle = async (req: Request, res: Response, next: NextFunction) => {
    try
    {
        const data: IVehicleProfile = req.body
        const {error, value} = vehicleProfileSchema.validate(data);
        if(error) throw new ApiError(400, error.message);
        const vehicles = await addVehicleService(Number(req.params.user_id), data);
        res.status(201).json({ success: true, vehicles });
    } 
    catch(err) 
    {
        next(err);
    }
};

export const getVehiclebyId = async (req: Request, res: Response, next: NextFunction) =>{
    try 
    {
        const vehicle = await getVehicleByIdService(req.params.vehicle_id as string);
        res.json({success: true, vehicle});
    } 
    catch(err) 
    {
        next(err);    
    }
}

export const updateVehicle = async (req: Request, res: Response, next: NextFunction) => {
    try 
    {
        const data: IVehicleProfile = req.body;
        const forkedVehicleProfileSchema = vehicleProfileSchema.fork(["license_plate_number", "vehicle_type"], (schema)=>schema.optional());
        const {error, value} = forkedVehicleProfileSchema.validate(data);
        if(error) throw new ApiError(400, error.message);
        const vehicles = await updateVehicleService(Number(req.params.user_id), req.params.vehicle_id as string, req.body);
        res.json({ success: true, vehicles });
    } 
    catch(err) 
    {
        next(err);
    }
};

export const deleteVehicle = async (req: Request, res: Response, next: NextFunction) => {
    try 
    {
        await deleteVehicleService(Number(req.params.user_id), req.params.vehicle_id as string);
        res.json({ success: true, message: "Vehicle removed" });
    } 
    catch (err) 
    {
        next(err);
    }
};