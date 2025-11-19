import mongoose, { Schema, Document } from "mongoose";

export interface IVehicleProfile {
    vehicle_id: string,
    license_plate: string,
    vehicle_type: string,
    date_registered: Date;
}

export const VehicleProfileSchema: Schema = new Schema(
    {
        vehicle_id: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        license_plate: {
            type: String,
            required: true,
            trim: true,
        },
        vehicle_type: {
            type: String,
            required: true,
            trim: true
        },
        date_registered: {
            type: Date,
            default: Date.now,
        },
    },
);
