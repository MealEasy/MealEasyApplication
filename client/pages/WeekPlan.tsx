import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import RecipeDetail from '../components/RecipeDetailCard'
import Button from '../components/Button'
import useGetUserById from '../hooks/useGetUserById'
import { useAuth0 } from '@auth0/auth0-react'
import { addUser } from '../apis/backend-apis/users'
import useGetWeekById from '../hooks/useGetWeeks'
import { getRecipeById } from '../apis/backend-apis/recipes'
import useGetWeeksByUser from '../hooks/useGetWeeksByUsers'
import { updateWeek } from '../apis/backend-apis/weeks'

export default function WeekPlan() {
  const initialDaysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]

  const [daysOfWeek, setDaysOfWeek] = useState(initialDaysOfWeek)
  const [mealPlan, setMealPlan] = useState({})
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState(null)
  const [recipes, setRecipes] = useState([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [weekId, setweekId] = useState(2)
  const [weekPlan, setweekPlan] = useState([])
  const { user } = useAuth0()
  const auth = user?.sub

  const weeksArr = weekPlan?.map((item) => item.id)
  const { data: week } = useGetWeekById(weekId)
  const { data: userWeeks } = useGetWeeksByUser(auth)

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

      setMealPlan(
        arr.reduce((acc, meal, index) => {
          acc[initialDaysOfWeek[index]] = meal
          return acc
        }, {}),
      )
    }

    if (userWeeks) {
      setweekPlan(userWeeks)
    }
  }, [week, userWeeks])

  useEffect(() => {
    const arr = userWeeks?.map((item) => item.id)
    setweekId(arr?.at(-1))
  }, [userWeeks])

  useEffect(() => {
    const getRecipes = async () => {
      try {
        const promises = Object.values(mealPlan).map((item) =>
          getRecipeById(item),
        )
        const recipes = await Promise.all(promises)
        setRecipes(recipes)
      } catch (error) {
        console.error('Error fetching recipes')
      }
    }
    getRecipes()
  }, [mealPlan])

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleRecipeClick = (index) => {
    setSelectedRecipeIndex(index)
  }

  const handleDragStart = (e, day) => {
    e.dataTransfer.setData('text/plain', day)
  }

  const handleDrop = (e, targetDay, week) => {
    e.preventDefault()
    const draggedDay = e.dataTransfer.getData('text/plain')
    if (draggedDay !== targetDay) {
      const updatedMealPlan = { ...mealPlan }
      const temp = updatedMealPlan[targetDay]
      updatedMealPlan[targetDay] = updatedMealPlan[draggedDay]
      updatedMealPlan[draggedDay] = temp
      setMealPlan(updatedMealPlan)

      const updatedWeekPlan = { ...updatedMealPlan, id: week.id }
      updateWeek(updatedWeekPlan)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  function renderRecipe(id) {
    setweekId(id)
    setIsDropdownOpen(false)
    setShopping(id)
  }

  const { data, isLoading, isError } = useGetUserById(auth)

  useEffect(() => {
    if (!data && !isLoading && !isError) {
      const newUser = {
        auth0_id: user?.sub,
        email: user?.email,
        first_name: user?.given_name,
        last_name: user?.family_name,
        nickname: user?.nickname,
      }
      addUser(newUser)
    }
  }, [data, isError, isLoading, user])

  if (isLoading) {
    return <p>Waiting on user details...</p>
  }
  if (isError) {
    console.error('Error with user')
    return null // or handle error UI
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <h1 className="my-14 text-5xl text-headingGreen">Your week</h1>
        <Link to="recipes">
          <Button>Make a New Plan</Button>
        </Link>
      </div>
      <div className="dropdown relative">
        <div onClick={toggleDropdown} className="mt-5">
          <button className="btn bg-transparent text-buttonGreen hover:bg-buttonGreen hover:text-white focus:bg-buttonGreen focus:text-white">
            Select your week
          </button>
        </div>
        {/* Dropdown menu */}
        {isDropdownOpen && (
          <ul className="dropdown-menu">
            {/* Dropdown items */}
            {weeksArr.map((week, index) => (
              <li key={week}>
                <button
                  onClick={() => renderRecipe(week)}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-200 focus:bg-gray-200"
                >{`Week ${index + 1}`}</button>
              </li>
            ))}
          </ul>
        )}
        {/* Shopping list button */}
        <Link to={`shopping/${weekId}`}>
          <Button className="ml-20 mt-5">Shopping List</Button>
        </Link>
      </div>
      <div className="mb-20 flex">
        {/* Days column */}
        <div className="ml-12 flex flex-col">
          {daysOfWeek.map((day, index) => (
            <div key={index} className="mt-5">
              {/* Day label */}
              <h2 className="mb-1 text-xl font-semibold text-headingGreen">
                {day}
              </h2>
              {/* Recipe card */}
              <div
                className="hover:po card card-side h-24 w-96 cursor-pointer bg-white shadow-sm hover:shadow-md hover:shadow-buttonGreen"
                draggable
                onDragStart={(e) => handleDragStart(e, day)}
                onDrop={(e) => handleDrop(e, day, week)}
                onDragOver={handleDragOver}
                onClick={() => handleRecipeClick(index)}
              >
                <div className="m-auto">
                  <h2 className="card-title text-lg font-semibold">
                    {recipes[index]?.name || 'No Recipe'}
                  </h2>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Recipe detail */}
        <div className="ml-40 mt-12">
          {selectedRecipeIndex !== null &&
            recipes[selectedRecipeIndex] !== null && (
              <RecipeDetail
                imageUrl={recipes[selectedRecipeIndex]?.image}
                recipeName={recipes[selectedRecipeIndex]?.name}
                ingredients={recipes[selectedRecipeIndex]?.ingredients.split(
                  '_',
                )}
              />
            )}
        </div>
      </div>
    </div>
  )
}
