import joi from "joi"

export const vehicleProfileSchema = joi.object({
    license_plate: joi.string().required(),
    vehicle_type: joi.string().required().valid("motorcycle", "car")
})

export const userProfileSchema = joi.object({
    name: joi.string().required(),
    birthdate: joi.date().required(),
    identity_card_number: joi.string().required(),
    password: joi.string().min(8).max(32)
})

export const entryRecordSchema = joi.object({
    entry_time: joi.date().required(),
    vehicle_id: joi.string().required(),
    license_plate: joi.string().required(),
    name: joi.string().required()
})