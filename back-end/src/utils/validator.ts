import joi from "joi"

export const vehicleProfileSchema = joi.object({
    license_plate_number: joi.string().required(),
    vehicle_type: joi.string().required()
})

export const userProfileSchema = joi.object({
    name: joi.string().required(),
    birthdate: joi.date().required(),
    identity_card_number: joi.string().required()
})