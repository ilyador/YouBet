/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'
import { API, Auth, graphqlOperation as operation } from 'aws-amplify'
import { createUser } from '../graphql/mutations'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Link from '@material-ui/core/Link'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import SyncIcon from '@material-ui/icons/Sync'


const useStyles = makeStyles(theme => ({
  uploadingIcon: {
    marginRight: theme.spacing(1),
    animation: 'rotating 2s linear infinite'
  },
  container: {
    paddingTop: theme.spacing(4)
  },
  formControl: {
    minWidth: theme.spacing(16),
  },
  select: {
    width: '100%'
  },
  link: {
    width: '100%'
  },
  button: {
    margin: [theme.spacing(2), 0, theme.spacing(1)]
  },
  signupLinkButton: {
    margin: [0, 0, theme.spacing(10)]
  },
  error: {
    color: theme.palette.error.main,
    textAlign: 'center',
    direction: 'ltr'
  },
  title: {
    marginBottom: theme.spacing(2),
    textAlign: 'center'
  }
}))


function Login ({ updateUserState, location }) {
  const c = useStyles()
  const [signUpStep, setSignUpStep] = useState(0)
  const [loginError, setLoginError] = useState(null)
  const [notVerified, setNotVerified] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    email: '',
    given_name: '',
    password: '',
    password2: '',
    authenticationCode: '',
  })


  useEffect(() => {
    if (location.search === '?signup') setSignUpStep(1)
  }, [])

  const handleChange = event => {
    const name = event.target.name
    const value = event.target.value
    setForm(oldForm => ({ ...oldForm, [name]: value }))
  }


  const handleSignUp = async event => {
    event.preventDefault()
    setLoginError(null)
    setSubmitting(true)

    const {
      password,
      email: username
    } = form

    Auth.signUp({
      username,
      password
    })
      .then(() => {
        setLoginError(null)
        setSubmitting(false)
        setSignUpStep(2)
      })
      .catch(error => {
        setSubmitting(false)
        setLoginError(error.message)
      })
  }


  const handleSignIn = async event => {
    event.preventDefault()
    setLoginError(null)
    setSubmitting(true)

    try {
      const user = await Auth.signIn(form.email, form.password)
      updateUserState(user.attributes)
    } catch (error) {
      setSubmitting(false)
      setLoginError(error.message)

      if (error.code === 'UserNotConfirmedException') {
        setNotVerified(true)
        Auth.resendSignUp(form.email)
      }
    }
  }


  const handleVerification = async event => {
    event.preventDefault()
    setLoginError(null)
    setSubmitting(true)

    const {
      password,
      email,
      authenticationCode: code
    } = form

    try {
      await Auth.confirmSignUp(email, code)
      const user = await Auth.signIn(email, password)
      updateUserState(user.attributes)
      setUserInDB(user.attributes.sub)
    } catch (error) {
      setSubmitting(false)
      setLoginError(error.message)
    }
  }


  const handleAuthentication = async event => {
    event.preventDefault()
    setLoginError(null)
    setSubmitting(true)

    const { email: username, authenticationCode, password } = form
    try {
      await Auth.confirmSignUp(username, authenticationCode)
      const user = await Auth.signIn(username, password)
      updateUserState(user.attributes)
      setUserInDB(user.attributes.sub)
    } catch (error) {
      setSubmitting(false)
      setLoginError(error.message)
    }
  }


  function setUserInDB(id) {
    const input = {
      id,
      name: form.given_name,
    }

    API.graphql(operation(createUser, { input }))
  }


  const goToLogin = () => {setSignUpStep(0)}
  const goToSignup = () => {setSignUpStep(1)}
  const goToVerify = () => {
    setLoginError(null)
    setSignUpStep(3)
  }



  const loginForm = (
    <>
      <Typography variant='h3' className={c.title}>
        Login
      </Typography>

      <form onSubmit={handleSignIn}>

        <TextField
          required
          fullWidth
          label='Email'
          name='email'
          value={form.email}
          onChange={handleChange}
          margin='normal'
          variant='outlined'
        />
        <TextField
          required
          fullWidth
          label='Password'
          type='password'
          name='password'
          value={form.password}
          onChange={handleChange}
          margin='normal'
          variant='outlined'
        />
        {loginError && (
          <Typography variant='body1' className={c.error}>
            {loginError}
          </Typography>
        )}

        {notVerified && (<Link
          className={c.link}
          component='button'
          variant='body2'
          onClick={goToVerify}
        >
          get new code.
        </Link>)}

        <Button
          disabled={submitting}
          fullWidth
          className={c.button}
          type='submit'
          variant='contained'
          color='primary'
          size='large'
        >
          Login
          {submitting && <SyncIcon className={c.uploadingIcon}/>}
        </Button>
      </form>

      <Link
        className={c.link}
        component='button'
        variant='body2'
        onClick={goToSignup}
      >
        Don't have an account? Sign up here
      </Link>
    </>
  )


  const signUpForm = (
    <>
      <Typography variant='h3' className={c.title}>
        Sign Up
      </Typography>
      
      <form onSubmit={handleSignUp}>

        <TextField
          required
          fullWidth
          label='email'
          name='email'
          value={form.email}
          onChange={handleChange}
          margin='normal'
          variant='outlined'
        />
        <TextField
          required
          fullWidth
          label='Name'
          name="given_name"
          value={form.given_name}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
        />
        <TextField
          required
          fullWidth
          label='Password'
          type='password'
          name='password'
          value={form.password}
          onChange={handleChange}
          margin='normal'
          variant='outlined'
        />
        <TextField
          required
          fullWidth
          label='Repeat Password'
          type='password'
          name='password2'
          value={form.password2}
          onChange={handleChange}
          margin='normal'
          variant='outlined'
        />
        {loginError && (
          <Typography variant='body1' className={c.error}>
            {loginError}
          </Typography>
        )}
        
        <Button
          disabled={submitting}
          fullWidth
          className={c.button}
          type='submit'
          variant='contained'
          color='primary'
          size='large'
        >
          Sign Up
          {submitting && <SyncIcon className={c.uploadingIcon}/>}
        </Button>
      </form>
      <Link
        className={c.link}
        component='button'
        variant='body2'
        onClick={goToLogin}
      >
        Already registered? Go to login.
      </Link>
    </>
  )


  const resendCodeForm = (
    <>
      <Typography variant='h3' className={c.title}>
        Confirm Signup Code
      </Typography>
      
      <form onSubmit={handleVerification}>

        <TextField
          required
          fullWidth
          label='Code'
          name='authenticationCode'
          value={form.authenticationCode}
          onChange={handleChange}
          margin='normal'
          variant='outlined'
          helperText='Check email for one-time code'
        />
        {loginError && (
          <Typography variant='body1' className={c.error}>
            {loginError}
          </Typography>
        )}

        <Button
          disabled={submitting}
          fullWidth
          className={c.button}
          type='submit'
          variant='contained'
          color='primary'
          size='large'
        >
          Confirm Signup
          {submitting && <SyncIcon className={c.uploadingIcon}/>}
        </Button>
      </form>
    </>
  )


  const confirmForm = (
    <>
      <Typography variant='h3' className={c.title}>
        Confirm Signup
      </Typography>
      <form onSubmit={handleAuthentication}>

        <TextField
          required
          fullWidth
          label='Email'
          name='email'
          value={form.email}
          onChange={handleChange}
          margin='normal'
          variant='outlined'
        />
        <TextField
          required
          fullWidth
          label='Code'
          name='authenticationCode'
          value={form.authenticationCode}
          onChange={handleChange}
          margin='normal'
          variant='outlined'
          helperText='Check email for one-time code'
        />
        {loginError && (
          <Typography variant='body1' className={c.error}>
            {loginError}
          </Typography>
        )}

        <Button
          disabled={submitting}
          fullWidth
          className={c.button}
          type='submit'
          variant='contained'
          color='primary'
          size='large'
        >
          Confirm Signup
          {submitting && <SyncIcon className={c.uploadingIcon}/>}
        </Button>
      </form>
    </>
  )



  return (
    <Container maxWidth='xs' className={c.container}>
      {signUpStep === 0 && loginForm}
      {signUpStep === 1 && signUpForm}
      {signUpStep === 2 && confirmForm}
      {signUpStep === 3 && resendCodeForm}
    </Container>
  )
}


export default Login
