import { Request, Response, NextFunction } from "express";
import { createEntryRecordService, 
    getEntryRecordService,
    getEntryRecordByIDService, 
    getEntryRecordByVehicleIDService, 
    deleteEntryRecordByIDService } from "../services";
import ApiError from "../utils/ApiError";
import { entryRecordSchema } from "../utils/validator";
import { IEntryRecord } from "../models";

export const createEntryRecord = async (req: Request, res: Response, next: NextFunction) => {
    try
    {
        const data: IEntryRecord = req.body;
        const {error, value} = entryRecordSchema.validate(data);
        if(error) throw new ApiError(400, error.message);
        const record = await createEntryRecordService(data);
        res.status(201).json({success: "true", record});
    }
    catch(err)
    {
        next(err);
    }
}

export const getEntryRecord = async (req: Request, res: Response, next: NextFunction) => {
    try
    {
        const record = await getEntryRecordService();
        res.status(200).json({success: "true", record});
    }
    catch(err)
    {
        next(err);
    }
}

export const getEntryRecordByID_and_ByID = async (req: Request, res: Response, next: NextFunction) => {
    try
    {
        const record_id = parseInt(req.query.record_id as string)
        const vehicle_id = req.query.vehicle_id as string
        let record;
        if(record_id && !vehicle_id) 
        {    
            record = await getEntryRecordByIDService(record_id);
        }
        else if(!record_id && vehicle_id)
        {
            record = await getEntryRecordByVehicleIDService(req.query.vehicle_id as string);
        }
        res.status(200).json({success: "true", record});
    }
    catch(err)
    {
        next(err);
    }
}

export const deleteEntryRecordByID = async (req: Request, res: Response, next: NextFunction) => {
    try
    {
        const record = await deleteEntryRecordByIDService(parseInt(req.query.record_id as string));
        res.status(200).json({success: "true", record});
    }
    catch(err)
    {
        next(err);
    }
}