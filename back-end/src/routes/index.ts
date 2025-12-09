import userRoutes from "./user.route"
import vehicleRoutes from "./vehicle.route"
import entryRecordRoutes from "./entryRecord.route"
import { Router } from "express"

const routes = Router();

routes.use("/api/user", userRoutes);
routes.use("/api/vehicle", vehicleRoutes);
routes.use("/api/entry_record", entryRecordRoutes);

export default routes