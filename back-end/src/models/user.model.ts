import mongoose, { Schema, Document } from "mongoose";
import AutoIncrementFactory from "mongoose-sequence"
import { IVehicleProfile, VehicleProfileSchema } from "./vehicle.model";

const AutoIncrement = AutoIncrementFactory(mongoose as any);

/* --------------------------------------
 * User Profile Schema (Parent Document)
 * -------------------------------------- */
export interface IUserProfile extends Document {
    user_id: number,
    name: string,
    birthdate: Date,
    identity_card_number: string,
    password: string,
    date_registered: Date,
    vehicles: IVehicleProfile[];
}

const UserProfileSchema: Schema = new Schema(
    {
        user_id: {
            type: Number,
            //required: true,
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
        password: {
            type: String,
            required: true,
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

UserProfileSchema.plugin(AutoIncrement as any, {
    id: "user_profile_seq",
    inc_field: "user_id",
})

VehicleProfileSchema.plugin(AutoIncrement as any, {
    id: "vehicle_profile_seq",
    inc_field: "vehicle_number_by_type",
    reference_fields: ["vehicle_type"]
})

export default mongoose.model<IUserProfile>("user_profiles", UserProfileSchema)
