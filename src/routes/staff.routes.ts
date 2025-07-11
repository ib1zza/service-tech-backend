import { Router, Request, Response, NextFunction } from "express";
import { StaffService } from "../services/StaffService";
import { currentUser } from "../middlewares/current-user";
import { requireAuth } from "../middlewares/require-auth";
import { requireRole } from "../middlewares/require-role";

interface CreateStaffBody {
  login: string;
  password: string;
  fio: string;
}

export const staffRouter = (staffService: StaffService) => {
  const router = Router();

  // Proper middleware chaining with error handling
  router.use((req: Request, res: Response, next: NextFunction) => {
    currentUser(req, res, (err?: any) => {
      if (err) return next(err);
      requireAuth(req, res, (err?: any) => {
        if (err) return next(err);
        requireRole("admin")(req, res, next);
      });
    });
  });

  router.post(
    "/",
    async (req: Request<{}, {}, CreateStaffBody>, res: Response) => {
      try {
        const { login, password, fio } = req.body;
        const staff = await staffService.createStaff(login, password, fio);
        res.status(201).json(staff);
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to create staff member";
        res.status(400).json({ error: message });
      }
    }
  );

  router.get(
    "/:id/appeals",
    async (req: Request<{ id: string }>, res: Response) => {
      try {
        const staffId = parseInt(req.params.id);
        if (isNaN(staffId)) {
          res.status(400).json({ error: "Invalid staff ID" });
          return;
        }

        const appeals = await staffService.getStaffAppeals(staffId);
        res.json(appeals);
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to get staff appeals";
        res.status(400).json({ error: message });
      }
    }
  );

  router.put("/:id", async (req: Request<{ id: string }>, res: Response) => {
    try {
      const staffId = parseInt(req.params.id);
      if (isNaN(staffId)) {
        res.status(400).json({ error: "Invalid staff ID" });
        return;
      }

      const { login, password, fio } = req.body;
      const staff = await staffService.editStaff(staffId, fio, login, password);
      res.json(staff);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update staff member";
      res.status(400).json({ error: message });
    }
  });

  router.delete("/:id", async (req: Request<{ id: string }>, res: Response) => {
    try {
      const staffId = parseInt(req.params.id);
      if (isNaN(staffId)) {
        res.status(400).json({ error: "Invalid staff ID" });
        return;
      }

      await staffService.removeStaff(staffId);
      res.sendStatus(204);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete staff member";
      res.status(400).json({ error: message });
    }
  });

  router.get("/all", async (req: Request, res: Response) => {
    try {
      const staff = await staffService.getAllStaff();
      res.json(staff);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to get staff members";
      res.status(400).json({ error: message });
    }
  });

  return router;
};
