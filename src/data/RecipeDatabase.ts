import { BaseDatabase } from "./BaseDatabase";
import { Recipe } from "../entities/Recipe";

export class RecipeDatabase extends BaseDatabase {
  public async insert(data: Recipe): Promise<void> {
    try {
      const recipe = {
        id: data.getId(),
        creator_id: data.getCreatorId(),
        title: data.getTitle(),
        description: data.getDescription(),
        created_at: data.getCreatedAt(),
      };
      await BaseDatabase.connection("cookenu_recipe").insert(recipe);
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }
  public async getById(id: string): Promise<Recipe | null> {
    try {
      const data = await BaseDatabase.connection
        .select("*")
        .from("cookenu_recipe")
        .where("id", id);

      const recipe = Recipe.toRecipeModel(data[0]);
      return recipe;
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }

  public async getByCreatorId(creatorId: string): Promise<Recipe | null> {
    try {
      const data = await BaseDatabase.connection
        .select("*")
        .from("cookenu_recipe")
        .where("creator_id", creatorId);

      const recipe = Recipe.toRecipeModel(data[0]);
      return recipe;
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }

  public async update(id: string, recipe: Recipe): Promise<void> {
    try {
      await BaseDatabase.connection("cookenu_recipe")
        .update({
          title: recipe.getTitle(),
          description: recipe.getDescription(),
        })
        .where(`id`, `${recipe.getId()}`)
        .andWhere(`creator_id`, `${id}`);
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }

  public async delete(recipeId: string): Promise<void> {
    try {
      await BaseDatabase.connection("cookenu_recipe")
        .delete()
        .where(`id`, `${recipeId}`);
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }
}
