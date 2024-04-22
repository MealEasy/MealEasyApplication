import React from 'react'
import Signup from '../components/Signup'
import Login from '../components/Login'
import ImageFrontPage from '../components/ImageFrontPage'

const ImageTextSection = ({ src, alt, text }) => (
  <div className="mb-8 flex w-full flex-col items-center sm:mb-0 sm:w-1/3">
    <ImageFrontPage src={src} alt={alt} className="w-3/4" />
    <p className=" mt-5 text-center font-bold">{text}</p>
  </div>
)

function Landing() {
  return (
    <div className="landing-body  h-auto w-screen">
      {/* <div className="flex justify-end">
        <div className="mr-10 mt-10"></div>
      </div> */}
      <div className=" mt-20 flex flex-col items-center justify-center sm:mt-40">
        <img
          src="/images/blackLogo.png"
          alt="MealEasy Logo"
          className=" w-1/3 "
        />
        <div className="mt-20 flex space-x-4">
          <Signup />
          <Login />
        </div>
        <div className="mt-20 flex flex-wrap justify-center sm:mt-24">
          <ImageTextSection
            src="/images/recipebook.jpg"
            alt="recipe book"
            text="All your recipes in one place!"
          />
          <ImageTextSection
            src="/images/dinnertable.jpg"
            alt="dinner table"
            text="More time to relax with the family!"
          />
          <ImageTextSection
            src="/images/shopping.jpg"
            alt="shopping"
            text="Shopping lists made easy!"
          />
        </div>
      </div>
    </div>
  )
}

export default Landing
