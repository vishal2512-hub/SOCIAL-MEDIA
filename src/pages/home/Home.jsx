import React from 'react'
import "./home.scss"
import Stories from '../../component/stories/Stories'
import Posts from '../../component/Posts/Posts'
import Post from '../../component/post/Post'
import RightBar from '../../component/rightbar/RIghtbar'

const Home = () => {
  return (
  <><div className='home'>
      <Stories />
      <Posts />
      <Post />
    </div>
  </>
  )
}

export default Home
