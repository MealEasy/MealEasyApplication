import { useParams } from 'react-router-dom'
import useGetWeekById from '../hooks/useGetWeeks'
import { useEffect, useState } from 'react'
import { getRecipeById } from '../apis/backend-apis/recipes'

function ShoppingList() {
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [days, setDays] = useState([])
  const [recipes, setRecipes] = useState([])

  const { id } = useParams()

  const { data: week, isLoading, isError } = useGetWeekById(id)
  useEffect(() => {
    if (week) {
      const arr = [
        week.monday,
        week.tuesday,
        week.wednesday,
        week.thursday,
        week.friday,
        week.saturday,
        week.sunday,
      ]

      setDays(arr)
    }
  }, [week])

  useEffect(() => {
    const getRecipes = async () => {
      try {
        const promises = Object.values(days).map((item) => getRecipeById(item))
        const recipes = await Promise.all(promises)
        setRecipes(recipes)
      } catch (error) {
        console.error('Error fetching recipes')
      }
    }
    getRecipes()
  }, [days])

  if (isLoading) {
    return <p>Making your shopping list</p>
  }

  if (isError) {
    return <p>There was an error with your shopping list</p>
  }

  if (week) {
    return (
      console.log('week', week),
      console.log(days),
      console.log('recipes', recipes),
      (
        <>
          <div className="relative flex flex-col items-center justify-center">
            <h1 className="mb-14 flex justify-center text-center text-4xl text-headingGreen sm:text-3xl md:text-5xl">
              Your Shopping List
            </h1>
          </div>
          <div className="flex w-full justify-center">
            <ul>
              {recipes
                .filter((item) => item !== null)
                .map((item, index) => (
                  <ul key={index} className="list-disc">
                    {item.ingredients.split('_').map((item, index) => (
                      <li key={index} className="mt-3">
                        {item}
                      </li>
                    ))}
                  </ul>
                ))}
            </ul>
          </div>
        </>
      )
    )
  }
}

export default ShoppingList
