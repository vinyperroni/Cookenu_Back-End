import { BaseDatabase } from "./BaseDatabase";
import { User } from "../entities/User";

export class UserDatabase extends BaseDatabase {
  public async insert(user: User): Promise<void> {
    try {
      await BaseDatabase.connection("cookenu_user").insert(user);
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }

  public async getByEmail(email: string): Promise<User | null> {
    try {
      const data = await BaseDatabase.connection
        .select("*")
        .from("cookenu_user")
        .where("email", email);

      const user = User.toUserModel(data[0]);
      return user;
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }

  public async getById(id: string): Promise<User | null> {
    try {
      const data = await BaseDatabase.connection
        .select("*")
        .from("cookenu_user")
        .where("id", id);

      const user = User.toUserModel(data[0]);
      return user;
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }

  public async insertFollow(
    followerId: string,
    followingId: string
  ): Promise<void> {
    try {
      await BaseDatabase.connection("cookenu_follower").insert({
        follower_id: followerId,
        following_id: followingId,
      });
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }

  public async deleteFollow(
    followerId: string,
    followingId: string
  ): Promise<void> {
    try {
      await BaseDatabase.connection("cookenu_follower")
        .delete()
        .where({ follower_id: followerId })
        .andWhere({ following_id: followingId });
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }

  public async selectFeed(id: string): Promise<any> {
    try {
      const recipes = await BaseDatabase.connection
        .select("cookenu_recipe.*", "cookenu_user.name")
        .from("cookenu_follower")
        .innerJoin(
          "cookenu_user",
          "cookenu_follower.following_id",
          "cookenu_user.id"
        )
        .innerJoin(
          "cookenu_recipe",
          "cookenu_follower.following_id",
          "cookenu_recipe.creator_id"
        )
        .where({ "cookenu_follower.follower_id": `${id}` });

      return recipes;
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }

  public async delete(id: string) {
    try {
      await BaseDatabase.connection
        .delete()
        .from("cookenu_follower")
        .where({ follower_id: id })
        .orWhere({ following_id: id });
      await BaseDatabase.connection
        .delete()
        .from("cookenu_recipe")
        .where({ creator_id: id });
      await BaseDatabase.connection
        .delete()
        .from("cookenu_user")
        .where({ id: id });
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }
}
