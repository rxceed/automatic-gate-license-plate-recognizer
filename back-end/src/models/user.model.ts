import mongoose, { Schema, Document } from "mongoose";
import { IVehicleProfile, VehicleProfileSchema } from "./vehicle.model";

/* --------------------------------------
 * User Profile Schema (Parent Document)
 * -------------------------------------- */
export interface IUserProfile extends Document {
    user_id: number,
    name: string,
    birthdate: Date,
    identity_card_number: string,
    date_registered: Date,
    vehicles: IVehicleProfile[];
}

export const UserProfileSchema: Schema = new Schema(
    {
        user_id: {
            type: Number,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        birthdate: {
            type: Date,
            required: true
        },
        identity_card_number: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        date_registered: {
            type: Date,
            default: Date.now,
        },

        // Embedded one-to-many vehicle list
        vehicles: {
        type: [VehicleProfileSchema], // Array of embedded vehicles
        default: [],
        },
    },
    {
        collection: "user_profile",
    }
);
