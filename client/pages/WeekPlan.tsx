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
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [weekId, setweekId] = useState(2)
  const [weekPlan, setweekPlan] = useState([])
  // const [shopping, setShopping] = useState(1)
  const { user } = useAuth0()
  const auth = user?.sub
  // const userId = auth ?? '-1'

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

  function renderRecipe(id: number) {
    setweekId(id)
    setIsDropdownOpen(false)
    setShopping(id)
  }

  // Add user
  // const { user } = useAuth0()
  // const auth = user?.sub
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
    <div>
      <div className="relative flex flex-col items-center justify-center">
        <h1 className="mb-14 flex justify-center text-5xl text-headingGreen">
          Your week
        </h1>
        <Link to="recipes">
          <Button>Make a New Plan</Button>
        </Link>
      </div>
      <div className="dropdown relative flex">
        <div onClick={toggleDropdown} className="mt-5">
          <button className="btn bg-transparent text-buttonGreen hover:bg-buttonGreen hover:text-white focus:bg-buttonGreen focus:text-white">
            Select your week
          </button>
        </div>
        {isDropdownOpen && (
          <ul
            tabIndex={0}
            className=" right-100 menu dropdown-content menu-md absolute z-[2] mt-3 w-52 rounded-box bg-base-100 p-2 font-bold text-buttonGreen shadow"
          >
            {weeksArr.map((week, index) => (
              <>
                <li
                  key={week}
                  className="hover:rounded-lg hover:bg-buttonGreen hover:text-white"
                >
                  <button
                    onClick={() => renderRecipe(week)}
                    className="focus:text-white"
                  >{`Week ${index + 1}`}</button>
                </li>
              </>
            ))}
          </ul>
        )}

        <Link to={`shopping/${weekId}`}>
          <Button className="ml-20 mt-5">Shopping List</Button>
        </Link>
      </div>

      <div className="mb-20 flex">
        <div>
          <div className="ml-12 flex flex-col items-start">
            {daysOfWeek.map((day, index) => (
              <div key={index} className="mt-5 h-32">
                <h2 className="mb-1 text-xl font-semibold text-headingGreen">
                  {day}
                </h2>

                <div
                  className="hover:po card card-side h-24 w-96 cursor-pointer bg-white shadow-sm hover:shadow-md hover:shadow-buttonGreen"
                  draggable
                  onDragStart={(e) => handleDragStart(e, day)}
                  onDrop={(e) => handleDrop(e, day, week)}
                  onDragOver={handleDragOver}
                  onClick={() => handleRecipeClick(index)}
                >
                  <div className="m-auto flex">
                    <h2 className="card-title text-lg font-semibold">
                      {recipes[index]?.name || 'No Recipe'}
                    </h2>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="ml-40 mt-12">
          {selectedRecipeIndex !== null &&
            recipes[selectedRecipeIndex] !== null && (
              // <RecipeDetail
              //   imageUrl={recipes[selectedRecipeIndex]?.image}
              //   recipeName={recipes[selectedRecipeIndex]?.name}
              //   ingredients={recipes[selectedRecipeIndex]?.ingredients.split(
              //     '_',
              //   )}
              // />
              <iframe
                title="recipe-window"
                width="700"
                height="1000"
                src={recipes[selectedRecipeIndex]?.url}
              ></iframe>
            )}
        </div>
      </div>
    </div>
  )
}
