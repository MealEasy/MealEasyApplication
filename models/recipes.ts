export interface Recipes {
  name: string
  image: string
  ingredients: string
  url: string
}

export interface RecipeId extends Recipes {
  id: number
}
