import { useAuth0 } from '@auth0/auth0-react'
import { addUser } from '../apis/backend-apis/users'
import { User } from '../../models/users'
import useGetPreferences from '../hooks/useGetPreferences'
import { useEffect, useState } from 'react'
import { Preferences as Preferencetype } from '../../models/preferences'
import { UserPreferences } from '../../models/userPreferences'
import useGetUserById from '../hooks/useGetUserById'
import { addUserPreferences } from '../apis/backend-apis/preferences'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'

interface BtnColor {
  [key: string]: string
}

function Preferences() {
  const { user, isAuthenticated } = useAuth0()
  const { data: preferences, isLoading, isError } = useGetPreferences()
  const [btncolor, setBtnColor] = useState<BtnColor>({})
  const [userPreferences, setUserPreferences] = useState<UserPreferences[]>([])
  const navigate = useNavigate()

  const auth = user?.sub
  const userId = auth ?? '-1'

  const { data: currentUser } = useGetUserById(userId)

  useEffect(() => {
    if (preferences) {
      const state: BtnColor = {}
      preferences.forEach((item) => {
        state[item.name] = 'bg-yellow-500'
      })
      setBtnColor(state)
    }
  }, [preferences])

  if (isLoading) {
    return <p>Retreiving your data</p>
  }

  if (isError) {
    return <p>There was an error retrieving your profile</p>
  }

  if (isAuthenticated && user) {
    const newUser: User = {
      auth0_id: user?.sub,
      email: user?.email,
      first_name: user?.given_name,
      last_name: user?.family_name,
      nickname: user?.nickname,
    }

    addUser(newUser)
  }

  function updatePreferences(pref: Preferencetype) {
    if (btncolor[pref.name] === 'bg-yellow-500') {
      setUserPreferences([
        ...userPreferences,
        { user_id: user?.sub, preference_id: pref.id },
      ])
    }

    if (btncolor[pref.name] === 'bg-green-600') {
      const arr = userPreferences.filter(
        (item) => item.preference_id !== pref.id,
      )
      setUserPreferences(arr)
    }
  }

  function handleClick(pref: Preferencetype) {
    setBtnColor({
      ...btncolor,
      [pref.name]:
        btncolor[pref.name] === 'bg-yellow-500'
          ? 'bg-green-600'
          : 'bg-yellow-500',
    })
    updatePreferences(pref)
  }

  function handleSave() {
    userPreferences.forEach((item) => {
      addUserPreferences(item)
    })

    navigate('/home/recipes')
  }

  if (preferences) {
    const getTypes = () => {
      const arr = Array.from(new Set(preferences.map((item) => item.type)))
      return arr
    }
    const typesArr = getTypes()

    return (
      <>
        <div className="mt-5">
          <div className="flex justify-center text-4xl">
            <h2 className="text-headingGreen">Pick Your Meals</h2>

            <Button
              onClick={handleSave}
              className="fixed right-20 top-20 rounded-lg border-none bg-green-600 px-4 py-1 font-bold"
            >
              Save
            </Button>
          </div>

          <ul className="ml-10">
            {typesArr.map((item) => (
              <li key={item}>
                <h3 className="mb-3 mt-5 text-xl">
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </h3>
                <div className="container max-w-md">
                  <ul className="ml-5 grid grid-cols-3 gap-4">
                    {preferences.map((pref) =>
                      pref.type === item ? (
                        <li key={pref.name} className="mb-2">
                          <button
                            onClick={() => handleClick(pref)}
                            className={`w-full rounded-lg border-none ${btncolor[pref.name]} px-4 py-1 font-bold`}
                          >
                            {pref.name.charAt(0).toUpperCase() +
                              pref.name.slice(1)}
                          </button>
                        </li>
                      ) : null,
                    )}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </>
    )
  }
}

export default Preferences
