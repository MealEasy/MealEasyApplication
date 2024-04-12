import React from 'react'

export default function WeekPlan() {
  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]

  return (
    <div>
      <h1 className="mb-4 text-center text-2xl font-bold">Your Week</h1>
      <div className="flex flex-col items-start">
        {daysOfWeek.map((day, index) => (
          <div key={index} className="mb-10 flex h-36">
            <div className="w-44">
              <h2 className="text-xl font-semibold">{day}</h2>
            </div>
            <div className=" card card-side  h-28 w-80 bg-base-100 shadow-xl">
              <figure>
                <img
                  src="https://img.taste.com.au/3mYHXsD_/taste/2016/11/sushi-for-kids-81300-1.jpeg"
                  alt="Movie"
                  className="h-12 w-10"
                />
              </figure>
              <div className="card-body">
                <h2 className="card-title text-lg">Meal Name!</h2>
                <div className="card-actions justify-end">
                  <button>Recipe Detail</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
