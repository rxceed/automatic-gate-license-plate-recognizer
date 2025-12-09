import mongoose, { Schema, Document } from "mongoose";
import AutoIncrementFactory from "mongoose-sequence"

export interface IEntryRecord extends Document {
    entry_record_id: number
    entry_time: Date,
    vehicle_id: string,
    license_plate: string,
    name: string,
}

export const EntryRecordSchema: Schema = new Schema(
    {
        entry_record_id: {
            type: Number,
            required: true
        },
        entry_time: {
            type: Date,
            required: true,
            default: Date.now
        },
        vehicle_id: {
            type: String,
            required: true,
            trim: true,
        },
        license_plate: {
            type: String,
            required: true,
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
    }
)

EntryRecordSchema.plugin(AutoIncrementFactory as any, {
    id: "entry_record_seq",
    inc_field: "entry_record_id"
});

export default mongoose.model<IEntryRecord>("entry_tracker", EntryRecordSchema);