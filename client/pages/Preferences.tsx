import { useAuth0 } from '@auth0/auth0-react'
import { addUser } from '../apis/backend-apis/users'
import { User } from '../../models/users'
import { SetStateAction, useEffect, useState } from 'react'
import { Preferences as Preferencetype } from '../../models/preferences'
import { UserPreferences } from '../../models/userPreferences'
import {
  addUserPreferences,
  delUserPreferences,
} from '../apis/backend-apis/preferences'
import { useNavigate } from 'react-router-dom'
import usePreferencePage from '../hooks/usePreferencePage'
import Button from '../components/Button'

interface BtnColor {
  [key: string]: string
}

function Preferences() {
  const [btncolor, setBtnColor] = useState<BtnColor>({})
  const [userPreferences, setUserPreferences] = useState<UserPreferences[]>([])

  const { user, isAuthenticated } = useAuth0()
  const navigate = useNavigate()

  const auth = user?.sub
  const userId = auth ?? '-1'
  const {
    currentUser,
    preferences,
    userPreferences: userBasedPreference,
    isLoading,
    isError,
  } = usePreferencePage(userId)

  useEffect(() => {
    if (preferences) {
      const state: BtnColor = {}
      preferences.forEach((item) => {
        state[item.name] =
          'hover:text-buttonGreen border-buttonGreen text-buttonGreen hover:border-buttonGreen btn btn-outline w-32 shadow-none hover:bg-transparent'
      })
      setBtnColor(state)
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
    console.log(currentUser)
  }, [currentUser, isAuthenticated, preferences, user])

  if (isLoading) {
    return <p>Retrieving your data</p>
  }

  if (isError) {
    return <p>There was an error retrieving your profile</p>
  }

  function updatePreferences(pref: Preferencetype) {
    if (
      btncolor[pref.name] ===
      'hover:text-buttonGreen border-buttonGreen text-buttonGreen hover:border-buttonGreen btn btn-outline w-32 shadow-none hover:bg-transparent'
    ) {
      setUserPreferences([
        ...userPreferences,
        { user_id: user?.sub, preference_id: pref.id },
      ])
    }

    if (btncolor[pref.name] === 'shadow-lg btn btn-primary text-lightGreen') {
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
        btncolor[pref.name] ===
        'hover:text-buttonGreen border-buttonGreen text-buttonGreen hover:border-buttonGreen btn btn-outline w-32 shadow-none hover:bg-transparent'
          ? 'shadow-lg btn btn-primary text-lightGreen'
          : 'hover:text-buttonGreen border-buttonGreen text-buttonGreen hover:border-buttonGreen btn btn-outline w-32 shadow-none hover:bg-transparent',
    })
    updatePreferences(pref)
  }

  function handleSave() {
    if (userBasedPreference?.length !== 0) {
      // Delete operation
      delUserPreferences(userId)
        .then(() => {
          // After the delete operation is completed, execute the add operation
          userPreferences.forEach((item) => {
            addUserPreferences(item)
          })
        })
        .catch((error) => {
          // Handle error if the delete operation fails
          console.error('Error deleting preferences:', error)
        })
    } else {
      // If there are no preferences to delete, just execute the add operation
      userPreferences.forEach((item) => {
        addUserPreferences(item)
      })
    }
    setTimeout(() => navigate('/home/recipes'), 1500)
  }

  if (preferences) {
    const getTypes = () => {
      const arr = Array.from(new Set(preferences.map((item) => item.type)))
      return arr
    }
    const typesArr = getTypes()

    return (
      <>
        <div className="">
          <div className="flex flex-col items-center">
            <h1 className="mb-14 flex justify-center text-center text-4xl text-headingGreen sm:text-3xl md:text-5xl">
              Preferences
            </h1>
          </div>

          <div>
            <ul className="ml-10">
              {typesArr.map((item) => (
                <li key={item} className="mt-8">
                  <h3 className="mb-5 text-2xl font-semibold text-headingGreen">
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </h3>
                  <div className="container max-w-md">
                    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {preferences.map((pref) =>
                        pref.type === item ? (
                          <li key={pref.name}>
                            <button
                              onClick={() => handleClick(pref)}
                              className={`${
                                btncolor[pref.name]
                              } w-full sm:w-auto md:w-32`}
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
          <div className="mt-10 flex justify-center">
            <Button onClick={handleSave} className="w-40">
              Save
            </Button>
          </div>
        </div>
      </>
    )
  }
}

export default Preferences
