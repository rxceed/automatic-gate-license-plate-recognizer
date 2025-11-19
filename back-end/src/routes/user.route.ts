import { Router } from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  addVehicle,
  updateVehicle,
  deleteVehicle
} from "../controllers";

const router = Router();

router.route("/").get(getUsers).post(createUser);
router.route("/:user_id").get(getUserById).patch(updateUser).delete(deleteUser);
router.post("/:user_id/vehicle", addVehicle);
router.patch("/:user_id/vehicle/:vehicle_id", updateVehicle);
router.delete("/:user_id/vehicle/:vehicle_id", deleteVehicle);

export default router;
