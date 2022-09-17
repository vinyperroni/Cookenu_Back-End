import moment from "moment";

export interface PublicDataRecipe {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export class Recipe {
  constructor(
    private id: string,
    private creatorId: string,
    private title: string,
    private description: string,
    private createdAt: Date
  ) {}

  static toRecipeModel(data: any): Recipe | null {
    if (data) {
      return new Recipe(
        data.id,
        data.creator_id,
        data.title,
        data.description,
        data.created_at
      );
    } else {
      return null;
    }
  }

  public toPublicModel(): PublicDataRecipe {
    const recipe: PublicDataRecipe = {
      id: this.id,
      title: this.title,
      description: this.description,
      createdAt: moment(this.createdAt, "YYYY-MM-DD").format("DD/MM/YYYY"),
    };
    return recipe;
  }

  public getId() {
    return this.id;
  }
  public getCreatorId() {
    return this.creatorId;
  }
  public getTitle() {
    return this.title;
  }
  public getDescription() {
    return this.description;
  }
  public getCreatedAt() {
    return this.createdAt;
  }
}
