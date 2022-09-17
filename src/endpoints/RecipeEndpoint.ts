import { Request, Response } from "express";
import { RecipeDatabase } from "../data/RecipeDatabase";
import { Recipe } from "../entities/Recipe";
import { Authenticator } from "../services/Authenticator";
import { IdGenerator } from "../services/IdGenerator";
import { UserRole } from "../entities/User";

export class RecipeEndpoint {
  async create(req: Request, res: Response) {
    try {
      const recipeDatabase = new RecipeDatabase();

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

      const { title, description } = req.body;

      if (!title || !description) {
        res.statusCode = 404;
        throw new Error("Missing parameters");
      }

      const date: Date = new Date();

      const idGenerator = new IdGenerator();
      const id = idGenerator.generateId();

      const recipe = new Recipe(id, tokenData.id, title, description, date);

      await recipeDatabase.insert(recipe);

      res.status(201).end();
    } catch (error: any) {
      res.send({ message: error.sqlMessage || error.message });
    }
  }

  public async getRecipe(req: Request, res: Response) {
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

      const recipeDatabase = new RecipeDatabase();

      const data = await recipeDatabase.getById(id);

      if (!data) {
        res.statusCode = 404;
        throw new Error("Recipe not found");
      }

      console.log(data);

      const recipe = data.toPublicModel();

      res.status(200).send(recipe);
    } catch (error: any) {
      res.send({ message: error.sqlMessage || error.message });
    }
  }

  public async editRecipe(req: Request, res: Response) {
    try {
      const recipeDatabase = new RecipeDatabase();

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

      const idRecipe = req.params.id;

      if (!idRecipe || idRecipe === ":id") {
        res.statusCode = 404;
        throw new Error("Missing parameters: RecipeID");
      }

      const recipe = await recipeDatabase.getById(idRecipe);

      if (!recipe) {
        res.statusCode = 404;
        throw new Error("Recipe not found");
      }

      const { title, description } = req.body;

      if (!title || !description) {
        res.statusCode = 404;
        throw new Error("Missing parameters");
      }

      const newRecipe = new Recipe(
        recipe.getId(),
        recipe.getCreatorId(),
        title,
        description,
        recipe.getCreatedAt()
      );

      if (tokenData.id !== newRecipe.getCreatorId()) {
        res.statusCode = 401;
        throw new Error("Only the creator can update the recipe");
      }

      await recipeDatabase.update(tokenData.id, newRecipe);

      res.status(200).send({ message: "Recipe updated" });
    } catch (error: any) {
      res.send({ message: error.sqlMessage || error.message });
    }
  }

  public async deleteRecipe(req: Request, res: Response) {
    try {
      const recipeDatabase = new RecipeDatabase();

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

      const idRecipe = req.params.id;

      if (!idRecipe || idRecipe === ":id") {
        res.statusCode = 404;
        throw new Error("Missing parameters: RecipeID");
      }

      const recipe = await recipeDatabase.getById(idRecipe);

      if (!recipe) {
        res.statusCode = 404;
        throw new Error("Recipe not found");
      }

      if (tokenData.id !== recipe.getCreatorId()) {
        console.log(tokenData.role);

        if (tokenData.role === UserRole.ADMIN) {
          console.log("Access garanted, Admin user!");
        } else if (tokenData.role === UserRole.NORMAL) {
          res.statusCode = 401;
          throw new Error("Only the creator can delete the recipe");
        } else {
          res.statusCode = 401;
          throw new Error("Access denied");
        }
      }

      await recipeDatabase.delete(recipe.getId());

      res.status(200).send({ message: "Recipe deleted" });
    } catch (error: any) {
      res.send({ message: error.sqlMessage || error.message });
    }
  }
}
