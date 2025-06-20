import { Router, Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { body } from "express-validator";
import { validateRequest } from "../middlewares/validate-request";
import { currentUser } from "../middlewares/current-user";

interface LoginRequestBody {
  login: string;
  password: string;
  roleType: "admin" | "staff" | "client";
}

export const authRouter = (authService: AuthService) => {
  const router = Router();

  router.post(
    "/login",
    [
      body("login").trim().notEmpty().withMessage("Login is required"),
      body("password").trim().notEmpty().withMessage("Password is required"),
      body("roleType")
        .isIn(["admin", "staff", "client"])
        .withMessage("Invalid role type"),
    ],
    validateRequest,
    async (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
      try {
        const { login, password, roleType } = req.body;
        const data = await authService.login(login, password, roleType);
        res.json(data);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Authentication failed";
        res.status(401).json({ error: errorMessage });
      }
    }
  );

  router.get("/me", (req: Request, res: Response) => {
    currentUser(req, res, async (err?: any) => {
      if (req.currentUser) {
        const userSmallInfo = req.currentUser;
        const data = await authService.refresh(userSmallInfo);
        res.json(data);
      } else {
        res.status(401).json({ error: "Unauthorized" });
      }
    });
  });

  return router;
};
