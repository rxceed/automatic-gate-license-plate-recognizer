import { Router } from "express";
import {
  getVehiclebyId,
  getVehicleByPlate
} from "../controllers";

const router = Router();

router.get("/:vehicle_id", getVehiclebyId);
router.get("/", getVehicleByPlate);

export default router;