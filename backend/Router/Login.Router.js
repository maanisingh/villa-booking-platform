// const express = require("express");
// const router = express.Router();
// const {
//   adminLogin,
//   createOwner,
//   getAllOwners,
//   updateOwner,
//   deleteOwner,
//   ownerLogin,
//   changeOwnerPassword
// } = require("../Controller/Login.Controller");

// const upload = require("../Middleware/UploadeMiddleware");
// // const { verifyAdmin, verifyOwner } = require("../Middleware/LoginMiddleware");

// // ✅ Admin login (hardcoded credentials)
// router.post("/admin/login", adminLogin);
// // ✅ Owner login
// router.post("/owner/login", ownerLogin);

// // ✅ Admin creates owner (token required)
// router.post("/owners/create",  upload.single("image"), createOwner);

// // ✅ Get all owners (admin only)
// router.get("/owners",  getAllOwners);

// // ✅ Edit / Update Owner (admin only)
// router.put("/owners/:id", upload.single("image"), updateOwner);
// // ✅ Delete Owner (admin only)
// router.delete("/owners/:id",  deleteOwner);
// // Change password
// router.put("/changePassword/:id", changeOwnerPassword);

// module.exports = router;

const express = require("express");
const router = express.Router();
const ownerController = require("../Controller/Login.Controller");
const auth = require("../Middleware/AuthMiddleware");
const multer = require("multer");

// Multer setup for image upload
const upload = multer({ dest: "uploads/" });

// Admin routes
router.post("/admin/login", ownerController.adminLogin);
router.get("/owners", ownerController.getAllOwners);
router.post("/owners", upload.single("image"), ownerController.createOwner);
router.delete("/owners/:id", ownerController.deleteOwner);

// Owner self routes (Protected)
router.post("/owner/login", ownerController.ownerLogin);
router.get("/owner/profile", auth, ownerController.getOwnerProfile);
router.put("/owner/profile", auth, upload.single("image"), ownerController.updateOwnerProfile);
router.put("/owner/change-password", auth, ownerController.changeOwnerPassword);

module.exports = router;

