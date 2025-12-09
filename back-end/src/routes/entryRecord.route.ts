import { Router } from "express";
import { 
    createEntryRecord,
    getEntryRecord,
    getEntryRecordByID_and_ByID,
    deleteEntryRecordByID
} from "../controllers";

const router = Router();

router.route("/").post(createEntryRecord).get(getEntryRecordByID_and_ByID).delete(deleteEntryRecordByID)
router.get("/all", getEntryRecord)

export default router;