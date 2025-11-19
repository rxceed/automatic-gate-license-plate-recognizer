import userRoutes from "./user.route"
import vehicleRoutes from "./vehicle.route"
import { Router } from "express"

const routes = Router();

routes.use("/api/user", userRoutes);
routes.use("/api/vehicle", vehicleRoutes);

export default routes