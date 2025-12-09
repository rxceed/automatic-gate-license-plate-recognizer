import mongoose from "mongoose";
import { IEntryRecord, EntryRecordSchema } from "../models";
import ApiError from "../utils/ApiError";
import EntryRecord from "../models/entryRecord.model"

export const createEntryRecordService = async (data: IEntryRecord) => {
    return await EntryRecord.create(data);
}

export const getEntryRecordService = async () => {
    return await EntryRecord.find();
}

export const getEntryRecordByVehicleIDService = async (vehicle_id: string) => {
    const record = await EntryRecord.find({vehicle_id: vehicle_id});
    if(!record) throw new ApiError(404, "Entry record not found");
    return record;
}

export const getEntryRecordByIDService = async (record_id: number) => {
    const record = await EntryRecord.findOne({entry_record_id: record_id});
    if(!record) throw new ApiError(404, "Entry record not found");
    return record;
}

export const deleteEntryRecordByIDService = async (record_id: number) => {
    const record = await EntryRecord.findOneAndDelete({entry_record_id: record_id});
    if(!record) throw new ApiError(404, "Entry record not found");
    return record;
}