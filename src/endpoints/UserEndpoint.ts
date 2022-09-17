import { Request, Response } from "express";
import { UserDatabase } from "../data/UserDatabase";
import { PublicDataUser, User } from "../entities/User";
import { Authenticator } from "../services/Authenticator";
import { HashManager } from "../services/HashManager";
import { IdGenerator } from "../services/IdGenerator";
import { UserRole } from "../entities/User";
import moment from "moment";

export class UserEndPoint {
  async signUp(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password || !role) {
        res.statusCode = 404;
        throw new Error("Missing parameters");
      }

      if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string"
      ) {
        res.statusCode = 422;
        throw new Error("Check the type of parameters");
      }

      if (password.length < 6) {
        res.statusCode = 422;
        throw new Error("Password must be 6 or more characteres");
      }

      const userDatabase = new UserDatabase();

      const user = await userDatabase.getByEmail(email);

      if (user) {
        res.statusCode = 409;
        throw new Error("E-mail already registered");
      }

      const idGenerator = new IdGenerator();
      const id = idGenerator.generateId();

      const hashManager = new HashManager();
      const hashPassword = await hashManager.hash(password);

      const newUser = new User(id, name, email, hashPassword, role);

      await userDatabase.insert(newUser);
      const authenticator = new Authenticator();

      const token = authenticator.generateToken({ id, role });

      res.status(201).send({ access_token: token });
    } catch (error: any) {
      res.send({ message: error.sqlMessage || error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.statusCode = 404;
        throw new Error("Missing parameters");
      }

      if (typeof email !== "string" || typeof password !== "string") {
        res.statusCode = 422;
        throw new Error("Check the type of parameters");
      }

      if (password.length < 6) {
        res.statusCode = 422;
        throw new Error("Password must be 6 or more characteres");
      }

      const userDatabase = new UserDatabase();

      const user = await userDatabase.getByEmail(email);

      if (!user) {
        res.statusCode = 409;
        throw new Error("E-mail not registered");
      }

      const hashManager = new HashManager();

      const isValid = await hashManager.compare(password, user.getPassword());

      if (!isValid) {
        res.statusCode = 401;
        throw new Error("Invalid Password");
      }

      const authenticator = new Authenticator();

      const token = authenticator.generateToken({
        id: user.getId(),
        role: user.getRole(),
      });

      res.status(200).send({ access_token: token });
    } catch (error: any) {
      res.send({ message: error.sqlMessage || error.message });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const token = req.headers.authorization;

      if (!token) {
        res.statusCode = 404;
        throw new Error("Missing parameters: token");
      }

      const authenticator = new Authenticator();

      const tokenData = authenticator.getTokenData(token);

      if (!tokenData.id || tokenData.id === "") {
        res.statusCode = 401;
        throw new Error("Invalid token");
      }

      const userDatabase = new UserDatabase();

      let data: User | null = await userDatabase.getById(tokenData.id);

      if (!data) {
        res.statusCode = 409;
        throw new Error("User not found");
      }

      const user: PublicDataUser = data.toPublicModel();

      res.status(200).send(user);
    } catch (error: any) {
      res.send({ message: error.sqlMessage || error.message });
    }
  }

  async getAnotherProfile(req: Request, res: Response) {
    try {
      const id = req.params.id;

      if (!id || id === ":id") {
        res.statusCode = 404;
        throw new Error("Missing parameters: id");
      }

      const token = req.headers.authorization;

      if (!token) {
        res.statusCode = 404;
        throw new Error("Missing parameters: token");
      }

      const authenticator = new Authenticator();

      const tokenData = authenticator.getTokenData(token);

      if (!tokenData.id || tokenData.id === "") {
        res.statusCode = 401;
        throw new Error("Invalid token");
      }

      const userDatabase = new UserDatabase();

      let data: User | null = await userDatabase.getById(id);

      if (!data) {
        res.statusCode = 409;
        throw new Error("User not found");
      }

      const user: PublicDataUser = data.toPublicModel();

      res.status(200).send(user);
    } catch (error: any) {
      res.send({ message: error.sqlMessage || error.message });
    }
  }

  async follow(req: Request, res: Response) {
    try {
      const token = req.headers.authorization;

      if (!token) {
        res.statusCode = 404;
        throw new Error("Missing parameters: token");
      }

      const authenticator = new Authenticator();

      const tokenData = authenticator.getTokenData(token);

      if (!tokenData.id || tokenData.id === "") {
        res.statusCode = 401;
        throw new Error("Invalid token");
      }

      const userToFollowId = req.body.userToFollowId;

      if (!userToFollowId) {
        res.statusCode = 404;
        throw new Error("Missing parameters: userToFollowId");
      }

      const userDatabase = new UserDatabase();
      const userToFollow = await userDatabase.getById(userToFollowId);

      if (!userToFollow) {
        res.statusCode = 404;
        throw new Error("User not found");
      }

      await userDatabase.insertFollow(tokenData.id, userToFollowId);

      res.status(200).send({ message: "Followed successfully" });
    } catch (error: any) {
      res.send({ message: error.sqlMessage || error.message });
    }
  }

  async unfollow(req: Request, res: Response) {
    try {
      const token = req.headers.authorization;

      if (!token) {
        res.statusCode = 404;
        throw new Error("Missing parameters: token");
      }

      const authenticator = new Authenticator();

      const tokenData = authenticator.getTokenData(token);

      if (!tokenData.id || tokenData.id === "") {
        res.statusCode = 401;
        throw new Error("Invalid token");
      }

      const userToUnfollowId = req.body.userToUnfollowId;

      if (!userToUnfollowId) {
        res.statusCode = 404;
        throw new Error("Missing parameters: userToUnfollowId");
      }

      const userDatabase = new UserDatabase();
      const userToFollow = await userDatabase.getById(userToUnfollowId);

      if (!userToFollow) {
        res.statusCode = 404;
        throw new Error("User not found");
      }

      await userDatabase.deleteFollow(tokenData.id, userToUnfollowId);

      res.status(200).send({ message: "Unfollowed successfully" });
    } catch (error: any) {
      res.send({ message: error.sqlMessage || error.message });
    }
  }

  async feed(req: Request, res: Response) {
    try {
      const token = req.headers.authorization as string;

      const authenticator = new Authenticator();

      const tokenData = authenticator.getTokenData(token);

      if (!tokenData.id || tokenData.id === "") {
        res.statusCode = 401;
        throw new Error("Invalid token");
      }

      const userDatabase = new UserDatabase();

      const searchFeed = await userDatabase.selectFeed(tokenData.id);

      const recipes: any[] = searchFeed.map((recipe: any) => {
        return {
          id: recipe.id,
          title: recipe.title,
          description: recipe.description,
          createdAt: moment(recipe.created_at, "YYYY-MM-DD").format(
            "DD/MM/YYYY"
          ),
          userId: recipe.creator_id,
          userName: recipe.name,
        };
      });

      res.status(200).send(recipes);
    } catch (error: any) {
      res.status(error.statusCode || 500).send({ message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const token = req.headers.authorization as string;

      const authenticator = new Authenticator();

      const tokenData = authenticator.getTokenData(token);

      if (!tokenData.id || tokenData.id === "") {
        res.statusCode = 401;
        throw new Error("Invalid token");
      }

      if (tokenData.role !== UserRole.ADMIN) {
        res.statusCode = 401;
        throw new Error("Only admins can delete users");
      }

      const id = req.params.id;

      if (!id || id === ":id") {
        res.statusCode = 404;
        throw new Error("Missing parameters: id");
      }

      const userDatabase = new UserDatabase();

      const user = await userDatabase.getById(id);

      if (!user) {
        res.statusCode = 404;
        throw new Error("User not found");
      }

      await userDatabase.delete(id);

      res.status(200).send({ message: "User deleted" });
    } catch (error: any) {
      res.send({ message: error.sqlMessage || error.message });
    }
  }
}
