import { makeStyles } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import { Auth } from 'aws-amplify'
import Routes from './Router'
import Loader from './Loader'



const useStyles = makeStyles({
  wrapper: {
    width: '100%',
    height: 250,
    paddingTop: 200
  }
})



function App () {
  const [user, setUser] = useState(null)
  const [authenticating, setAuthenticating] = useState(true)
  const c = useStyles()


  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then(data => { setUser(data.attributes) })
      .catch(error => { console.log(error) })
      .finally(() => { setAuthenticating(false) })
  }, [])

  const updateUserState = async user => {
    setUser(user)
  }

  return (
    authenticating ? (
      <div className={c.wrapper}>
        <Loader size={60}/>
      </div>
    ) : (
      <Routes
        user={user}
        updateUserState={updateUserState}
      />
    )
  )
}


export default App
