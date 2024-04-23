import { useAuth0 } from '@auth0/auth0-react'
import { Link } from 'react-router-dom'
import useGetUserById from '../hooks/useGetUserById'
import LogoutButton from '../components/Logout'
import Button from '../components/Button'
import useGetUserPreference from '../hooks/useGetUserPreferences'

function Profile() {
  const { user } = useAuth0()

  const auth = user?.sub
  const userId = auth ?? '-1'

  const { data, isLoading, isError } = useGetUserById(userId)
  const { data: preferences } = useGetUserPreference(userId)

  const getTypes = () => {
    const arr = Array.from(new Set(preferences?.map((item) => item.type)))
    return arr
  }

  const typesArr = getTypes()

  // const getNames = () => {
  //   const arr = Array.from(new Set(preferences?.map((item) => item.name)))
  //   return arr
  // }
  // const namesArr = getNames()

  // console.log(namesArr)

  if (isLoading) {
    return <p>is Loading ...</p>
  }

  if (isError) {
    return <p>An Error has occurred. </p>
  }

  if (data)
    return (
      <div>
        <h1 className="mb-14 flex justify-center text-center text-4xl text-headingGreen sm:text-3xl md:text-5xl">
          Welcome {data.nickname}
        </h1>

        <div className="mt-5">
          <h2 className="mb-5 ml-10 text-2xl font-semibold text-headingGreen">
            My Personal Details
          </h2>

          <div className="mb-2 ml-20">
            <div className="flex">
              <p className="mb-2 text-headingGreen">
                <strong>Nickname:</strong>
              </p>
              <p className="ml-3">{data.nickname}</p>
            </div>
            <div className="flex">
              <p className="mb-2 text-headingGreen">
                <strong>First name:</strong>
              </p>
              <p className="ml-3">{data.first_name}</p>
            </div>
            <div className="flex">
              <p className="mb-2 text-headingGreen">
                <strong>Last name:</strong>
              </p>
              <p className="ml-3">{data.last_name}</p>
            </div>
            <div className="flex">
              <p className="mb-2 text-headingGreen">
                <strong>Email:</strong>
              </p>
              <p className="ml-3">{data.email}</p>
            </div>
          </div>
          <Button className="ml-10">
            <Link to="edit">Edit Profile</Link>
          </Button>
          <LogoutButton>Log Out</LogoutButton>
        </div>
        <div className="mt-20">
          <h2 className="ml-10 text-2xl font-semibold text-headingGreen">
            Preferences
          </h2>
          <ul className="ml-20">
            {typesArr.map((item) => (
              <li key={item}>
                <h3 className="mb-3 mt-5 text-xl font-semibold text-headingGreen">
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </h3>
                <ul className="ml-5">
                  {preferences
                    ?.filter(
                      (pref, index, self) =>
                        index === self.findIndex((p) => p.name === pref.name),
                    )
                    .map((pref) =>
                      pref.type === item ? (
                        <li key={pref.name} className="mb-2">
                          {pref.name.charAt(0).toUpperCase() +
                            pref.name.slice(1)}
                        </li>
                      ) : null,
                    )}
                </ul>
              </li>
            ))}
          </ul>
        </div>
        <Button className="ml-10 mt-5">
          <Link to="/home/preferences">Edit Preferences</Link>
        </Button>
      </div>
    )
}

export default Profile
