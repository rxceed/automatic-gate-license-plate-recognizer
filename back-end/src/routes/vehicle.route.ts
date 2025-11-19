import { Router } from "express";
import {
  getVehiclebyId
} from "../controllers";

const router = Router();

router.get("/:vehicle_id", getVehiclebyId);

export default router