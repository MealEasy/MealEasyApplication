import { useAuth0 } from '@auth0/auth0-react'
import React, { useEffect, useRef, useState } from 'react'
import useGetUserPreference from '../hooks/useGetUserPreferences'
import useGetApiRecipes from '../hooks/useGetApiRecipes'
import RecipeDetail from './RecipeDetailCard'
import { addARecipe, getRecipeByName } from '../apis/backend-apis/recipes'
import { Recipes } from '../../models/recipes'
import { Weeks } from '../../models/weeks'
import { addWeek } from '../apis/backend-apis/weeks'
import Button from './Button'
import { useNavigate } from 'react-router-dom'

export default function RecipeCardMedium() {
  const [input, setInput] = useState('')

  function handleChange(e: { target: { value: SetStateAction<string> } }) {
    setInput(e.target.value)
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter') {
      handleFilter()
    }
  }

  const [selectedItems, setSelectedItems] = useState([])
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState(null)
  const [meals, setMeals] = useState([])
  const mealsObjArrRef = useRef()
  // const refetch = useRef(false)

  const { user } = useAuth0()
  const auth = user?.sub
  const userId = auth ?? '-1'

  const { data: userPreference } = useGetUserPreference(userId)

  const searchString = userPreference
    ?.map((pref) => `&${pref.type}=${pref.name}`)
    .join('')

  const string = searchString ?? '-1'
  console.log(string)
  const { data, isLoading, isError, refetch } = useGetApiRecipes(string)

  useEffect(() => {
    if (data) {
      // Update mealsObjArrRef.current instead of mealsObjArr
      mealsObjArrRef.current = data.hits.map((item) => {
        const obj = {}
        obj.name = item.recipe.label
        obj.image = item.recipe.images
        obj.ingredients = item.recipe.ingredientLines
        obj.url = item.recipe.url
        return obj
      })
      // Use setMeals to trigger a re-render with the updated value
      setMeals(mealsObjArrRef.current)
    }
  }, [data])

  console.log(meals)

  const navigate = useNavigate()

  function handleFilter() {
    const filteredMeals = meals.filter((meal) =>
      meal.ingredients.find((item) => item.split(' ').includes(input)),
    )

    setMeals(filteredMeals)
    setInput('')
  }

  function handleClear() {
    setInput('')
    setMeals(mealsObjArrRef.current)
  }

  function handleRefetch() {
    refetch()
  }

  async function handleSave(meals) {
    const mealsArr = selectedItems.map((index) => meals[index])
    const weekObj: Weeks = {
      user_id: userId,

      created_on: Date.now(),
    }

    const week = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ]

    await Promise.all(
      mealsArr.map(async (meal) => {
        const arr = await getRecipeByName(meal.name)

        if (arr.length === 0) {
          const obj: Recipes = { name: '', ingredients: '', image: '', url: '' }
          obj.name = meal.name
          obj.image = meal.image.LARGE.url
          obj.ingredients = meal.ingredients.join('_')
          obj.url = meal.url
          await addARecipe(obj)
        }
      }),
    )

    // After all recipes are added, log the results
    await Promise.all(
      mealsArr.map(async (meal, i) => {
        const arr = await getRecipeByName(meal.name)
        console.log(arr)
        const id = arr[0].id
        weekObj[week[i]] = id
      }),
    )

    await addWeek(weekObj)
    navigate('/home')
  }

  if (isLoading) {
    return <p>is Loading ...</p>
  }

  if (isError) {
    return <p>An Error has occurred. </p>
  }

  // if (data) {
  //   const meals = data.hits.map((item) => {
  //     const obj = {}
  //     obj.name = item.recipe.label
  //     obj.image = item.recipe.images

  //     obj.ingredients = item.recipe.ingredientLines
  //     return obj
  //   })

  const handleShowRecipeDetail = (index) => {
    setSelectedRecipeIndex(index)
  }
  const handleToggleSelection = (index) => {
    if (selectedItems.length >= 7 && !isMealSelected(index)) {
      return
    }

    const selectedIndex = selectedItems.indexOf(index)
    if (selectedIndex === -1) {
      setSelectedItems([...selectedItems, index])
    } else {
      const updatedSelection = [...selectedItems]
      updatedSelection.splice(selectedIndex, 1)
      setSelectedItems(updatedSelection)
    }
  }

  const isMealSelected = (index) => selectedItems.includes(index)
  const isSelectionFull = selectedItems.length >= 7

  const handleDetailClick = () => {
    setSelectedRecipeIndex(null) // closing detail view when detail is clicked
  }
  if (meals) {
    return (
      <>
        <div className="relative flex flex-col items-center justify-center">
          <div className="mb-5 flex justify-center text-5xl">
            <h2 className="text-headingGreen">Pick Your Meals</h2>
          </div>
          <div className="mb-10 mt-2 flex justify-center">
            <h3>Choose up to seven meals</h3>
          </div>

          <label className=" mb-5 flex items-center gap-2">
            <input
              onChange={handleChange}


              onKeyDown={handleKeyPress}

              className="mt-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 focus:border-buttonGreen focus:outline-none"
              placeholder="Search"
              value={input}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-4 w-4 cursor-pointer opacity-70"
              onClick={() => handleFilter()}
            >
              <path
                fillRule="evenodd"
                d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                clipRule="evenodd"
              />
            </svg>
          </label>
          <div className="flex flex-col md:flex-row md:items-start md:justify-start">
            {/* Filter button  */}
            {/* <Button
              className="mb-12 md:mb-0 md:mr-4"
              onClick={() => handleFilter()}
            >
              Filter
            </Button> */}
            {/* clear button */}
            <Button
              className="mb-12 md:mb-0 md:mr-4"
              onClick={() => handleClear()}
            >
              Clear Search
            </Button>

            {/* Save button */}
            <Button className="mb-12" onClick={() => handleSave(meals)}>
              Save and See Your Week Plan
            </Button>
          </div>

          <div className="flex flex-wrap justify-center">
            {meals.map((meal, index) => (
              <div key={index} className="m-4 w-96">
                <div
                  className={`card card-compact relative h-64 cursor-pointer ${
                    isMealSelected(index)
                      ? 'border-2 border-buttonGreen '
                      : 'border-transparent'
                  } bg-white shadow-sm hover:shadow-md hover:shadow-buttonGreen ${isSelectionFull && !isMealSelected(index) ? 'opacity-50 hover:shadow-transparent' : ''}`}
                >
                  <figure onClick={() => handleShowRecipeDetail(index)}>
                    <img
                      className="ml-3 mt-3 h-40 w-64 rounded"
                      src={meal.image.REGULAR.url}
                      alt={meal.name}
                    />
                  </figure>
                  <div
                    className="card-body"
                    onClick={() => handleShowRecipeDetail(index)}
                  >
                    <h2 className="card-title">{meal.name}</h2>
                  </div>
                  <div className="absolute right-2 top-2">
                    <div className="form-control">
                      <label className="label cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isMealSelected(index)}
                          onChange={() => handleToggleSelection(index)}
                          className="checkbox-primary checkbox"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* refetch button */}
          </div>
          <Button
            className="mb-12 md:mb-0 md:mr-4"
            onClick={() => handleRefetch()}
          >
            More Recipes
          </Button>
          {isSelectionFull && (
            <div className="fixed left-0 top-0 w-full bg-buttonGreen py-2 text-center text-white opacity-90">
              You have selected seven meals. You cannot select more.
            </div>
          )}
          {selectedRecipeIndex !== null && (
            <div
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-65"
              onClick={handleDetailClick}
            >
              <div className="z-10">
                <RecipeDetail
                  imageUrl={meals[selectedRecipeIndex].image.REGULAR.url}
                  recipeName={meals[selectedRecipeIndex].name}
                  ingredients={meals[selectedRecipeIndex].ingredients}
                />
              </div>
            </div>
          )}
        </div>
      </>
    )
  }
}
